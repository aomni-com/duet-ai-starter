# duet-ai-starter

Full-stack TypeScript starter with a Hono API backend and React frontend, unified under a single Vite dev server.

## Tech Stack

- **Runtime**: Bun
- **Language**: TypeScript 5.9 (strict mode)
- **Frontend**: React 19, Tailwind CSS 4
- **Backend**: Hono (lightweight HTTP framework)
- **Bundler**: Vite 7
- **Linting/Formatting**: Biome via Ultracite
- **Git hooks**: Husky + lint-staged

## Project Structure

```
src/
├── backend/
│   └── index.ts          # Hono API entry (base path: /api)
└── frontend/
    ├── index.html        # HTML shell (Vite root)
    ├── main.tsx          # React entry point
    ├── main.css          # Global styles (Tailwind)
    └── app.tsx           # Root React component
```

- **Vite root** is `src/frontend`. All frontend source lives there.
- **Backend entry** is `src/backend/index.ts`. It is loaded by `@hono/vite-dev-server` as middleware during development.
- Requests to `/api/*` are handled by Hono. Everything else is served by Vite (React SPA).

## Scripts

| Command | Description |
|---|---|
| `bun dev` | Start Vite dev server (frontend + backend) |
| `bun run build` | Type-check then build for production |
| `bun run preview` | Preview the production build |
| `bun run check-types` | Run TypeScript type checking |
| `bun run db:push` | Push schema changes to the database |
| `bun run lint` | Fix lint and formatting issues via Ultracite |

## Database

The backend uses Drizzle ORM with SQLite (via libSQL). The schema is defined in `src/backend/db.ts` and the Drizzle config is in `drizzle.config.ts`.

The `DB_FILE_NAME` environment variable must be set (e.g. in `.env`) to point to your SQLite database file.

After modifying the schema, push the changes to the database:

```sh
bun run db:push
```

This uses `drizzle-kit push` to apply schema changes directly without generating migration files.

## Development

```sh
bun install
bun run db:push
bun dev
```

The dev server serves the React app at `/` and proxies API routes to the Hono backend at `/api/*`.

### Adding API routes

Add routes in `src/backend/index.ts`. All routes are scoped under the `/api` base path:

```ts
// accessible at /api/example
app.get('/example', (context) => {
  return context.json({ ok: true })
})
```

### Adding frontend pages/components

Add React components under `src/frontend/`. The entry component is `src/frontend/app.tsx`.

## Configuration

- **Vite**: `vite.config.ts` — plugins for Hono dev server, React, and Tailwind CSS
- **TypeScript**: `tsconfig.json` — strict mode, ESM, bundler resolution
- **Biome**: `biome.jsonc` — extends Ultracite core + React presets; single quotes, no semicolons, trailing commas
- **Lint-staged**: runs `ultracite fix` on staged files before commit
