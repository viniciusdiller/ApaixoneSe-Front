import { apiFetch } from "./config";
import type { Atividade } from "./types";

export const atividadesApi = {
  getAll: () => apiFetch<Atividade[]>("/atividades"),
  getById: (id: string) => apiFetch<Atividade>(`/atividades/${id}`),
  getByRoteiro: (roteiro: string) => apiFetch<Atividade[]>(`/atividades/roteiro/${roteiro}`),
  create: (data: FormData) =>
    apiFetch<Atividade>("/atividades", { method: "POST", body: data }),
  update: (id: string, data: FormData) =>
    apiFetch<Atividade>(`/atividades/${id}`, { method: "PUT", body: data }),
  remove: (id: string) => apiFetch<void>(`/atividades/${id}`, { method: "DELETE" }),
};
