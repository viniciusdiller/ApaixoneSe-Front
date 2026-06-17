import { apiFetch } from "./config";
import type {
  CasaDeCambio,
  CreateCasaDeCambioDto,
  UpdateCasaDeCambioDto,
} from "./types";

export const casaDeCambioApi = {
  getAll: () => apiFetch<CasaDeCambio[]>("/casa-de-cambio"),
  getById: (id: string) => apiFetch<CasaDeCambio>(`/casa-de-cambio/${id}`),

  /** Cria via JSON — o backend usa @Body() com class-validator, sem FileInterceptor */
  create: (data: CreateCasaDeCambioDto) =>
    apiFetch<CasaDeCambio>("/casa-de-cambio", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** Atualiza via JSON */
  update: (id: string, data: UpdateCasaDeCambioDto) =>
    apiFetch<CasaDeCambio>(`/casa-de-cambio/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  /** Atualiza campo específico (ex: status) via JSON */
  updateStatus: (id: string, data: Partial<UpdateCasaDeCambioDto>) =>
    apiFetch<CasaDeCambio>(`/casa-de-cambio/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<void>(`/casa-de-cambio/${id}`, { method: "DELETE" }),
};
