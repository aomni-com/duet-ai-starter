# duet-ai-starter

Full-stack TypeScript starter with a Hono API backend and React frontend, unified under a single Vite dev server.

## Tech Stack

- **Runtime**: Bun
- **Language**: TypeScript 5.9 (strict mode)
- **Frontend**: React 19, Tailwind CSS 4, TanStack React Query, React Hook Form
- **Backend**: Hono (lightweight HTTP framework)
- **Database**: SQLite via libSQL, Drizzle ORM
- **Validation**: Zod (shared between frontend and backend)
- **API Client**: Hono RPC (end-to-end type-safe API calls)
- **Bundler**: Vite 7
- **Linting/Formatting**: Biome via Ultracite
- **Git hooks**: Husky + lint-staged

## Project Structure

```
src/
├── backend/
│   ├── index.ts          # Hono API entry (base path: /api)
│   ├── db.ts             # Drizzle client and schema definitions
│   └── schemas.ts        # Zod validation schemas (shared with frontend)
└── frontend/
    ├── index.html        # HTML shell (Vite root)
    ├── main.tsx          # React entry point (QueryClientProvider)
    ├── main.css          # Global styles (Tailwind)
    ├── app.tsx           # Root React component
    └── lib/
        ├── hono.ts       # Typed Hono RPC client
        └── query.ts      # TanStack Query client instance
```

- **Vite root** is `src/frontend`. All frontend source lives there.
- **Backend entry** is `src/backend/index.ts`. It is loaded by `@hono/vite-dev-server` as middleware during development.
- Requests to `/api/*` are handled by Hono. Everything else is served by Vite (React SPA).

## Scripts

| Command | Description |
|---|---|
| `bun dev` | Start Vite dev server (frontend + backend), loads `.env` |
| `bun start` | Start server in production mode, loads `.env.production` and `.env` |
| `bun run check-types` | Run TypeScript type checking |
| `bun run db:push` | Push schema changes to the database |
| `bun run lint` | Fix lint and formatting issues via Ultracite |

## Development

```sh
bun install
bun run db:push   # skip if not using the database
bun dev
```

If using the database, the `DB_FILE_NAME` environment variable must be set (already configured in `.env`).

### Environment Files

Vite loads env files in order of precedence (later files override earlier ones):

| Command | Files loaded |
|---|---|
| `bun dev` | `.env`, `.env.development`, `.env.development.local`, `.env.local` |
| `bun start` | `.env`, `.env.production`, `.env.production.local`, `.env.local` |

Put shared defaults (like `DB_FILE_NAME`) in `.env`. Use `.env.production` for production-specific overrides (e.g. a different database path). Files ending in `.local` are gitignored and intended for machine-specific secrets.

### Port

Set the `PORT` environment variable to change the server port (defaults to `5173`):

```sh
PORT=3000 bun dev
```

## Production

```sh
bun start
```

This runs `vite --mode production`, which loads `.env.production` (if present) over `.env` and sets `NODE_ENV=production`. The server itself is still the Vite dev server — suitable for low-traffic use. For high-traffic deployments, consider adding a build step with a standalone Node server.

## Database

The database is **optional**. If your app doesn't need persistence, you can remove the database setup entirely:

1. Delete `src/backend/db.ts` and `drizzle.config.ts`
2. Remove the `DB_FILE_NAME` variable from `.env`
3. Remove any routes that reference `db` or `usersTable` from `src/backend/index.ts`
4. Uninstall the database packages: `bun remove drizzle-orm drizzle-kit @libsql/client`

Without these, the app runs as a pure API + React SPA with no database dependency.

### Using the Database

The backend uses Drizzle ORM with SQLite (via libSQL). The schema is defined in `src/backend/db.ts` and the Drizzle config is in `drizzle.config.ts`.

The `DB_FILE_NAME` environment variable must be set (already configured in `.env` as `file:local.db`). The database file is created in the repo root and is gitignored.

After modifying the schema, push the changes to the database:

```sh
bun run db:push
```

This uses `drizzle-kit push` to apply schema changes directly without generating migration files.

## Hono RPC

The API is fully end-to-end type-safe using Hono's RPC client. The typed client is exported from `src/frontend/lib/hono.ts` and infers all route types from the backend.

Usage on the frontend:

```ts
import { hono } from './lib/hono'

const response = await hono.api.hello.$get()
const data = await response.json()
```

Routes in the backend **must be chained** on the app instance for the types to propagate to the RPC client:

```ts
const app = new Hono()
  .basePath('/api')
  .get('/example', (context) => {
    return context.json({ ok: true })
  })
  .post('/example', zValidator('json', ExampleSchema), async (context) => {
    const data = context.req.valid('json')
    return context.json(data)
  })
```

If routes are added as standalone statements (`app.get(...)` instead of chaining), the type information is lost and the RPC client won't see them.

## Data Fetching

TanStack React Query is used for all server state. The `QueryClientProvider` wraps the app in `src/frontend/main.tsx`.

Queries use the Hono RPC client:

```ts
const { data } = useQuery({
  queryKey: ['example'],
  async queryFn() {
    const response = await hono.api.example.$get()
    return response.json()
  },
})
```

## Validation

Zod schemas live in `src/backend/schemas.ts` and are shared between the backend (via `@hono/zod-validator`) and the frontend (via `@hookform/resolvers/zod` for React Hook Form).

This means validation rules are defined once and enforced on both sides.

## Configuration

- **Vite**: `vite.config.ts` — plugins for Hono dev server, React, and Tailwind CSS
- **TypeScript**: `tsconfig.json` — strict mode, ESM, bundler resolution
- **Drizzle**: `drizzle.config.ts` — SQLite dialect, schema in `src/backend/db.ts`, migrations output to `src/drizzle`
- **Biome**: `biome.jsonc` — extends Ultracite core + React presets; single quotes, no semicolons, trailing commas; custom import ordering (node/bun first, packages, aliases, relative paths)
- **Lint-staged**: runs `ultracite fix` on staged files before commit
