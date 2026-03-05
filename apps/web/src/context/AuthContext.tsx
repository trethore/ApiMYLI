"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  loginMutation,
  registerMutation,
  logoutMutation,
  updateAccountMutation,
  deleteAccountMutation,
  type ApiAccount,
} from "@/lib/api-client";

const USER_KEY = "muse_user";
const TOKEN_KEY = "muse_token";

interface User {
  accountId: string;
  login: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (login: string, email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: { login?: string; name?: string; email?: string; password?: string }) => Promise<void>;
  deleteAccount: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const toUser = (account: ApiAccount): User => ({
  accountId: account.accountId,
  login: account.login ?? "",
  email: account.email ?? "",
  name: account.name ?? "",
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem(USER_KEY);
    const storedToken = localStorage.getItem(TOKEN_KEY);
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch {
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(TOKEN_KEY);
      }
    }
  }, []);

  const persistAuth = (u: User, t: string) => {
    setUser(u);
    setToken(t);
    localStorage.setItem(USER_KEY, JSON.stringify(u));
    localStorage.setItem(TOKEN_KEY, t);
  };

  const clearAuth = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const payload = await loginMutation(email, password);
      persistAuth(toUser(payload.account), payload.token);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (login: string, email: string, password: string, name: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await registerMutation(login, email, password, name);
      // Auto-login after successful registration
      const payload = await loginMutation(email, password);
      persistAuth(toUser(payload.account), payload.token);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (token) {
      await logoutMutation(token);
    }
    clearAuth();
    router.push("/login");
  };

  const updateUser = async (data: { login?: string; name?: string; email?: string; password?: string }) => {
    if (!user || !token) return;
    setIsLoading(true);
    setError(null);
    try {
      const updated = await updateAccountMutation(user.accountId, data, token);
      if (updated) {
        const updatedUser = toUser(updated);
        setUser(updatedUser);
        localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la mise à jour");
    } finally {
      setIsLoading(false);
    }
  };

  const deleteAccount = async () => {
    if (!user || !token) return;
    setIsLoading(true);
    setError(null);
    try {
      await deleteAccountMutation(user.accountId, token);
      clearAuth();
      router.push("/register");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur lors de la suppression");
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        isLoading,
        error,
        login,
        register,
        logout,
        updateUser,
        deleteAccount,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
