import { apiFetch } from "./config";
import type { Cat, CreateCatDto, UpdateCatDto } from "./types";

export const catApi = {
  /** POST /cat */
  create: (dto: CreateCatDto) =>
    apiFetch<Cat>("/cat", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  /** GET /cat */
  getAll: () => apiFetch<Cat[]>("/cat"),

  /** GET /cat/:id */
  getById: (id: number) => apiFetch<Cat>(`/cat/${id}`),

  /** PUT /cat/:id */
  update: (id: number, dto: UpdateCatDto) =>
    apiFetch<Cat>(`/cat/${id}`, {
      method: "PUT",
      body: JSON.stringify(dto),
    }),

  /** DELETE /cat/:id */
  remove: (id: number) =>
    apiFetch<void>(`/cat/${id}`, { method: "DELETE" }),
};
