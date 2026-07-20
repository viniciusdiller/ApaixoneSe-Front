import { getToken } from "./auth";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://172.17.56.58:3001/";

/**
 * Wrapper central para todas as chamadas à API.
 * - Injeta automaticamente o header Authorization: Bearer <token> quando
 *   há um token salvo (admin logado).
 * - Detecta FormData e omite Content-Type (o browser define o boundary).
 * - Para JSON, serializa e define Content-Type: application/json.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const isFormData = options.body instanceof FormData;
  const token = getToken();

  const baseHeaders: Record<string, string> = {};

  if (token) {
    baseHeaders["Authorization"] = `Bearer ${token}`;
  }

  if (!isFormData) {
    baseHeaders["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...baseHeaders,
      ...(options.headers ?? {}),
    },
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || `HTTP ${res.status}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : ({} as T);
}
