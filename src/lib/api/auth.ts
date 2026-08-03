/**
 * Store de autenticação com persistência em localStorage.
 * Guarda token + dados do usuário (nome, perfil) para acesso rápido.
 */

const TOKEN_KEY = "app_token";
const USER_KEY = "app_user";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6969";

async function parseErrorMessage(response: Response, fallback: string): Promise<string> {
  try {
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const data = await response.json();
      if (Array.isArray(data?.message)) return data.message.join(" ");
      return data?.message || fallback;
    }

    const text = (await response.text())?.trim();
    return text || fallback;
  } catch {
    return fallback;
  }
}

// --- Utilitários de Armazenamento ---

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  return getToken() !== null;
}

export function setUserData(user: { id: string; nome: string; usuario: string; perfil: string }): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function getUserData(): { id: string; nome: string; usuario: string; perfil: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// --- Funções de API ---

/**
 * Valida o token de verificação de e-mail enviado ao usuário.
 */
export async function verifyEmailToken(token: string) {
  const response = await fetch(`${API_URL}/users/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token }),
  });

  if (!response.ok) {
    const message = await parseErrorMessage(response, "Erro ao verificar e-mail.");
    throw new Error(message);
  }

  return response.json();
}

/**
 * Solicita um link de redefinição de senha para o e-mail cadastrado.
 */
export async function forgotPassword(email: string) {
  const response = await fetch(`${API_URL}/users/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const message = await parseErrorMessage(response, "Erro ao solicitar redefinição de senha.");
    throw new Error(message);
  }

  return response.json();
}

/**
 * Envia a nova senha ao servidor utilizando o token recebido no e-mail.
 */
export async function resetPassword(token: string, newPassword: string) {
  const response = await fetch(`${API_URL}/users/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, senha: newPassword }),
  });

  if (!response.ok) {
    const message = await parseErrorMessage(
      response,
      "Erro ao redefinir senha. Token inválido ou expirado."
    );
    throw new Error(message);
  }

  return response.json();
}