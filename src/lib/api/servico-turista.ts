import { apiFetch } from "./config";
import type { ServicoTurista, CreateServicoTuristaDto, UpdateServicoTuristaDto } from "./types";

export const servicoTuristaApi = {
  getAll: () => apiFetch<ServicoTurista[]>("/servico-turista"),
  getById: (id: string) => apiFetch<ServicoTurista>(`/servico-turista/${id}`),

  /** Aceita FormData (multipart com logo/foto) ou JSON puro */
  create: (data: FormData | CreateServicoTuristaDto) =>
    apiFetch<ServicoTurista>("/servico-turista", {
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),

  /** Aceita FormData (multipart com logo/foto) ou JSON puro */
  update: (id: string, data: FormData | UpdateServicoTuristaDto) =>
    apiFetch<ServicoTurista>(`/servico-turista/${id}`, {
      method: "PUT",
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<void>(`/servico-turista/${id}`, { method: "DELETE" }),
};
