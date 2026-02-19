# V2Ray Subscription Hub

A Docker-first, secure V2Ray subscription aggregator and management system.

## Features
- **Centralized Hub**: Merge multiple subscriptions (Hiddify, Xray, etc.) into one.
- **Admin Panel**: Manage users, upstream sources, and static nodes.
- **Secure**: Per-user secret tokens, no public signup, encrypted token storage.
- **Performance**: Caching, concurrent fetching, deduplication.
- **Docker First**: Easy deployment with Nginx and SSL automation.

## Quick Start (Dev)

1. Clone the repo.
2. `cp .env.example .env` and edit it.
3. Start the stack:
   ```bash
   docker compose -f compose.dev.yml up -d --build
   ```
4. Start Nuxt dev server inside the app container:
   ```bash
   docker exec -it ss-app ash
   bun dev
   ```
5. Create an admin user (in another terminal):
   ```bash
   docker compose -f compose.dev.yml exec app bun run scripts/create-admin.ts --email admin@example.com --password secret
   ```
6. Access:
   - `https://localhost/admin` (through Nginx + local certs)
   - `http://localhost:3000/admin` (direct Nuxt dev server)

## Local HTTPS (Deploy-Like)

Use the standalone dev stack:

```bash
docker compose -f compose.dev.yml up -d --build
```

This runs a separate dev composition (`app`, `mongo`, `nginx`) and uses local certs from `nginx/cert-local`.
`DEV_DOMAIN` defaults to `localhost` (override it if needed, e.g. `DEV_DOMAIN=api.localhost`).
Nuxt source is mounted; run `bun dev` manually inside `ss-app` for hot reload.

Access:
- `https://localhost/admin`

## Production Deployment

1. Set `DOMAIN` and `EMAIL` in `.env`.
2. Initialize SSL certificates:
   ```bash
   chmod +x ops/ssl/init.sh
   ./ops/ssl/init.sh
   ```
3. Start production stack:
   ```bash
   docker compose -f compose.yml up -d --build
   ```
4. The app will be available at `https://your-domain.com`.

## Management

### Managing Users
- Login to Admin Panel.
- Create users. Each user gets a unique Subscription URL.
- Give this URL to the user for their V2Ray client (v2rayNG, V2Box, etc.).

### Managing Upstreams
- **Global**: Applies to ALL users.
- **User**: Applies to specific user only.
- Supports raw text lists or base64 subscription links.

### Token Rotation
- In User details, click "Rotate Token" to invalidate the old URL and generate a new one immediately.

## Development

- Run `bun install`
- Run `bun dev` for local dev server (requires local Mongo).
- Run `bun test` for unit tests.

## Architecture

- **Backend**: Nuxt 3 (Nitro)
- **Database**: MongoDB (Mongoose)
- **Frontend**: Nuxt UI (Tailwind)
- **Security**: Argon2 hashing, AES-256-GCM token encryption, H3 sessions.
