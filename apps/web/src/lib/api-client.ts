const API_URL = "http://localhost:4000/graphql";

type GraphqlResponse<T> = {
  data?: T;
  errors?: { message: string }[];
};

async function gql<T>(
  query: string,
  variables: Record<string, unknown> = {},
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(API_URL, {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Erreur API (${response.status}): ${text || response.statusText}`);
  }

  let json: GraphqlResponse<T>;
  try {
    json = await response.json();
  } catch {
    throw new Error("L'API n'a pas renvoyé de JSON valide");
  }

  if (json.errors && json.errors.length > 0) {
    console.error("GraphQL Errors:", json.errors);
    throw new Error(json.errors[0].message);
  }

  if (!json.data) {
    throw new Error("Aucune donnée reçue de l'API");
  }

  return json.data;
}

// --- Types ---

export type ApiAccount = {
  accountId: string;
  login: string | null;
  email: string | null;
  name: string | null;
  isArtist: boolean;
};

export type AuthPayload = {
  token: string;
  account: ApiAccount;
};

// --- Mutations & Queries ---

export async function loginMutation(
  email: string,
  password: string,
): Promise<AuthPayload> {
  const query = /* GraphQL */ `
    mutation Login($input: LoginInput!) {
      login(input: $input) {
        token
        account {
          accountId
          login
          email
          name
          isArtist
        }
      }
    }
  `;

  const data = await gql<{ login: AuthPayload | null }>(query, {
    input: { email, password },
  });

  if (!data.login) {
    throw new Error("Email ou mot de passe incorrect");
  }

  return data.login;
}

export async function registerMutation(
  login: string,
  email: string,
  password: string,
  name: string,
): Promise<ApiAccount> {
  const query = /* GraphQL */ `
    mutation CreateAccount($input: CreateAccountInput!) {
      createAccount(input: $input) {
        accountId
        login
        email
        name
        isArtist
      }
    }
  `;

  const data = await gql<{ createAccount: ApiAccount }>(query, {
    input: { login, email, password, name, isArtist: false },
  });

  return data.createAccount;
}

export async function logoutMutation(token: string): Promise<boolean> {
  const query = /* GraphQL */ `
    mutation Logout {
      logout
    }
  `;

  try {
    const data = await gql<{ logout: boolean }>(query, {}, token);
    return data.logout;
  } catch {
    // Best-effort — on considère que c'est OK côté client
    return true;
  }
}

export async function getAccountQuery(
  accountId: string,
  token: string,
): Promise<ApiAccount | null> {
  const query = /* GraphQL */ `
    query GetAccount($accountId: String!) {
      account(accountId: $accountId) {
        accountId
        login
        email
        name
        isArtist
      }
    }
  `;

  const data = await gql<{ account: ApiAccount | null }>(
    query,
    { accountId },
    token,
  );

  return data.account;
}

export async function updateAccountMutation(
  accountId: string,
  input: {
    login?: string;
    email?: string;
    password?: string;
    name?: string;
  },
  token: string,
): Promise<ApiAccount | null> {
  const query = /* GraphQL */ `
    mutation UpdateAccount($accountId: String!, $input: UpdateAccountInput!) {
      updateAccount(accountId: $accountId, input: $input) {
        accountId
        login
        email
        name
        isArtist
      }
    }
  `;

  const data = await gql<{ updateAccount: ApiAccount | null }>(
    query,
    { accountId, input },
    token,
  );

  return data.updateAccount;
}

export async function deleteAccountMutation(
  accountId: string,
  token: string,
): Promise<boolean> {
  const query = /* GraphQL */ `
    mutation DeleteAccount($accountId: String!) {
      deleteAccount(accountId: $accountId)
    }
  `;

  const data = await gql<{ deleteAccount: boolean }>(
    query,
    { accountId },
    token,
  );

  return data.deleteAccount;
}
