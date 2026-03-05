// account.ts reflects Prisma's Account model
// fields match the database schema and are used throughout the application

export type Account = {
  accountId: string;
  login?: string | null;
  password?: string | null;
  name?: string | null;
  email?: string | null;
  createdAt?: Date | null;
};
