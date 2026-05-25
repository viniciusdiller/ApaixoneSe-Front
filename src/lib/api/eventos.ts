import { apiFetch } from "./config";
import type { Evento, CreateEventoDto, UpdateEventoDto } from "./types";

export const eventosApi = {
  getAll: () => apiFetch<Evento[]>("/eventos"),
  getById: (id: string) => apiFetch<Evento>(`/eventos/${id}`),
  create: (data: CreateEventoDto) =>
    apiFetch<Evento>("/eventos", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: UpdateEventoDto) =>
    apiFetch<Evento>(`/eventos/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id: string) => apiFetch<void>(`/eventos/${id}`, { method: "DELETE" }),
};
