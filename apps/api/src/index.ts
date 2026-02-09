import "dotenv/config";
import { createYoga } from "graphql-yoga";
import { schema } from "@/presentation/schema";
import { prisma } from "@/prisma";
import { redis } from "@/redis";

const yoga = createYoga({
  schema,
  context: { prisma, redis },
});

const port = Number(Bun.env.PORT ?? 4000);
const server = Bun.serve({
  port,
  fetch: yoga.fetch,
});

console.log(`GraphQL server ready at http://localhost:${server.port}${yoga.graphqlEndpoint}`);
