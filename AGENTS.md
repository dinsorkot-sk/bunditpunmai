# AGENTS.md - Nuxt 4 Repository

## Developer Commands

```bash
pnpm dev              # Dev server at http://localhost:3000
pnpm build           # Production build
pnpm preview         # Preview production build locally
pnpm typecheck       # Type checking (vue-tsc)
pnpm test            # Vitest tests
pnpm test:watch      # Vitest in watch mode
pnpm lint            # ESLint
pnpm lint:fix        # ESLint with auto-fix
pnpm format          # Prettier format
pnpm db:generate     # Drizzle codegen
pnpm db:migrate      # Run migrations
pnpm db:rollback     # Rollback last migration
pnpm db:status       # Check migration status
pnpm db:seed         # Seed database
pnpm db:reset        # Reset database (migrate + seed)
```

## Package Manager
- **pnpm** (not npm or yarn)

## Directory Structure

```
app/                 # Vue app entry (app.vue)
server/
  api/v1/           # API routes (auto-imported by Nuxt)
  api/v1/*/schema/  # Database table definitions
  db/               # DB config (schema.ts re-exports all tables)
  utils/            # Server utilities
shared/types/       # Shared TypeScript types
.data/              # SQLite database file location
.nuxt/              # Generated Nuxt files (DO NOT EDIT)
```

## Package Boundaries

- **app/** - Client-side Vue code only
- **server/** - Server-only code (API routes, DB, utilities)
- **shared/** - Code shared between client and server (types)

## Framework Quirks

### Generated TypeScript Configs
`tsconfig.json` references **generated** configs:
- `.nuxt/tsconfig.app.json`
- `.nuxt/tsconfig.server.json`
- `.nuxt/tsconfig.shared.json`
- `.nuxt/tsconfig.node.json`

Regenerate via `pnpm postinstall` or `nuxt prepare`.

### Database Setup
- **Engine**: SQLite via Nuxt Hub (`hub.db: 'sqlite'` in nuxt.config.ts)
- **Schema location**: Tables defined in `server/api/v1/*/schema/index.ts`
- **Schema barrel**: `server/db/schema.ts` re-exports all tables
- **Data file**: SQLite file stored in `.data/` directory
- **ORM**: drizzle-orm (migrations in `server/db/migrations/`)

### API Docs
- **@scalar/nuxt** module enabled
- OpenAPI spec generated via `nitro.experimental.openAPI`
- Access API docs at the Scalar endpoint (check Nuxt devtools)

## Nuxt Config

```ts
// nuxt.config.ts key settings
compatibilityDate: '2025-07-15'
hub.db: 'sqlite'           // SQLite via @libsql/client
nitro.experimental.openAPI: true  // OpenAPI spec generation
modules: ['@nuxthub/core', '@scalar/nuxt']
```

## Key Dependencies

- nuxt: ^4.4.2
- drizzle-orm: ^0.45.2
- drizzle-kit: ^0.31.10
- zod: ^4.3.6
- jose: ^6.2.2 (JWT/auth)
- @scalar/nuxt: ^0.6.27 (API docs)
