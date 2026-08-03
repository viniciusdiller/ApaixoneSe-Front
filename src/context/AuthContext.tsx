"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { getToken, getUserData, clearToken, setToken, setUserData } from "@/lib/api/auth";
import { usersApi } from "@/lib/api";
import type { LoginUserDto } from "@/lib/api";

type UserProfile = { id: string; nome: string; usuario: string; perfil: "ADMIN" | "PARCEIRO" | "USUARIO" };

interface AuthContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  login: (data: LoginUserDto) => Promise<void>;
  logout: () => void;
  setCurrentUser: (nextUser: UserProfile) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Hidratar do localStorage na montagem
  useEffect(() => {
    const token = getToken();
    const saved = getUserData();
    if (token && saved) {
      setUser(saved as UserProfile);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (data: LoginUserDto) => {
    const res = await usersApi.login(data);
    setToken(res.token);
    setUserData(res.user as UserProfile);
    setUser(res.user as UserProfile);
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const setCurrentUser = useCallback((nextUser: UserProfile) => {
    setUserData(nextUser);
    setUser(nextUser);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, setCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}
