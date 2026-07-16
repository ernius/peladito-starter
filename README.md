# Peladito Architect — Starter

Punto de partida para el AI Engineering Applied Lab. El boilerplate full-stack ya está resuelto: **toda la lógica de AI la construyes tú** a partir de la semana 2.

## Stack

- **Backend:** NestJS + TypeScript, TypeORM, PostgreSQL, JWT
- **Frontend:** React + TypeScript (Vite), Tailwind CSS, shadcn/ui, React Query, React Hook Form + Zod
- **Monorepo:** pnpm workspaces

## Setup

```bash
pnpm install
pnpm db:up                                  # PostgreSQL en Docker
cp backend/.env.example backend/.env        # ajusta JWT_SECRET
pnpm migration:run
pnpm dev                                    # backend :3000 + frontend :5173
```

El frontend proxea `/api` al backend, no necesita `.env` propio.

## Qué incluye

- Auth súper simple: login con nombre + email (sin password), JWT, guard y `GET /api/auth/me`. Suficiente para el lab; no usar en producción.
- Entidad `User` con soft delete, migración inicial y patrón puerto/adaptador (`users/domain` vs. `users/infrastructure`).
- Config namespaced con validación de env vars al arranque (`src/config`).
- **Arquitectura de AI providers** (`src/ai`): el puerto `AiProvider`, un registry, y stubs de OpenAI y Anthropic que lanzan `NotImplementedException`. Los servicios de dominio nunca dependen de un SDK concreto.
- Shell de chat en el frontend (`features/chat`): UI lista, sin conexión a ningún modelo.

## Qué NO incluye (a propósito)

- SDKs de OpenAI/Anthropic, prompts, structured outputs, retrieval, evaluación, logging de costos. Eso es el programa. Busca los `TODO(participante)` en el código.

## Convenciones

- Controller → Service → Repository port → Infrastructure adapter. Los entities de TypeORM no salen del adaptador.
- DTOs con `class-validator`; respuestas via mapper con `plainToInstance` + `@Expose()`.
- Migraciones solo por CLI: `pnpm migration:generate src/database/migrations/Nombre` (desde `backend/`).
- Env vars siempre via `ConfigService` — nunca `process.env` en servicios.
- Secretos solo en `.env` (gitignored). Nunca commitear API keys.

## Scripts (raíz)

| Script | Qué hace |
|---|---|
| `pnpm dev` | Backend y frontend en watch |
| `pnpm build` | Build de ambos paquetes |
| `pnpm test` | Tests de ambos paquetes |
| `pnpm lint` | Lint de ambos paquetes |
| `pnpm db:up` / `pnpm db:down` | PostgreSQL en Docker |
| `pnpm migration:run` | Corre las migraciones pendientes |
