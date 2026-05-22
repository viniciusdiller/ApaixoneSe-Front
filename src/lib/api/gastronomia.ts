import { apiFetch } from "./config";
import type {
  Gastronomia,
  CreateGastronomiaDto,
  UpdateGastronomiaDto,
} from "./types";

export const gastronomiaApi = {
  /** POST /gastronomia */
  create: (dto: CreateGastronomiaDto) =>
    apiFetch<Gastronomia>("/gastronomia", {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  /** GET /gastronomia */
  getAll: () => apiFetch<Gastronomia[]>("/gastronomia"),

  /** GET /gastronomia/:id */
  getById: (id: number) => apiFetch<Gastronomia>(`/gastronomia/${id}`),

  /** PUT /gastronomia/:id */
  update: (id: number, dto: UpdateGastronomiaDto) =>
    apiFetch<Gastronomia>(`/gastronomia/${id}`, {
      method: "PUT",
      body: JSON.stringify(dto),
    }),

  /** DELETE /gastronomia/:id */
  remove: (id: number) =>
    apiFetch<void>(`/gastronomia/${id}`, { method: "DELETE" }),
};
