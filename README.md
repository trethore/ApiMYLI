# MYLI - API

MYLI - API is a TypeScript monorepo built with **Bun** as both the runtime and package manager.

## Overview

We use turborepo to make a monorepo.

### Project Structure

```
/
├── apps/
│   ├── api/                    # GraphQL API application
│   └── web/                    # Next.js web application
├── packages/                   # Shared packages (workspace modules)
├── package.json                # Root workspace configuration
├── bun.lock                    # Dependency lock file
└── README.md
```

## Getting started

### Prerequisites

To instal bun follow this link: [installation](https://github.com/oven-sh/bun)

### Installation & Setup

```bash
# Install all dependencies (from repository root)
bun install
```

### Run

#### API Application (`apps/api`)

| Command                   | Description                                   |
| ------------------------- | --------------------------------------------- |
| `bun run dev`             | Start development server with hot reload      |
| `bun run start`           | Start production server                       |
| `bun run prisma:generate` | Generate Prisma client from schema            |
| `bun run prisma:migrate`  | Run database migrations and regenerate client |

The API server runs at `http://localhost:4000/graphql` by default.

#### Web Application (`apps/web`)

| Command         | Description                      |
| --------------- | -------------------------------- |
| `bun run dev`   | Start Next.js development server |
| `bun run build` | Build for production             |
| `bun run start` | Start production server          |
| `bun run lint`  | Run ESLint                       |

#### Running Commands from Root

Execute app-specific commands from the repository root using Bun's filter:

```bash
bun run --filter api dev
bun run --filter web build
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

## License

License: [MIT](LICENSE)
