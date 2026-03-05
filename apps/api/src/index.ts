import "dotenv/config";
import { createYoga } from "graphql-yoga";
import { schema } from "@/presentation/schema";
import { createAppServices } from "@/main/app-services";
import { prisma } from "@/prisma";
import { redis } from "@/redis";

const services = createAppServices(prisma, redis);

const yoga = createYoga({
  schema,
  context: async ({ request }) => {
    const authHeader = request.headers.get("authorization");
    const authToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

    return { authToken, services };
  },
});

const port = Number(Bun.env.PORT ?? 4000);
const server = Bun.serve({
  port,
  fetch: yoga.fetch,
});

console.log(`GraphQL server ready at http://localhost:${server.port}${yoga.graphqlEndpoint}`);
