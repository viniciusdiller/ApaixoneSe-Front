import { apiFetch } from "./config";
import type {
  SecretariaTurismo,
  UpdateSecretariaTurismoDto,
  Turistando,
  Projeto,
} from "./types";

// ─── Secretaria principal ─────────────────────────────────────────────────────
export const secretariaTurismoApi = {
  /** GET /secretaria-turismo — retorna lista (inclui turistando[] e projetos[]) */
  getAll: () => apiFetch<SecretariaTurismo[]>("/secretaria-turismo"),

  /** GET /secretaria-turismo/:id */
  getById: (id: string) =>
    apiFetch<SecretariaTurismo>(`/secretaria-turismo/${id}`),

  /**
   * POST /secretaria-turismo
   * FormData fields: texto (string), video? (File)
   */
  create: (data: FormData) =>
    apiFetch<SecretariaTurismo>("/secretaria-turismo", {
      method: "POST",
      body: data,
    }),

  /**
   * PUT /secretaria-turismo/:id
   * FormData fields: texto? (string), video? (File)
   */
  update: (id: string, data: FormData) =>
    apiFetch<SecretariaTurismo>(`/secretaria-turismo/${id}`, {
      method: "PUT",
      body: data,
    }),

  /** DELETE /secretaria-turismo/:id */
  remove: (id: string) =>
    apiFetch<void>(`/secretaria-turismo/${id}`, { method: "DELETE" }),
};

// ─── Turistando ───────────────────────────────────────────────────────────────
export const turistandoApi = {
  /**
   * POST /secretaria-turismo/:id/turistando
   * FormData fields: titulo, texto, imagens[]? (Files — até 10)
   */
  add: (secretariaId: string, data: FormData) =>
    apiFetch<Turistando>(`/secretaria-turismo/${secretariaId}/turistando`, {
      method: "POST",
      body: data,
    }),

  /**
   * PUT /secretaria-turismo/turistando/:turistandoId
   * FormData fields: titulo?, texto?, imagens[]? (Files)
   */
  update: (turistandoId: string, data: FormData) =>
    apiFetch<Turistando>(
      `/secretaria-turismo/turistando/${turistandoId}`,
      { method: "PUT", body: data }
    ),

  /** DELETE /secretaria-turismo/turistando/:turistandoId */
  remove: (turistandoId: string) =>
    apiFetch<void>(`/secretaria-turismo/turistando/${turistandoId}`, {
      method: "DELETE",
    }),

  /** DELETE /secretaria-turismo/turistando  body: { ids: string[] } */
  removeMany: (ids: string[]) =>
    apiFetch<void>(`/secretaria-turismo/turistando`, {
      method: "DELETE",
      body: JSON.stringify({ ids }),
    }),
};

// ─── Projetos ─────────────────────────────────────────────────────────────────
export const projetoApi = {
  /**
   * POST /secretaria-turismo/:id/projeto
   * FormData fields: titulo, descricao, imagem? (File — 1 imagem)
   */
  add: (secretariaId: string, data: FormData) =>
    apiFetch<Projeto>(`/secretaria-turismo/${secretariaId}/projeto`, {
      method: "POST",
      body: data,
    }),

  /**
   * PUT /secretaria-turismo/projeto/:projetoId
   * FormData fields: titulo?, descricao?, imagem? (File)
   */
  update: (projetoId: string, data: FormData) =>
    apiFetch<Projeto>(`/secretaria-turismo/projeto/${projetoId}`, {
      method: "PUT",
      body: data,
    }),

  /** DELETE /secretaria-turismo/projeto/:projetoId */
  remove: (projetoId: string) =>
    apiFetch<void>(`/secretaria-turismo/projeto/${projetoId}`, {
      method: "DELETE",
    }),

  /** DELETE /secretaria-turismo/projeto  body: { ids: string[] } */
  removeMany: (ids: string[]) =>
    apiFetch<void>(`/secretaria-turismo/projeto`, {
      method: "DELETE",
      body: JSON.stringify({ ids }),
    }),
};
