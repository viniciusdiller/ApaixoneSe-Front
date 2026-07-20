import { apiFetch } from "./config";
import type { CasaDeCambio, UpdateCasaDeCambioDto } from "./types";

export const casaDeCambioApi = {
  getAll: () => apiFetch<CasaDeCambio[]>("/casa-de-cambio"),
  getById: (id: string) => apiFetch<CasaDeCambio>(`/casa-de-cambio/${id}`),

  /** Cria com FormData (multipart com logo) */
  create: (data: FormData) =>
    apiFetch<CasaDeCambio>("/casa-de-cambio", {
      method: "POST",
      body: data,
    }),

  /** Atualiza com FormData (multipart com logo) */
  update: (id: string, data: FormData) =>
    apiFetch<CasaDeCambio>(`/casa-de-cambio/${id}`, {
      method: "PUT",
      body: data,
    }),

  /** Atualiza apenas campos simples via JSON (ex: { status: "APROVADO" }) */
  updateStatus: (id: string, data: Partial<UpdateCasaDeCambioDto>) =>
    apiFetch<CasaDeCambio>(`/casa-de-cambio/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<void>(`/casa-de-cambio/${id}`, { method: "DELETE" }),
};
