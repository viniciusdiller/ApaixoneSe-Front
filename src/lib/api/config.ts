import { clearToken, getToken } from "./auth";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://172.17.56.58:3001/";

// Erro da API com o status HTTP exposto
export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

let redirecionandoParaLogin = false;

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
    // 401 fora do login = sessão inválida: limpa a sessão e vai para /login
    if (res.status === 401 && token && path !== "/users/login") {
      clearToken();
      if (
        typeof window !== "undefined" &&
        !redirecionandoParaLogin &&
        window.location.pathname !== "/login"
      ) {
        redirecionandoParaLogin = true;
        window.location.assign("/login");
      }
    }
    const error = await res.text();
    throw new ApiError(error || `HTTP ${res.status}`, res.status);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : ({} as T);
}
