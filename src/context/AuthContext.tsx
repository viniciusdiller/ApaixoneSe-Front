"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { getToken, getUserData, clearToken, setToken, setUserData } from "@/lib/api/auth";
import { usersApi, ApiError } from "@/lib/api";
import type { LoginUserDto } from "@/lib/api";

type UserProfile = { id: string; nome: string; usuario: string; perfil: "ADMIN" | "PARCEIRO" | "USUARIO" };

interface AuthContextValue {
  user: UserProfile | null;
  isLoading: boolean;
  login: (data: LoginUserDto) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  setCurrentUser: (nextUser: UserProfile) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshEmAndamento = useRef<Promise<void> | null>(null);

  // Revalida o usuário no backend; só 401 encerra a sessão (rede/5xx mantém o cache)
  const refreshUser = useCallback((): Promise<void> => {
    if (refreshEmAndamento.current) return refreshEmAndamento.current;

    const promessa = (async () => {
      const token = getToken();
      const saved = getUserData();
      if (!token || !saved) return;

      try {
        const atual = await usersApi.getById(saved.id);
        const proximo: UserProfile = {
          id: atual.id,
          nome: atual.nome,
          usuario: atual.usuario,
          perfil: atual.perfil,
        };
        setUserData(proximo);
        setUser((prev) =>
          prev &&
          prev.id === proximo.id &&
          prev.nome === proximo.nome &&
          prev.usuario === proximo.usuario &&
          prev.perfil === proximo.perfil
            ? prev
            : proximo,
        );
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          clearToken();
          setUser(null);
        }
      }
    })().finally(() => {
      refreshEmAndamento.current = null;
    });

    refreshEmAndamento.current = promessa;
    return promessa;
  }, []);

  // Hidrata do localStorage e revalida em segundo plano
  useEffect(() => {
    const token = getToken();
    const saved = getUserData();
    if (token && saved) {
      setUser(saved as UserProfile);
      void refreshUser();
    }
    setIsLoading(false);
  }, [refreshUser]);

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
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser, setCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
}
