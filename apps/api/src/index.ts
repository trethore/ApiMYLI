import "dotenv/config";
import { useValidationRule } from "@envelop/core";
import { createComplexityLimitRule } from "graphql-validation-complexity";
import depthLimit from "graphql-depth-limit";
import { createYoga } from "graphql-yoga";
import { schema } from "@/presentation/schema";
import { createAppServices } from "@/main/app-services";
import { prisma } from "@/prisma";
import { redis } from "@/redis";

const services = createAppServices(prisma, redis);
const parsePositiveInteger = (value: string | undefined, fallback: number): number => {
  const parsedValue = Number.parseInt(value ?? "", 10);

  return Number.isInteger(parsedValue) && parsedValue > 0 ? parsedValue : fallback;
};

const maxQueryDepth = parsePositiveInteger(Bun.env.GRAPHQL_MAX_DEPTH, 5);
const maxQueryComplexity = parsePositiveInteger(Bun.env.GRAPHQL_MAX_COMPLEXITY, 1000);

const yoga = createYoga({
  schema,
  plugins: [
    useValidationRule(depthLimit(maxQueryDepth)),
    useValidationRule(createComplexityLimitRule(maxQueryComplexity)),
  ],
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
