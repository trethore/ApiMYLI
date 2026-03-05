"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (username: string, email: string) => void;
  register: (username: string, email: string) => void;
  updateUser: (data: Partial<User>) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check local storage or session storage for existing auth
    const storedUser = localStorage.getItem("muse_user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (username: string, email: string) => {
    const newUser = { username, email };
    setUser(newUser);
    localStorage.setItem("muse_user", JSON.stringify(newUser));
    router.push("/"); // Redirect to home after login
  };

  const register = (username: string, email: string) => {
    const newUser = { username, email };
    setUser(newUser);
    localStorage.setItem("muse_user", JSON.stringify(newUser));
    router.push("/"); // Redirect to home after register
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem("muse_user", JSON.stringify(updatedUser));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("muse_user");
    router.push("/login"); // Redirect to login after logout
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, updateUser, logout, isAuthenticated: !!user }}
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
