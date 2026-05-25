import { getToken } from "./auth";

// Configuração base da API
// O backend roda em http://localhost:3307 por padrão (sem prefixo /api).
// Para sobrescrever, defina NEXT_PUBLIC_API_URL no .env.local
// Exemplo: NEXT_PUBLIC_API_URL=http://localhost:3307
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const token = getToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options?.headers,
  };

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || `Erro ${res.status}`);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json();
}
