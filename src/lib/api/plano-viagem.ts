import { apiFetch } from "./config";
import type {
  PlanoViagem,
  CreatePlanoViagemDto,
  UpdatePlanoViagemDto,
  ItemPlanoViagem,
  CreateItemPlanoViagemDto,
} from "./types";

export const planoViagemApi = {
  /** POST /plano-viagem */
  create: (dto: CreatePlanoViagemDto) =>
    apiFetch<PlanoViagem>("/plano-viagem", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  /** GET /plano-viagem */
  getAll: () => apiFetch<PlanoViagem[]>("/plano-viagem"),

  /** GET /plano-viagem/:id */
  getById: (id: number) => apiFetch<PlanoViagem>(`/plano-viagem/${id}`),

  /** PUT /plano-viagem/:id */
  update: (id: number, dto: UpdatePlanoViagemDto) =>
    apiFetch<PlanoViagem>(`/plano-viagem/${id}`, {
      method: "PUT",
      body: JSON.stringify(dto),
    }),

  /** DELETE /plano-viagem/:id */
  remove: (id: number) =>
    apiFetch<void>(`/plano-viagem/${id}`, { method: "DELETE" }),
};

export const itemPlanoViagemApi = {
  /** POST /item-plano-viagem */
  create: (dto: CreateItemPlanoViagemDto) =>
    apiFetch<ItemPlanoViagem>("/item-plano-viagem", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  /** DELETE /item-plano-viagem/:id */
  remove: (id: number) =>
    apiFetch<void>(`/item-plano-viagem/${id}`, { method: "DELETE" }),
};
