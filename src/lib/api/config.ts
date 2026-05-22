// Configuração base da API
// O backend roda em http://localhost:3307/api por padrão.
// Para sobrescrever, defina NEXT_PUBLIC_API_URL no .env.local
// Exemplo: NEXT_PUBLIC_API_URL=http://localhost:3307/api
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3307/api";

export async function apiFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options?.headers },
    ...options,
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || `Erro ${res.status}`);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json();
}
