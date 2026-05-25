import { apiFetch } from "./config";
import type { Hospedagem, CreateHospedagemDto, UpdateHospedagemDto } from "./types";

export const hospedagemApi = {
  getAll: () => apiFetch<Hospedagem[]>("/hospedagem"),
  getById: (id: string) => apiFetch<Hospedagem>(`/hospedagem/${id}`),
  create: (data: CreateHospedagemDto) =>
    apiFetch<Hospedagem>("/hospedagem", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: UpdateHospedagemDto) =>
    apiFetch<Hospedagem>(`/hospedagem/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id: string) => apiFetch<void>(`/hospedagem/${id}`, { method: "DELETE" }),
};
