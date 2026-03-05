export type AuthTokenServicePort = {
  create(accountId: string): Promise<string>;
  verify(token: string): Promise<string | null>;
  revoke(token: string): Promise<boolean>;
};
