import { apiFetch } from "./config";
import type { Atividade, CreateAtividadeDto, UpdateAtividadeDto } from "./types";

export const atividadesApi = {
  getAll: () => apiFetch<Atividade[]>("/atividades"),
  getById: (id: string) => apiFetch<Atividade>(`/atividades/${id}`),
  getByRoteiro: (roteiro: string) => apiFetch<Atividade[]>(`/atividades/roteiro/${roteiro}`),
  create: (data: CreateAtividadeDto) =>
    apiFetch<Atividade>("/atividades", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: UpdateAtividadeDto) =>
    apiFetch<Atividade>(`/atividades/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id: string) => apiFetch<void>(`/atividades/${id}`, { method: "DELETE" }),
};
