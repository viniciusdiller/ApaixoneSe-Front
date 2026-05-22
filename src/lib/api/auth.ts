/**
 * Store de autenticação em memória.
 * Não usa localStorage (bloqueado em iframes de sandbox).
 * O token é perdido ao recarregar a página — comportamento intencional para o admin.
 */

let _token: string | null = null;

export function getToken(): string | null {
  return _token;
}

export function setToken(token: string): void {
  _token = token;
}

export function clearToken(): void {
  _token = null;
}

export function isAuthenticated(): boolean {
  return _token !== null;
}
