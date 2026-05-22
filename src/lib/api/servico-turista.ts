import { apiFetch } from "./config";
import type {
  ServicoTurista,
  CreateServicoTuristaDto,
  UpdateServicoTuristaDto,
} from "./types";

export const servicoTuristaApi = {
  /** POST /servico-turista */
  create: (dto: CreateServicoTuristaDto) =>
    apiFetch<ServicoTurista>("/servico-turista", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  /** GET /servico-turista */
  getAll: () => apiFetch<ServicoTurista[]>("/servico-turista"),

  /** GET /servico-turista/:id */
  getById: (id: number) => apiFetch<ServicoTurista>(`/servico-turista/${id}`),

  /** PUT /servico-turista/:id */
  update: (id: number, dto: UpdateServicoTuristaDto) =>
    apiFetch<ServicoTurista>(`/servico-turista/${id}`, {
      method: "PUT",
      body: JSON.stringify(dto),
    }),

  /** DELETE /servico-turista/:id */
  remove: (id: number) =>
    apiFetch<void>(`/servico-turista/${id}`, { method: "DELETE" }),
};
