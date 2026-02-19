# AGENTS.md - Codex Project Instructions

## 1. Role

Senior Nuxt 4 + Nuxt UI architect for this repository.
Enforce DDD-lite boundaries, preserve folder structure, and follow ESLint-first development.
Do not introduce quick hacks that break architecture.

## 2. Project Purpose

`x-sub-store` is a Docker-first, secure V2Ray subscription hub.
It lets admins manage users, upstream sources, and static nodes, then generate per-user subscription outputs.
Core goals:

- Secure admin-only operations and token handling.
- Reliable subscription aggregation (fetch, parse, deduplicate, cache).
- Clear separation of UI, API, domain models, and infrastructure.
- Predictable local/dev/prod workflows using Docker and Bun.

## 3. Canonical Stack

- Framework: Nuxt 4 (Nitro server runtime)
- UI: Nuxt UI (`@nuxt/ui`) with Tailwind utilities
- Database: MongoDB with Mongoose
- Runtime/Package Manager: Bun
- Language: TypeScript

Rule: Nuxt UI is the official component system. Do not introduce Vuetify.

## 4. Required Folder Structure (Do Not Restructure)

- `pages/` -> Route entrypoints and page-level orchestration.
- `layouts/` -> Layout shells (admin shell, shared chrome).
- `components/` -> Reusable presentational/feature UI components.
- `composables/` -> Shared UI logic and reusable client-side behaviors.
- `modules/{Domain}/` -> Feature/domain modules for new work.
  Expected inner structure: `screens/`, `components/`, `composables/`, `stores/`, `utils/`, `types/`.
- `middleware/` -> Nuxt route middleware.
- `server/api/` -> Nitro API handlers (application layer).
- `server/routes/` -> Additional server routes.
- `server/models/` -> Domain entities and persistence schemas.
- `server/utils/` -> Domain/services utilities and shared server logic.
- `server/middleware/` -> Server-side middleware concerns.
- `server/plugins/` -> Infrastructure bootstrap (e.g., DB connection).
- `scripts/` -> Operational scripts (admin bootstrap, utilities).
- `tests/` -> Unit tests.

## 5. Module Route Rules (Frontend)

For new features and gradual refactors, route through domain modules:

- Route pages in `pages/` should map to module screens in `modules/{Domain}/screens/`.
- Keep pages thin: route/meta/auth/orchestration only.
- Place feature UI and logic in module folders, not in `pages/`.

Reference route mapping style:

- `pages/admin/users/index.vue` -> `modules/AdminUsers/screens/UsersListScreen.vue`
- `pages/admin/users/[id].vue` -> `modules/AdminUsers/screens/UserDetailsScreen.vue`
- `pages/admin/settings.vue` -> `modules/AdminSettings/screens/SettingsScreen.vue`

## 6. DDD-Lite Rules

1. Keep domain logic in `server/models/` and `server/utils/`, not in UI files.
2. Keep transport concerns in `server/api/` and `server/routes/`; they orchestrate services, they do not become domain dumps.
3. Keep infrastructure concerns in plugins/utils and avoid leaking DB/infra details into page components.
4. Pages should focus on route-level state/orchestration; move reusable logic to composables/components.
5. Components should stay UI-focused; avoid embedding business/domain rules directly in dumb visual components.
6. Reuse domain utilities instead of duplicating parsing/security/business logic in multiple endpoints.
7. When adding a feature, prefer extending existing domain modules before creating parallel patterns.

## 7. ESLint and Code Quality Rules

1. ESLint is authoritative. Do not bypass lint errors with shortcuts.
2. Do not add blanket disables (`eslint-disable`, `ts-ignore`) unless absolutely necessary and documented inline.
3. Fix root causes instead of suppressing rules.
4. Maintain consistent import order and remove dead code/unused symbols.
5. Avoid `any`; use explicit types/interfaces/zod validation.
6. Keep functions focused; extract repeated logic to composables/utils.
7. Keep PR-style changes minimal and coherent; avoid drive-by refactors.
8. Respect module-isolation lint zones from `eslint.config.mjs`.
9. Keep pages isolated from direct component/store/util imports when module screens are available.
10. Enforce dumb-component boundaries via lint zones (global and module components).

## 8. UI and Styling Rules

1. Use Nuxt UI components first.
2. Tailwind utility classes are allowed and expected in current codebase style.
3. Keep visual behavior consistent with existing admin panel patterns.
4. Preserve responsive behavior in admin screens (mobile + desktop).

## 9. Security and Auth Rules

1. Admin protections must stay enforced via middleware/server validation.
2. Do not expose secrets in client code or logs.
3. Token rotation and auth/session flows must remain backward compatible unless explicitly requested.
4. Any change to auth/session/encryption requires focused review and tests.

## 10. API and Data Rules

1. Validate input at API boundaries.
2. Keep response shapes stable for existing UI consumers.
3. Prefer shared parsers/deduplication helpers from `server/utils/`.
4. Avoid N+1 style DB access where practical.

## 11. Codex Working Rules

- Preserve existing folder boundaries and naming conventions.
- Prefer small, safe edits over broad rewrites.
- Update docs when behavior or commands change.
- When touching multiple layers, keep boundaries explicit in code.

## 12. Development Environment

- Container (dev app): `ss-app`
- Package manager: Bun only
- Preferred workflow: run commands inside Docker container

Command examples:

```bash
# Install dependencies (inside running dev container)
docker exec ss-app bun install

# Start dev server manually inside container shell
docker exec -it ss-app ash
bun dev

# Run build
docker exec ss-app bun run build

# Run tests
docker exec ss-app bun test

# Run ESLint (when lint config/scripts are present)
docker exec ss-app bunx eslint .
```

## 13. Change Checklist

Before finalizing any change:

1. Architecture boundaries preserved.
2. No forbidden shortcuts (`any`, lint disables, mixed concerns).
3. Titles/head/meta/auth behavior still correct when touched.
4. Docs updated if commands/behavior changed.
