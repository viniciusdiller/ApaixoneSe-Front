import { apiFetch } from "./config";
import type {
  SecretariaTurismo,
  Turistando,
  Projeto,
} from "./types";

// ─── Secretaria principal ─────────────────────────────────────────────────────
export const secretariaTurismoApi = {
  getAll: () => apiFetch<SecretariaTurismo[]>("/secretaria-turismo"),

  getById: (id: string) =>
    apiFetch<SecretariaTurismo>(`/secretaria-turismo/${id}`),

  /**
   * POST /secretaria-turismo
   * FormData fields: textoExplicativo (string), video? (File)
   */
  create: (data: FormData) =>
    apiFetch<SecretariaTurismo>("/secretaria-turismo", {
      method: "POST",
      body: data,
    }),

  /**
   * PUT /secretaria-turismo/:id
   * FormData fields: textoExplicativo? (string), video? (File)
   */
  update: (id: string, data: FormData) =>
    apiFetch<SecretariaTurismo>(`/secretaria-turismo/${id}`, {
      method: "PUT",
      body: data,
    }),

  remove: (id: string) =>
    apiFetch<void>(`/secretaria-turismo/${id}`, { method: "DELETE" }),
};

// ─── Turistando ───────────────────────────────────────────────────────────────
export const turistandoApi = {
  add: (secretariaId: string, data: FormData) =>
    apiFetch<Turistando>(`/secretaria-turismo/${secretariaId}/turistando`, {
      method: "POST",
      body: data,
    }),

  update: (turistandoId: string, data: FormData) =>
    apiFetch<Turistando>(
      `/secretaria-turismo/turistando/${turistandoId}`,
      { method: "PUT", body: data }
    ),

  remove: (turistandoId: string) =>
    apiFetch<void>(`/secretaria-turismo/turistando/${turistandoId}`, {
      method: "DELETE",
    }),

  removeMany: (ids: string[]) =>
    apiFetch<void>(`/secretaria-turismo/turistando`, {
      method: "DELETE",
      body: JSON.stringify({ ids }),
    }),

  /**
   * PATCH /secretaria-turismo/turistando/reorder
   * Body: { items: [{ id: string; ordem: number }] }
   */
  reorder: (items: { id: string; ordem: number }[]) =>
    apiFetch<void>(`/secretaria-turismo/turistando/reorder`, {
      method: "PATCH",
      body: JSON.stringify({ items }),
    }),
};

// ─── Projetos ─────────────────────────────────────────────────────────────────
export const projetoApi = {
  add: (secretariaId: string, data: FormData) =>
    apiFetch<Projeto>(`/secretaria-turismo/${secretariaId}/projeto`, {
      method: "POST",
      body: data,
    }),

  update: (projetoId: string, data: FormData) =>
    apiFetch<Projeto>(`/secretaria-turismo/projeto/${projetoId}`, {
      method: "PUT",
      body: data,
    }),

  remove: (projetoId: string) =>
    apiFetch<void>(`/secretaria-turismo/projeto/${projetoId}`, {
      method: "DELETE",
    }),

  removeMany: (ids: string[]) =>
    apiFetch<void>(`/secretaria-turismo/projeto`, {
      method: "DELETE",
      body: JSON.stringify({ ids }),
    }),
};
