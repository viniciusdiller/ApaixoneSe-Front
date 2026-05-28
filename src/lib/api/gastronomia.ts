import { apiFetch } from "./config";
import type {
  Gastronomia,
  CreateGastronomiaDto,
  UpdateGastronomiaDto,
} from "./types";

export const gastronomiaApi = {
  getAll: () => apiFetch<Gastronomia[]>("/gastronomia"),
  getById: (id: string) => apiFetch<Gastronomia>(`/gastronomia/${id}`),

  /** Cria com FormData (multipart com logo/foto) */
  create: (data: FormData) =>
    apiFetch<CreateGastronomiaDto>("/gastronomia", {
      method: "POST",
      body: data,
    }),

  /** Atualiza com FormData (multipart com logo/foto) — usado nos formulários de edição */
  update: (id: string, data: FormData) =>
    apiFetch<UpdateGastronomiaDto>(`/gastronomia/${id}`, {
      method: "PUT",
      body: data,
    }),

  /** Atualiza apenas campos simples via JSON (ex: { status: "APROVADO" }) — usado no painel admin */
  updateStatus: (id: string, data: Partial<UpdateGastronomiaDto>) =>
    apiFetch<Gastronomia>(`/gastronomia/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<void>(`/gastronomia/${id}`, { method: "DELETE" }),
};
