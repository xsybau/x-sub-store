# Contributing to X-SUB-Store

Thanks for contributing to X-SUB-Store. This guide is meant to help you ship high-quality changes quickly and safely.

## Scope

This project is a secure, Docker-first V2Ray subscription hub built with:

- Nuxt 4 + Nitro
- Nuxt UI + Tailwind
- MongoDB + Mongoose
- Bun runtime/package manager

## Prerequisites

- Docker + Docker Compose
- Git

## Local Setup

1. Fork and clone the repository.
2. Create your environment file:

```bash
cp .env.example .env
```

3. Start the dev stack:

```bash
docker compose -f compose.dev.yml up -d
```

4. Start Nuxt dev manually inside the running `app` service container:

```bash
docker compose -f compose.dev.yml exec app bun run dev --host 0.0.0.0 --port 3000
```

Notes:
- App URL: `https://localhost/admin` (Traefik self-signed TLS) or `http://localhost:3000/admin` for direct dev access.

## Project Structure Rules

Do not restructure core folders unless explicitly discussed first.

- App-facing Nuxt code lives in `app/`:
  - `app/pages`, `app/layouts`, `app/components`, `app/composables`, `app/middleware`, `app/plugins`, `app/assets`
- Domain/server code stays at repository root:
  - `modules/`, `i18n/`, `server/`, `tests/`, `scripts/`, `public/`

### Frontend Routing Pattern

Keep pages thin. Route files should orchestrate and delegate UI to module screens.

- `app/pages/admin/users/index.vue` -> `modules/AdminUsers/screens/UsersListScreen.vue`
- `app/pages/admin/users/[id].vue` -> `modules/AdminUsers/screens/UserDetailsScreen.vue`
- `app/pages/admin/tags/index.vue` -> `modules/AdminUsers/screens/TagsListScreen.vue`
- `app/pages/admin/tags/[id].vue` -> `modules/AdminUsers/screens/TagDetailsScreen.vue`
- `app/pages/admin/settings.vue` -> `modules/AdminSettings/screens/SettingsScreen.vue`

## Coding Standards

- Keep changes focused and small.
- Use TypeScript with explicit types; avoid `any`.
- Do not silence lint/type errors with blanket disables.
- Use Nuxt UI as the component system (do not add Vuetify).
- Keep domain logic out of dumb UI components.
- Keep API response shapes stable unless a breaking change is intentional and documented.
- Never commit secrets or private keys.

## i18n Rules (When Touching UI Text)

- Supported locales: `en` (default), `fa`, `ru`, `zh`.
- Keep route paths unchanged (no locale URL prefixes).
- English is the source-of-truth keyset.
- Keep locale key parity across all language files.

## Quality Gates (Required Before PR)

Run inside the `app` service container:

```bash
docker compose -f compose.dev.yml exec app bun run lint
docker compose -f compose.dev.yml exec app bun run build
docker compose -f compose.dev.yml exec app bun test
```

For full lint without cache:

```bash
docker compose -f compose.dev.yml exec app bun run lint:full
```

## Branches, Commits, and PRs

### Branch Naming (recommended)

- `feat/<short-topic>`
- `fix/<short-topic>`
- `refactor/<short-topic>`
- `docs/<short-topic>`

### Commit Messages

Use Conventional Commits:

- `feat(admin-users): add token copy action`
- `fix(i18n): handle missing locale cookie`
- `docs(readme): update Nuxt 4 app directory notes`

### Pull Request Checklist

- Explain the problem and the solution clearly.
- Link related issue(s).
- Include screenshots/videos for UI changes.
- Call out breaking changes explicitly.
- Update docs when behavior/commands/structure changed.
- Confirm lint, build, and tests pass.

## Security Reporting

If you find a security issue, do not post exploit details publicly. Use a private disclosure channel with maintainers when possible.

## License

By contributing, you agree your contributions are licensed under the project license (Apache License 2.0).
