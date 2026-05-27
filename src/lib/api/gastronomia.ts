import { apiFetch } from "./config";
import type {
  Gastronomia,
  CreateGastronomiaDto,
  UpdateGastronomiaDto,
} from "./types";

export const gastronomiaApi = {
  getAll: () => apiFetch<Gastronomia[]>("/gastronomia"),
  getById: (id: string) => apiFetch<Gastronomia>(`/gastronomia/${id}`),
  create: (data: FormData) =>
    apiFetch<Gastronomia>("/gastronomia", { method: "POST", body: data }),
  update: (id: string, data: FormData) =>
    apiFetch<Gastronomia>(`/gastronomia/${id}`, { method: "PUT", body: data }),
  remove: (id: string) =>
    apiFetch<void>(`/gastronomia/${id}`, { method: "DELETE" }),
};
