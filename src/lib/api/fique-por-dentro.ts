import { apiFetch } from "./config";
import type { FiquePorDentro } from "./types";

/**
 * Fique Por Dentro — coleção de imagens ordenadas.
 * Rotas:
 *   GET    /fique-por-dentro         → lista todos
 *   POST   /fique-por-dentro         → cria (FormData: ordem, imagem)
 *   PUT    /fique-por-dentro/:id     → atualiza (FormData: ordem?, imagem?)
 *   DELETE /fique-por-dentro/:id     → remove
 */
export const fiquePorDentroApi = {
  getAll: () => apiFetch<FiquePorDentro[]>("/fique-por-dentro"),

  create: (data: FormData) =>
    apiFetch<FiquePorDentro>("/fique-por-dentro", { method: "POST", body: data }),

  update: (id: string, data: FormData) =>
    apiFetch<FiquePorDentro>(`/fique-por-dentro/${id}`, { method: "PUT", body: data }),

  remove: (id: string) =>
    apiFetch<void>(`/fique-por-dentro/${id}`, { method: "DELETE" }),
};
