import { apiFetch } from "./config";
import type { Atividade, CreateAtividadeDto, UpdateAtividadeDto } from "./types";

export const atividadesApi = {
  /** POST /atividades */
  create: (dto: CreateAtividadeDto) =>
    apiFetch<Atividade>("/atividades", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  /** GET /atividades */
  getAll: () => apiFetch<Atividade[]>("/atividades"),

  /** GET /atividades/roteiro/:roteiro */
  getByRoteiro: (roteiro: string) =>
    apiFetch<Atividade[]>(`/atividades/roteiro/${roteiro}`),

  /** GET /atividades/:id */
  getById: (id: number) => apiFetch<Atividade>(`/atividades/${id}`),

  /** PUT /atividades/:id */
  update: (id: number, dto: UpdateAtividadeDto) =>
    apiFetch<Atividade>(`/atividades/${id}`, {
      method: "PUT",
      body: JSON.stringify(dto),
    }),

  /** DELETE /atividades/:id */
  remove: (id: number) =>
    apiFetch<void>(`/atividades/${id}`, { method: "DELETE" }),
};
