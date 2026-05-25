import { apiFetch } from "./config";
import type { ServicoTurista, CreateServicoTuristaDto, UpdateServicoTuristaDto } from "./types";

export const servicoTuristaApi = {
  getAll: () => apiFetch<ServicoTurista[]>("/servico-turista"),
  getById: (id: string) => apiFetch<ServicoTurista>(`/servico-turista/${id}`),
  create: (data: CreateServicoTuristaDto) =>
    apiFetch<ServicoTurista>("/servico-turista", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: UpdateServicoTuristaDto) =>
    apiFetch<ServicoTurista>(`/servico-turista/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id: string) => apiFetch<void>(`/servico-turista/${id}`, { method: "DELETE" }),
};
