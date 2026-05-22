import { apiFetch } from "./config";
import type { Evento, CreateEventoDto, UpdateEventoDto } from "./types";

export const eventosApi = {
  /** POST /eventos */
  create: (dto: CreateEventoDto) =>
    apiFetch<Evento>("/eventos", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  /** GET /eventos */
  getAll: () => apiFetch<Evento[]>("/eventos"),

  /** GET /eventos/:id */
  getById: (id: number) => apiFetch<Evento>(`/eventos/${id}`),

  /** PUT /eventos/:id */
  update: (id: number, dto: UpdateEventoDto) =>
    apiFetch<Evento>(`/eventos/${id}`, {
      method: "PUT",
      body: JSON.stringify(dto),
    }),

  /** DELETE /eventos/:id */
  remove: (id: number) =>
    apiFetch<void>(`/eventos/${id}`, { method: "DELETE" }),
};
