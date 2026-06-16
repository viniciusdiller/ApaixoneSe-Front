import { apiFetch } from "./config";
import type { CatMovel } from "./types";

/**
 * CAT Móvel é um singleton no backend:
 *   GET  /cat-movel     → retorna o único registro (404 se ainda não configurado)
 *   POST /cat-movel     → cria o registro (409 se já existir)
 *   PUT  /cat-movel     → atualiza o registro (sem ID na URL)
 *
 * Upload: campos separados 'imagem' (image/*) e 'video' (video/*)
 */
export const catMovelApi = {
  /**
   * Tenta buscar o registro único.
   * Retorna null se o backend responder 404 (ainda não configurado).
   */
  get: async (): Promise<CatMovel | null> => {
    try {
      return await apiFetch<CatMovel>("/cat-movel");
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
    apiFetch<CatMovel>("/cat-movel", { method: "POST", body: data }),

  /** Atualiza o registro existente */
  update: (data: FormData) =>
    apiFetch<CatMovel>("/cat-movel", { method: "PUT", body: data }),
};
