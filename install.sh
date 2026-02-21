#!/usr/bin/env bash
set -Eeuo pipefail

XSUB_REPO_URL="${XSUB_REPO_URL:-https://github.com/xsybau/x-sub-store.git}"
XSUB_REF="${XSUB_REF:-main}"
XSUB_INSTALL_DIR="${XSUB_INSTALL_DIR:-/opt/x-sub-store}"

SCRIPT_NAME="$(basename "$0")"

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

if [[ "$(uname -s)" != "Linux" ]]; then
  die "This installer supports Linux servers only."
fi

if [[ "$(id -u)" -eq 0 ]]; then
  SUDO_BIN=""
else
  SUDO_BIN="$(command -v sudo || true)"
  [[ -n "$SUDO_BIN" ]] || die "sudo is required when running as a non-root user."
fi

as_root() {
  if [[ -z "$SUDO_BIN" ]]; then
    "$@"
  else
    "$SUDO_BIN" "$@"
  fi
}

if [[ "$(id -u)" -eq 0 ]]; then
  if [[ -n "${SUDO_USER:-}" && "${SUDO_USER:-}" != "root" ]]; then
    RUN_USER="$SUDO_USER"
  else
    RUN_USER="root"
  fi
else
  RUN_USER="$(id -un)"
fi

run_as_user() {
  if [[ "$(id -u)" -eq 0 && "$RUN_USER" != "root" ]]; then
    sudo -u "$RUN_USER" -H "$@"
  else
    "$@"
  fi
}

PKG_MANAGER=""
detect_pkg_manager() {
  if command -v apt-get >/dev/null 2>&1; then
    PKG_MANAGER="apt"
  elif command -v dnf >/dev/null 2>&1; then
    PKG_MANAGER="dnf"
  elif command -v yum >/dev/null 2>&1; then
    PKG_MANAGER="yum"
  elif command -v zypper >/dev/null 2>&1; then
    PKG_MANAGER="zypper"
  elif command -v apk >/dev/null 2>&1; then
    PKG_MANAGER="apk"
  else
    die "Unsupported package manager. Install git and Docker manually, then rerun."
  fi
}

install_package() {
  local package_name="$1"
  case "$PKG_MANAGER" in
    apt)
      as_root apt-get update -y
      as_root apt-get install -y "$package_name"
      ;;
    dnf)
      as_root dnf install -y "$package_name"
      ;;
    yum)
      as_root yum install -y "$package_name"
      ;;
    zypper)
      as_root zypper --non-interactive install "$package_name"
      ;;
    apk)
      as_root apk add --no-cache "$package_name"
      ;;
    *)
      die "Unable to install package: $package_name"
      ;;
  esac
}

ensure_command() {
  local command_name="$1"
  local package_name="$2"
  if ! command -v "$command_name" >/dev/null 2>&1; then
    log "Installing missing dependency: $package_name"
    install_package "$package_name"
  fi
}

detect_pkg_manager
ensure_command git git
ensure_command curl curl

if ! command -v docker >/dev/null 2>&1; then
  log "Docker is not installed. Installing with the official Docker installer."
  docker_install_script="$(mktemp)"
  trap 'rm -f "$docker_install_script"' EXIT
  curl -fsSL https://get.docker.com -o "$docker_install_script"
  as_root sh "$docker_install_script"
  rm -f "$docker_install_script"
  trap - EXIT
fi

if command -v systemctl >/dev/null 2>&1; then
  as_root systemctl enable --now docker >/dev/null 2>&1 || warn "Could not enable/start docker with systemctl."
fi

if [[ "$RUN_USER" != "root" ]]; then
  as_root usermod -aG docker "$RUN_USER" >/dev/null 2>&1 || warn "Could not add $RUN_USER to the docker group."
fi

if ! docker compose version >/dev/null 2>&1; then
  if ! as_root docker compose version >/dev/null 2>&1; then
    die "Docker Compose plugin is missing. Install it and rerun."
  fi
fi

parent_dir="$(dirname "$XSUB_INSTALL_DIR")"
as_root mkdir -p "$parent_dir"
as_root mkdir -p "$XSUB_INSTALL_DIR"
if [[ "$RUN_USER" != "root" ]]; then
  as_root chown -R "$RUN_USER:$RUN_USER" "$XSUB_INSTALL_DIR"
fi

if [[ -d "$XSUB_INSTALL_DIR/.git" ]]; then
  log "Updating existing repository at $XSUB_INSTALL_DIR"
  if [[ -n "$(run_as_user git -C "$XSUB_INSTALL_DIR" status --porcelain)" ]]; then
    die "Repository at $XSUB_INSTALL_DIR has uncommitted changes. Commit/stash them and rerun."
  fi

  run_as_user git -C "$XSUB_INSTALL_DIR" fetch --prune --tags origin
  if run_as_user git -C "$XSUB_INSTALL_DIR" show-ref --verify --quiet "refs/remotes/origin/$XSUB_REF"; then
    run_as_user git -C "$XSUB_INSTALL_DIR" checkout -B "$XSUB_REF" "origin/$XSUB_REF"
  else
    run_as_user git -C "$XSUB_INSTALL_DIR" checkout "$XSUB_REF"
  fi
else
  if [[ -n "$(find "$XSUB_INSTALL_DIR" -mindepth 1 -maxdepth 1 2>/dev/null)" ]]; then
    die "$XSUB_INSTALL_DIR exists and is not a git repository. Use an empty directory or remove existing files."
  fi

  log "Cloning repository into $XSUB_INSTALL_DIR"
  if ! run_as_user git clone --depth 1 --branch "$XSUB_REF" "$XSUB_REPO_URL" "$XSUB_INSTALL_DIR"; then
    warn "Shallow clone failed for ref '$XSUB_REF'. Retrying with full clone."
    run_as_user git clone "$XSUB_REPO_URL" "$XSUB_INSTALL_DIR"
    run_as_user git -C "$XSUB_INSTALL_DIR" checkout "$XSUB_REF"
  fi
fi

if [[ ! -f "$XSUB_INSTALL_DIR/scripts/install-server.sh" ]]; then
  die "Missing scripts/install-server.sh in repository."
fi

run_as_user chmod +x "$XSUB_INSTALL_DIR/install.sh" "$XSUB_INSTALL_DIR/scripts/install-server.sh"

log "Starting production setup flow..."
run_as_user bash "$XSUB_INSTALL_DIR/scripts/install-server.sh"

