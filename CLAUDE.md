# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Starter for the "AI Engineering Applied Lab": a full-stack boilerplate (NestJS + React) where the AI logic is deliberately left unimplemented for participants to build starting week 2. Look for `TODO(participante)` markers — they mark intentional gaps, not bugs.

## Commands

Run from the repo root unless noted.

```bash
pnpm install
pnpm db:up                                  # Postgres via docker-compose
cp backend/.env.example backend/.env        # then set JWT_SECRET
pnpm migration:run
pnpm dev                                    # backend :3000 + frontend :5173, both in watch mode
```

- `pnpm build` / `pnpm test` / `pnpm lint` — run across both workspaces (`pnpm -r`)
- `pnpm db:up` / `pnpm db:down` — Postgres container (docker-compose.yml at root)
- `pnpm migration:run` — run pending TypeORM migrations
- `pnpm migration:generate src/database/migrations/<Name>` — from `backend/`, generate a migration from entity changes. Migrations are CLI-only; never enable `synchronize`.

Single package / single test:
- Backend unit test: `cd backend && pnpm test -- <pattern>` (Jest, picks up `*.spec.ts`)
- Backend e2e: `cd backend && pnpm test:e2e`
- Backend single file in watch: `cd backend && pnpm test:watch -- auth.service`
- Frontend has no test runner configured yet.

The frontend dev server proxies `/api` to `localhost:3000` (see `frontend/vite.config.ts`); it needs no `.env` of its own.

## Architecture

**Monorepo**: pnpm workspaces, two packages — `backend` (NestJS) and `frontend` (React/Vite). The frontend depends on `backend` as a workspace package (`"backend": "workspace:../backend"`) solely to import backend-exported types (e.g. `ApiCompletionResult`) — see `backend/package.json`'s `exports` field, which only exposes type declarations from `dist`.

**Backend module layout** (`backend/src/`):
- `Controller → Service → Repository port → Infrastructure adapter`. Domain code depends on ports/interfaces, never on TypeORM entities or SDK clients directly.
- `users/` shows the reference pattern: `domain/user.model.ts` (plain `User` interface) + `domain/user-repository.port.ts` (interface, injected via `USER_REPOSITORY` symbol) vs. `infrastructure/user.entity.ts` (TypeORM entity, snake_case columns) + `infrastructure/user-typeorm.repository.ts` (implements the port, maps entity ↔ domain model). TypeORM entities never leave the infrastructure layer.
- `ai/` is the extension point for the lab: `domain/ai-provider.port.ts` defines `AiProvider` (a `complete()` method) and `AiProviderName`. `ai-provider.registry.ts` holds one `AiProvider` per name; `infrastructure/openai.provider.ts` and `infrastructure/anthropic.provider.ts` are the concrete SDK-backed adapters. Domain/application code should only ever depend on `AiProviderRegistry`/`AiProvider`, never import `openai` or `@anthropic-ai/sdk` outside `ai/infrastructure`.
- `auth/` is intentionally minimal: login by `email` + `displayName`, no password, issues a JWT (see comment in `auth.service.ts`) — not meant for production use as-is.
- `config/` — one file per namespace (`app.config.ts`, `database.config.ts`, `auth.config.ts`) registered via `@nestjs/config`'s `registerAs`, plus `env.validation.ts` (Joi schema) enforced at bootstrap. Services must read env vars through `ConfigService`, never `process.env` directly (the AI provider adapters are the current exception, flagged for week 2).
- `database/data-source.ts` is used only by the TypeORM CLI for migrations; the running app configures TypeORM via `TypeOrmModule.forRootAsync` in `app.module.ts`.

**Frontend layout** (`frontend/src/`):
- Feature folders under `features/<name>/` (e.g. `auth`, `chat`), each with a `use<Feature>` hook holding data/logic (React Query + Axios) and a `<Name>Page/index.tsx` for UI. Shared UI primitives (shadcn/ui) live in `components/ui/`; app-level wrappers like `RequireAuth` live in `components/`.
- `lib/api.ts` is the single configured Axios instance (baseURL `/api`, JWT bearer via request interceptor, auto-redirect to `/login` on 401 response). `features/chat/useChat.ts` currently bypasses this and creates its own Axios client pointed at `localhost:3000` directly — a known gap tied to the `TODO(participante)` in that file, not a pattern to copy for new features.
- Routing is a flat `Routes` tree in `App.tsx`; `RequireAuth` gates authenticated routes by checking for a stored token (no route-level loaders).
- Path alias `@` → `frontend/src` (configured in `vite.config.ts` and the TS configs).
