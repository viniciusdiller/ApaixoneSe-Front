import { apiFetch } from "./config";
import type {
  Hospedagem,
  CreateHospedagemDto,
  UpdateHospedagemDto,
} from "./types";

export const hospedagemApi = {
  /** POST /hospedagem */
  create: (dto: CreateHospedagemDto) =>
    apiFetch<Hospedagem>("/hospedagem", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  /** GET /hospedagem */
  getAll: () => apiFetch<Hospedagem[]>("/hospedagem"),

  /** GET /hospedagem/:id */
  getById: (id: number) => apiFetch<Hospedagem>(`/hospedagem/${id}`),

  /** PUT /hospedagem/:id */
  update: (id: number, dto: UpdateHospedagemDto) =>
    apiFetch<Hospedagem>(`/hospedagem/${id}`, {
      method: "PUT",
      body: JSON.stringify(dto),
    }),

  /** DELETE /hospedagem/:id */
  remove: (id: number) =>
    apiFetch<void>(`/hospedagem/${id}`, { method: "DELETE" }),
};
