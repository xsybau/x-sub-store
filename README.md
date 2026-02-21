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
2. `cp .env.example .env` and edit it.
3. Start the dev stack:
   ```bash
   docker compose -f compose.dev.yml up -d
   ```
4. The `ss-app` container intentionally does not auto-run Nuxt dev.
5. Install dependencies and run Nuxt dev manually inside the app container:
   ```bash
   docker exec -it ss-app ash
   bun install
   bun dev
   ```
6. Create an admin user (in another terminal):
   ```bash
   docker compose -f compose.dev.yml exec app bun run scripts/create-admin.ts --email admin@example.com --password secret
   ```
7. Access:
   - `https://localhost/admin` (through Nginx + local certs)
   - `http://localhost:3000/admin` (direct Nuxt dev server)
   - `http://localhost/subs/<token>` (plain HTTP subscription endpoint for local clients)

## Local HTTPS (Deploy-Like)

Use the standalone dev stack:

```bash
docker compose -f compose.dev.yml up -d
```

This runs `app`, `mongo`, and `nginx` services with local certs from `nginx/cert-local`.
`DEV_DOMAIN` defaults to `localhost` (override if needed, e.g. `DEV_DOMAIN=api.localhost`).
Nuxt source is mounted for hot reload. Dependency cache, Nuxt/Nitro cache, and MongoDB data are persisted in Docker volumes.

Start dev server manually:

```bash
docker exec -it ss-app ash
bun install
bun dev
```

Notes:
- Local certs in `nginx/cert-local` are development certs; desktop clients may reject them with `UntrustedRoot`.
- For local subscription import, use `http://localhost/subs/<token>` or set `NUXT_PUBLIC_SUBSCRIPTION_BASE_URL=http://localhost`.
- In production, use a publicly trusted certificate and HTTPS URLs.

## Production Deployment

1. Set `DOMAIN` and `EMAIL` in `.env`.
2. Initialize SSL certificates:
   ```bash
   chmod +x ops/ssl/init.sh
   ./ops/ssl/init.sh
   ```
3. Build and start production stack:
   ```bash
   docker compose -f compose.yml up -d --build
   ```
4. For normal restarts, do not rebuild:
   ```bash
   docker compose -f compose.yml up -d
   ```
5. MongoDB data is persisted in a named Docker volume.
6. The app will be available at `https://your-domain.com`.

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

Preferred workflow uses the running app container.

- Lint + typecheck:
  ```bash
  docker exec ss-app bun run lint
  ```
- Full lint (no ESLint cache) + typecheck:
  ```bash
  docker exec ss-app bun run lint:full
  ```
- Build:
  ```bash
  docker exec ss-app bun run build
  ```
- Tests:
  ```bash
  docker exec ss-app bun test
  ```

## Architecture

- **Backend**: Nuxt 4 (Nitro)
- **Database**: MongoDB (Mongoose)
- **Frontend**: Nuxt UI (Tailwind)
- **Runtime**: Bun
- **Security**: Argon2 hashing, AES-256-GCM token encryption, and H3 sessions.
