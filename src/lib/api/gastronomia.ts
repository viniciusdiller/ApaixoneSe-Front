import { apiFetch } from "./config";
import type { Gastronomia, CreateGastronomiaDto, UpdateGastronomiaDto } from "./types";

export const gastronomiaApi = {
  getAll: () => apiFetch<Gastronomia[]>("/gastronomia"),
  getById: (id: string) => apiFetch<Gastronomia>(`/gastronomia/${id}`),
  create: (data: CreateGastronomiaDto) =>
    apiFetch<Gastronomia>("/gastronomia", { method: "POST", body: JSON.stringify(data) }),
  update: (id: string, data: UpdateGastronomiaDto) =>
    apiFetch<Gastronomia>(`/gastronomia/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  remove: (id: string) => apiFetch<void>(`/gastronomia/${id}`, { method: "DELETE" }),
};
