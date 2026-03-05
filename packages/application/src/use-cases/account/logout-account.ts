import type { AuthTokenServicePort } from "packages/application/src/ports/security/auth-token-service-port";

export const logoutAccount = async (
  authTokenService: AuthTokenServicePort,
  token: string | null,
): Promise<boolean> => {
  if (!token) {
    return false;
  }

  return authTokenService.revoke(token);
};
