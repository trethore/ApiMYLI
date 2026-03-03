export type UserRole = "Artist" | "User";

export type User = {
  id: string;
  email: string;
  password: string;
  name: string;
  role: UserRole;
};
