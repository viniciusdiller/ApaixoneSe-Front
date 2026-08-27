import { apiFetch } from "./config";
import type { Cat } from "./types";

/**
 * CAT Fixo é um singleton no backend:
 *   GET  /cat  → retorna o único registro (404 se ainda não configurado)
 *   POST /cat  → cria o registro (409 se já existir)
 *   PUT  /cat  → atualiza o registro (sem ID na URL)
 *
 * Upload multipart: campo 'imagens' (image/*, múltiplas), campo 'video' (video/*)
 * e 'ordem' (JSON com a ordem final da galeria).
 */
export const catApi = {
  /**
   * Busca o registro único.
   * Retorna null se o backend responder 404 (ainda não configurado).
   */
  get: async (): Promise<Cat | null> => {
    try {
      return await apiFetch<Cat>("/cat");
    } catch (err: unknown) {
      if (err instanceof Error) {
        try {
          const body = JSON.parse(err.message);
          if (body?.statusCode === 404) return null;
        } catch {
          // não era JSON — re-lança
        }
      }
      throw err;
    }
  },

  /** Cria o registro pela primeira vez (retorna 409 se já existir) */
  create: (data: FormData) =>
    apiFetch<Cat>("/cat", { method: "POST", body: data }),

  /** Atualiza o registro existente (sem ID na URL) */
  update: (data: FormData) =>
    apiFetch<Cat>("/cat", { method: "PUT", body: data }),
};
