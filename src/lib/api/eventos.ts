import { apiFetch } from "./config";
import type { Evento } from "./types";

export const eventosApi = {
  getAll: () => apiFetch<Evento[]>("/eventos"),
  getDestaques: () => apiFetch<Evento[]>("/eventos/destaques"),
  getById: (id: string) => apiFetch<Evento>(`/eventos/${id}`),
  create: (data: FormData) =>
    apiFetch<Evento>("/eventos", { method: "POST", body: data }),
  update: (id: string, data: FormData) =>
    apiFetch<Evento>(`/eventos/${id}`, { method: "PUT", body: data }),
  remove: (id: string) => apiFetch<void>(`/eventos/${id}`, { method: "DELETE" }),
};
