# Repository Guidelines

MYLI - API is a TypeScript monorepo built with **Bun** as both the runtime and package manager.

## Overview

### Project Structure

```
/
├── apps/
│   ├── api/                    # GraphQL API application
│   └── web/                    # Next.js web application
├── packages/                   # Shared packages (workspace modules)
├── package.json                # Root workspace configuration
├── bun.lock                    # Dependency lock file
└── README.md                   # README of the repo.
```

### Path Aliases

The API application uses:

- `@/*` mapped to `src/*`
- `@prisma/*` mapped to `prisma/*`

The web application uses:

- `@/*` mapped to `src/*`

## Build, Test, and Development Commands

### Installation

```bash
# Install all dependencies (from repository root)
bun install
```

### API Application (`apps/api`)

| Command                   | Description                                   |
| ------------------------- | --------------------------------------------- |
| `bun run dev`             | Start development server with hot reload      |
| `bun run start`           | Start production server                       |
| `bun run prisma:generate` | Generate Prisma client from schema            |
| `bun run prisma:migrate`  | Run database migrations and regenerate client |

The API server runs at `http://localhost:4000/graphql` by default.

### Web Application (`apps/web`)

| Command         | Description                      |
| --------------- | -------------------------------- |
| `bun run dev`   | Start Next.js development server |
| `bun run build` | Build for production             |
| `bun run start` | Start production server          |
| `bun run lint`  | Run ESLint                       |

### Running Commands from Root

Execute app-specific commands from the repository root using Bun's filter:

```bash
bun run --filter api dev
bun run --filter web build
```

## Coding Conventions

### Typescript

- Target TypeScript 5.9.3 with 2-space indentation.
- Strict mode is enabled; all code must pass strict type checking.
- Always use absolute paths in imports.
- Use **ES2022** features (target ES2022 with ESNext modules).
- Prefer explicit type annotations for function parameters and return types.
- Use type-only imports where applicable: `import type { User } from "..."`.
- Never use `any` as a type.

### Naming Patterns

- kebab-case: functional files
- PascalCase: components
- camelCase : variables and functions
- UPPER_SNAKE_CASE : constants

### Code Comments

Never add comments unless documentation is explicitly requested.

- **Do not** comment obvious behaviors or self-explanatory code.
- **Do** comment unusual patterns, workarounds, or complex logic.
- Focus on explaining **why** something is done, not **what** is being done.
- Use JSDoc comments for exported functions and types when the purpose is not immediately clear.

```typescript
// Bad: Explains obvious behavior
// Loop through users and filter by active status
const activeUsers = users.filter((u) => u.isActive);

// Good: Explains why a non-obvious approach is needed
// Using libsql adapter requires URL format even for local files
const databaseUrl = Bun.env.DATABASE_URL ?? "file:./prisma/dev.db";
```

## Dependencies

### Api

- GraphQL Yoga serves as the GraphQL server.
- Prisma with libsql adapter handles database operations.
- SQLite is used as the database via Prisma.

### Web

- Next.js 16 with App Router for routing and SSR.
- React 19 with server components.
- Tailwind CSS v4 for styling.
- shadcn/ui for UI components.

## Testing & Verification

Testing infrastructure is not yet configured in this repository.

## Commits & Pull Requests

- Keep PRs focused on a single concern and avoid unrelated cleanups.
- Provide clear summaries, rationale, and manual test steps.
- Use Conventional Commit conventions (e.g., `feat(ui): add slider snap support`) and flag breaking API changes early.
