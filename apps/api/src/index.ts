import "dotenv/config";
import { useValidationRule } from "@envelop/core";
import { createComplexityLimitRule } from "graphql-validation-complexity";
import depthLimit from "graphql-depth-limit";
import { createYoga } from "graphql-yoga";
import { schema } from "@/presentation/schema";
import { createAppServices } from "@/main/app-services";
import { parsePositiveInteger } from "@/main/config-utils";
import { loadUploadConfig } from "@/main/upload-config";
import { handleMediaRequest } from "@/presentation/http/media-routes";
import { prisma } from "@/prisma";
import { redis } from "@/redis";

const uploadConfig = loadUploadConfig();
const services = createAppServices(prisma, redis, uploadConfig);

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
  fetch: async (request: Request) => {
    const mediaResponse = await handleMediaRequest(request, services, uploadConfig);

    if (mediaResponse) {
      return mediaResponse;
    }

    return yoga.fetch(request);
  },
});

console.log(`GraphQL server ready at http://localhost:${server.port}${yoga.graphqlEndpoint}`);
