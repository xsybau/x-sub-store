#!/usr/bin/env bash
set -Eeuo pipefail

SCRIPT_NAME="$(basename "$0")"
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd -- "${SCRIPT_DIR}/.." && pwd)"
ENV_FILE="$PROJECT_ROOT/.env"
COMPOSE_FILE="$PROJECT_ROOT/compose.yml"

log() {
  printf '[%s] %s\n' "$SCRIPT_NAME" "$*"
}

warn() {
  printf '[%s] WARN: %s\n' "$SCRIPT_NAME" "$*" >&2
}

die() {
  printf '[%s] ERROR: %s\n' "$SCRIPT_NAME" "$*" >&2
  exit 1
}

require_file() {
  local file_path="$1"
  [[ -f "$file_path" ]] || die "Required file not found: $file_path"
}

cd "$PROJECT_ROOT"

require_file "$COMPOSE_FILE"
require_file "$PROJECT_ROOT/scripts/setup-env.ts"
require_file "$PROJECT_ROOT/scripts/create-admin.ts"
require_file "$PROJECT_ROOT/.env.example"

if ! command -v docker >/dev/null 2>&1; then
  die "docker command is not available."
fi

DOCKER_CMD=("docker")
if ! docker info >/dev/null 2>&1; then
  if command -v sudo >/dev/null 2>&1 && sudo docker info >/dev/null 2>&1; then
    DOCKER_CMD=("sudo" "docker")
  else
    die "Docker daemon is not accessible. Ensure Docker is running and your user has access."
  fi
fi

run_docker() {
  "${DOCKER_CMD[@]}" "$@"
}

run_compose() {
  "${DOCKER_CMD[@]}" compose -f "$COMPOSE_FILE" "$@"
}

if ! run_compose version >/dev/null 2>&1; then
  die "Docker Compose plugin is unavailable."
fi

TTY_FLAGS=("-i")
if [[ -t 0 && -t 1 ]]; then
  TTY_FLAGS=("-it")
fi

log "Running environment setup..."
run_docker run --rm "${TTY_FLAGS[@]}" \
  -u "$(id -u):$(id -g)" \
  -v "$PROJECT_ROOT:/app" \
  -w /app \
  oven/bun:1-alpine \
  bun scripts/setup-env.ts

[[ -f "$ENV_FILE" ]] || die ".env was not created."

get_env_value() {
  local key="$1"
  local line
  line="$(grep -E "^${key}=" "$ENV_FILE" | tail -n 1 || true)"
  if [[ -z "$line" ]]; then
    printf ''
  else
    printf '%s' "${line#*=}"
  fi
}

set_env_value() {
  local key="$1"
  local value="$2"
  local temp_file

  temp_file="$(mktemp)"
  awk -v env_key="$key" -v env_value="$value" '
    BEGIN { replaced = 0 }
    index($0, env_key "=") == 1 {
      print env_key "=" env_value
      replaced = 1
      next
    }
    { print }
    END {
      if (replaced == 0) {
        print env_key "=" env_value
      }
    }
  ' "$ENV_FILE" >"$temp_file"

  chmod --reference="$ENV_FILE" "$temp_file" 2>/dev/null || true
  mv "$temp_file" "$ENV_FILE"
}

prompt_and_set_if_missing() {
  local key="$1"
  local prompt_message="$2"
  local value

  value="$(get_env_value "$key")"
  while [[ -z "$value" ]]; do
    read -r -p "$prompt_message: " value
    if [[ -z "$value" ]]; then
      echo "Value cannot be empty."
      continue
    fi
    set_env_value "$key" "$value"
  done
}

prompt_and_set_if_missing "TRAEFIK_ACME_EMAIL" "Enter TRAEFIK_ACME_EMAIL"
prompt_and_set_if_missing "TRAEFIK_APP_HOST" "Enter TRAEFIK_APP_HOST"
prompt_and_set_if_missing "TRAEFIK_CERT_MAIN_DOMAIN" "Enter TRAEFIK_CERT_MAIN_DOMAIN"
prompt_and_set_if_missing "TRAEFIK_CERT_SANS" "Enter TRAEFIK_CERT_SANS"
prompt_and_set_if_missing "CF_DNS_API_TOKEN" "Enter CF_DNS_API_TOKEN (required for DNS challenge)"
prompt_and_set_if_missing "APP_IMAGE" "Enter APP_IMAGE"

log "Preparing Traefik ACME storage..."
mkdir -p "$PROJECT_ROOT/infra/traefik/acme"
touch "$PROJECT_ROOT/infra/traefik/acme/acme.json"
chmod 600 "$PROJECT_ROOT/infra/traefik/acme/acme.json"

log "Stopping existing stack..."
run_compose down --remove-orphans || true

is_auth_error() {
  local text="$1"
  if printf '%s' "$text" | grep -Eqi 'unauthorized|denied|authentication required|no basic auth credentials|requested access to the resource is denied'; then
    return 0
  fi
  return 1
}

log "Pulling images..."
set +e
pull_output="$(run_compose pull 2>&1)"
pull_status=$?
set -e
printf '%s\n' "$pull_output"

if [[ "$pull_status" -ne 0 ]]; then
  if is_auth_error "$pull_output"; then
    echo
    log "Registry authentication is required for the configured APP_IMAGE."
    read -r -p "GHCR username: " ghcr_username
    [[ -n "$ghcr_username" ]] || die "GHCR username is required."
    read -r -s -p "GHCR token: " ghcr_token
    echo
    [[ -n "$ghcr_token" ]] || die "GHCR token is required."
    printf '%s' "$ghcr_token" | run_docker login ghcr.io -u "$ghcr_username" --password-stdin
    run_compose pull
  else
    die "docker compose pull failed. Resolve the error and rerun."
  fi
fi

log "Starting stack..."
run_compose up -d

app_container_id=""
for _ in $(seq 1 30); do
  app_container_id="$(run_compose ps -q app | head -n 1)"
  [[ -n "$app_container_id" ]] && break
  sleep 2
done

[[ -n "$app_container_id" ]] || die "Could not find app container after startup."

log "Waiting for app service health..."
max_wait_seconds=300
sleep_seconds=5
elapsed=0

while ((elapsed < max_wait_seconds)); do
  health_state="$(run_docker inspect --format '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' "$app_container_id" 2>/dev/null || true)"
  case "$health_state" in
    healthy)
      break
      ;;
    unhealthy | exited | dead)
      run_compose logs --tail 100 app || true
      die "App became unhealthy (state: $health_state)."
      ;;
    *)
      printf '  - app status: %s (%ss/%ss)\n' "${health_state:-unknown}" "$elapsed" "$max_wait_seconds"
      ;;
  esac
  sleep "$sleep_seconds"
  elapsed=$((elapsed + sleep_seconds))
done

if ((elapsed >= max_wait_seconds)); then
  run_compose logs --tail 100 app || true
  die "Timed out waiting for app health."
fi

app_host="$(get_env_value "TRAEFIK_APP_HOST")"
[[ -n "$app_host" ]] || die "TRAEFIK_APP_HOST is empty in .env."

default_admin_email="admin@$app_host"
read -r -p "Admin email [$default_admin_email]: " admin_email_input
admin_email="${admin_email_input:-$default_admin_email}"

if [[ -t 0 ]]; then
  read -r -s -p "Admin password (leave blank to auto-generate): " admin_password_input
  echo
else
  read -r admin_password_input
fi

generate_password() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -base64 24 | tr -d '\n'
    return
  fi
  LC_ALL=C tr -dc 'A-Za-z0-9' </dev/urandom | head -c 24
}

admin_password="${admin_password_input:-$(generate_password)}"

create_admin() {
  local force_flag="$1"
  if [[ "$force_flag" == "true" ]]; then
    run_compose exec -T app bun run scripts/create-admin.ts --email "$admin_email" --password "$admin_password" --force
  else
    run_compose exec -T app bun run scripts/create-admin.ts --email "$admin_email" --password "$admin_password"
  fi
}

set +e
create_output="$(create_admin "false" 2>&1)"
create_status=$?
set -e
printf '%s\n' "$create_output"

if [[ "$create_status" -ne 0 ]]; then
  if printf '%s' "$create_output" | grep -qi 'already exists'; then
    read -r -p "Admin already exists. Overwrite password for $admin_email? [y/N]: " overwrite_choice
    if [[ "$overwrite_choice" == "y" || "$overwrite_choice" == "Y" ]]; then
      create_admin "true"
    else
      die "Admin setup cancelled."
    fi
  else
    die "Failed to create admin user."
  fi
fi

admin_url="https://$app_host/admin"

echo
echo "Setup complete."
echo "Admin URL: $admin_url"
echo "Admin email: $admin_email"
echo "Admin password: $admin_password"
echo
echo "Useful commands:"
echo "  ${DOCKER_CMD[*]} compose -f $COMPOSE_FILE ps"
echo "  ${DOCKER_CMD[*]} compose -f $COMPOSE_FILE logs -f app"
echo
echo "Firewall note: this installer does not modify firewall rules. Ensure ports 80/443 are reachable."

