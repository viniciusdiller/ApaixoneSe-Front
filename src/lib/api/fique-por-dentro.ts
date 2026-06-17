import { apiFetch } from "./config";
import type { FiquePorDentro } from "./types";

export const fiquePorDentroApi = {
  /** Lista todas as imagens ordenadas (público) */
  getAll: () =>
    apiFetch<FiquePorDentro[]>("/fique-por-dentro"),

  /** Cria nova imagem numa posição livre (ADMIN) */
  create: (formData: FormData) =>
    apiFetch<FiquePorDentro>("/fique-por-dentro", {
      method: "POST",
      body: formData,
    }),

  /** Substitui a imagem de um item (ADMIN) */
  update: (id: string, formData: FormData) =>
    apiFetch<FiquePorDentro>(`/fique-por-dentro/${id}`, {
      method: "PUT",
      body: formData,
    }),

  /** Troca as ordens de dois itens atomicamente (ADMIN) */
  swap: (idA: string, idB: string) =>
    apiFetch<{ message: string }>("/fique-por-dentro/swap", {
      method: "PUT",
      body: JSON.stringify({ idA, idB }),
    }),

  /** Remove uma imagem pelo ID (ADMIN) */
  remove: (id: string) =>
    apiFetch<void>(`/fique-por-dentro/${id}`, { method: "DELETE" }),
};
