import type { User, UserRole } from "packages/domain/src/entities/user";

export type CreateUserData = {
  email: string;
  password: string;
  name: string;
  role: UserRole;
};

export type UpdateUserData = Partial<Pick<User, "email" | "password" | "name" | "role">>;

export type UserRepository = {
  create(data: CreateUserData): Promise<User>;
  findById(id: string): Promise<User | null>;
  update(id: string, data: UpdateUserData): Promise<User | null>;
  delete(id: string): Promise<boolean>;
  list(): Promise<User[]>;
};
