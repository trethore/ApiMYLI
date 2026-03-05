import type { AuthTokenServicePort } from "packages/application/src/ports/security/auth-token-service-port";

export const getAuthenticatedAccountId = async (
  authTokenService: AuthTokenServicePort,
  token: string | null,
): Promise<string> => {
  if (!token) {
    throw new Error("Unauthorized");
  }

  const accountId = await authTokenService.verify(token);
  if (!accountId) {
    throw new Error("Unauthorized");
  }

  return accountId;
};
