import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/generated/prisma/client";

const connectionString = Bun.env.DATABASE_URL ?? "postgresql://myli:myli@localhost:5432/myli";
const adapter = new PrismaPg({ connectionString });

export const prisma = new PrismaClient({ adapter });
