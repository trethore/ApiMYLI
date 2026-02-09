# MYLI - API

MYLI - API is a TypeScript monorepo built with **Bun** as both the runtime and package manager.

## Overview

We use turborepo to make a monorepo that follow a Clean Architecture direction

### Project Structure

```
/
├── apps/
│   ├── api/                    # GraphQL API application
│   └── web/                    # Next.js web application
├── packages/                   # Shared packages (workspace modules)
├── docker-compose.yml          # PostgreSQL and Redis services
├── package.json                # Root workspace configuration
├── bun.lock                    # Dependency lock file
└── README.md
```

### Clean Architecture Principles

- Domain and application logic must not depend on frameworks.
- Infrastructure details (Prisma, Redis, GraphQL, Next.js) stay at the edges.
- Dependencies point inward: `presentation -> application -> domain`.
- Shared business rules belong in `packages`, app wiring belongs in `apps`.

## Getting started

### Prerequisites

- **Bun** — [installation](https://github.com/oven-sh/bun)
- **Docker** — Required for PostgreSQL and Redis containers

### Installation & Setup

```bash
# Start PostgreSQL and Redis
docker compose up -d

# Install all dependencies (from repository root)
bun install

# Run database migrations (first time only)
bun run --filter api prisma:migrate
```

### Run

#### API Application (`apps/api`)

| Command                   | Description                                   |
| ------------------------- | --------------------------------------------- |
| `bun run dev`             | Start development server with hot reload      |
| `bun run start`           | Start production server                       |
| `bun run schema:generate` | Generate `schema.gql` from GraphQL schema     |
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
bun run --filter api schema:generate
bun run --filter web build
```

Start or stop the infrastructure services:

```bash
docker compose up -d    # Start PostgreSQL and Redis in background
docker compose down     # Stop services
docker compose ps       # Check service status
```

## Dependencies

### Api

- GraphQL Yoga serves as the GraphQL server.
- Prisma handles database operations.
- PostgreSQL is used as the database via Prisma.
- Redis (via ioredis) is used for caching and session management.

### Web

- Next.js 16 with App Router for routing and SSR.
- React 19 with server components.
- Tailwind CSS v4 for styling.
- shadcn/ui for UI components.

## License

License: [MIT](LICENSE)
