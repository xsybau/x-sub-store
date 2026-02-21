# Read In Your Language: [English](README.md) | [فارسی](README.fa.md) | [Русский](README.ru.md) | [中文](README.zh.md)

# X-SUB-Store

X-SUB-Store is a Docker-first, secure V2Ray subscription aggregator and management system.

## Features

- **Centralized Hub**: Merge multiple subscriptions (Hiddify, Xray, etc.) into one.
- **Admin Panel**: Manage users, tags, upstream sources, and static nodes.
- **Tag-Aware Delivery**: Assign multiple tags per user, apply default tags for new users, and attach sources to tags.
- **Operational UX**: Copy per-user subscription URLs from users list and run upstream test checks with live status updates.
- **Secure**: Per-user secret tokens, no public signup, encrypted token storage.
- **Performance**: Caching, concurrent fetching, and deduplication.
- **Docker First**: Easy deployment with Nginx and SSL automation.

## Internationalization (UI)

- Supported UI locales: `en` (default), `fa`, `ru`, `zh`
- Locale routing strategy: no URL prefixes (`/admin/...` stays unchanged)
- Locale switchers are available on:
  - admin layout sidebar
  - admin login screen
- Persian (`fa`) enables RTL direction with mirrored admin shell behavior.
- Scope in this phase is UI text only; backend/API response messages are unchanged.

## Nuxt 4 App Directory Layout

- App-facing Nuxt folders live under `app/`:
  - `app/pages`, `app/layouts`, `app/components`, `app/composables`, `app/middleware`, `app/plugins`, `app/assets`
- Domain/backend boundaries remain at repository root:
  - `modules/`, `i18n/`, `server/`, `scripts/`, `tests/`, `public/`
- Root imports remain valid with compatibility aliases:
  - `~/modules/*`, `~/i18n/*`, `~/server/*`

## Quick Start (Dev)

1. Clone the repo.
2. Create `.env` interactively:
   ```bash
   bun run env:setup
   ```
   This command asks for required values, generates secure secrets, writes `.env`, and prints generated secrets in the terminal.
   If you do not have Bun on your host yet, use `cp .env.example .env` and edit values manually.
3. Start the dev stack:
   ```bash
   docker compose -f compose.dev.yml up -d
   ```
4. Start Nuxt dev manually inside the running `app` service container:
   ```bash
   docker compose -f compose.dev.yml exec app bun run dev --host 0.0.0.0 --port 3000
   ```
5. Create an admin user (in another terminal):
   ```bash
   docker compose -f compose.dev.yml exec app bun run scripts/create-admin.ts --email admin@example.com --password secret
   ```
6. Access:
   - `https://localhost/admin` (through Traefik + auto-generated self-signed cert)
   - `http://localhost:3000/admin` (direct Nuxt dev server)
   - `http://localhost/subs/<token>` (plain HTTP subscription endpoint for local clients)

## Local HTTPS (Deploy-Like)

Use the standalone dev stack:

```bash
docker compose -f compose.dev.yml up -d
```

This runs `traefik`, `app`, and `mongo` services.
`DEV_DOMAIN` defaults to `localhost` (override if needed, e.g. `DEV_DOMAIN=api.localhost`).
Nuxt source is mounted for hot reload, and MongoDB data is persisted for local development.

Notes:
- Traefik automatically serves a development self-signed TLS certificate for `https://localhost`; clients may show `UntrustedRoot`.
- For local subscription import, use `http://localhost/subs/<token>` or set `NUXT_PUBLIC_SUBSCRIPTION_BASE_URL=http://localhost`.
- In production, use a publicly trusted certificate and HTTPS URLs.

## Production Deployment

1. Set `DOMAIN`, `EMAIL`, and `APP_IMAGE` in `.env`.
2. Initialize SSL certificates:
   ```bash
   chmod +x ops/ssl/init.sh
   ./ops/ssl/init.sh
   ```
3. If your GHCR package is private, authenticate on server:
   ```bash
   echo "$GITHUB_TOKEN" | docker login ghcr.io -u <github-username> --password-stdin
   ```
4. Pull the CI-built app image:
   ```bash
   docker compose -f compose.yml pull
   ```
5. Start production stack:
   ```bash
   docker compose -f compose.yml up -d
   ```
6. Deploy updates with:
   ```bash
   docker compose -f compose.yml pull
   docker compose -f compose.yml up -d
   ```
7. MongoDB data is persisted in a named Docker volume.
8. The app will be available at `https://your-domain.com`.

### CI Image Build

- GitHub Actions workflow: `.github/workflows/build-image.yml`
- Push to `main` or a `v*` tag builds and publishes image tags to GHCR:
  - `ghcr.io/<owner>/<repo>:latest` (default branch)
  - `ghcr.io/<owner>/<repo>:vX.Y.Z` (tags)
  - `ghcr.io/<owner>/<repo>:sha-<commit>`

## Management

### Managing Users

- Login to Admin Panel.
- Create users. Each user gets a unique subscription URL.
- Assign tags per user (multi-tag supported). Default tags are automatically applied to new users.
- Use the users list "Copy Subscription URL" action to copy each user's final URL quickly.
- Give this URL to the user for their V2Ray client (v2rayNG, V2Box, etc.).
- Subscription output defaults to raw URL lines (`vless://`, `vmess://`, ...).
- Optional: append `?format=base64` to return base64-encoded content.

### Managing Upstreams

- **Global**: Applies to all users.
- **User**: Applies only to a specific user.
- **Tag**: Applies to users that contain a specific tag.
- Supports raw text lists and base64 subscription links.
- "Test Fetch" updates upstream `Last Status` and `Last Check` values.

### Managing Tags

- Create, edit, and delete tags from the tags page.
- Mark multiple tags as defaults for newly created users.
- Manage tag-scoped upstreams and static nodes from each tag details page.
- Apply a tag to selected users or all existing users.
- Run bulk actions for users in a tag:
  - deactivate accounts
  - rotate tokens
  - delete users

### Token Rotation

- In user details, click "Rotate Token" to invalidate the old URL and generate a new one immediately.

## Development

Preferred workflow uses the running `app` service container.

- Lint + typecheck:
  ```bash
  docker compose -f compose.dev.yml exec app bun run lint
  ```
- Full lint (no ESLint cache) + typecheck:
  ```bash
  docker compose -f compose.dev.yml exec app bun run lint:full
  ```
- Build:
  ```bash
  docker compose -f compose.dev.yml exec app bun run build
  ```
- Tests:
  ```bash
  docker compose -f compose.dev.yml exec app bun test
  ```

## Architecture

- **Backend**: Nuxt 4 (Nitro)
- **Database**: MongoDB (Mongoose)
- **Frontend**: Nuxt UI (Tailwind)
- **Runtime**: Bun
- **Security**: Argon2 hashing, AES-256-GCM token encryption, and H3 sessions.
