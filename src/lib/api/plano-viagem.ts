import { apiFetch } from "./config";
import type {
  PlanoViagem,
  CreatePlanoViagemDto,
  UpdatePlanoViagemDto,
  ItemPlanoViagem,
  CreateItemPlanoViagemDto,
} from "./types";

export const planoViagemApi = {
  getAll: () => apiFetch<PlanoViagem[]>("/plano-viagem"),
  getById: (id: string) => apiFetch<PlanoViagem>(`/plano-viagem/${id}`),
  create: (data: CreatePlanoViagemDto) =>
    apiFetch<PlanoViagem>("/plano-viagem", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: UpdatePlanoViagemDto) =>
    apiFetch<PlanoViagem>(`/plano-viagem/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id: string) => apiFetch<void>(`/plano-viagem/${id}`, { method: "DELETE" }),
};

export const itemPlanoViagemApi = {
  create: (data: CreateItemPlanoViagemDto) =>
    apiFetch<ItemPlanoViagem>("/item-plano-viagem", { method: "POST", body: JSON.stringify(data) }),
  remove: (id: string) => apiFetch<void>(`/item-plano-viagem/${id}`, { method: "DELETE" }),
};
