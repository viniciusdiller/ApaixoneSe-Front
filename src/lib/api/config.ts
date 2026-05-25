export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:6969";

/**
 * Wrapper central para todas as chamadas à API.
 * - Detecta FormData automaticamente e omite o Content-Type
 *   (o browser define o boundary do multipart sozinho).
 * - Para payloads JSON, serializa e define Content-Type: application/json.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const isFormData = options.body instanceof FormData;

  const headers: HeadersInit = isFormData
    ? {} // deixa o browser setar multipart/form-data com boundary
    : { "Content-Type": "application/json", ...(options.headers ?? {}) };

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error || `HTTP ${res.status}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : ({} as T);
}
