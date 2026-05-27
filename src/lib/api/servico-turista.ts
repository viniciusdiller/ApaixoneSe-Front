import { apiFetch } from "./config";
import type {
  ServicoTurista,
  CreateServicoTuristaDto,
  UpdateServicoTuristaDto,
} from "./types";

export const servicoTuristaApi = {
  getAll: () => apiFetch<ServicoTurista[]>("/servico-turista"),
  getById: (id: string) => apiFetch<ServicoTurista>(`/servico-turista/${id}`),

  /** Aceita FormData (multipart com logo/foto) ou JSON puro */
  create: (data: FormData) =>
    apiFetch<CreateServicoTuristaDto>("/servico-turista", {
      method: "POST",
      body: data,
    }),

  /** Aceita FormData (multipart com logo/foto) ou JSON puro */
  update: (id: string, data: FormData) =>
    apiFetch<UpdateServicoTuristaDto>(`/servico-turista/${id}`, {
      method: "PUT",
      body: data,
    }),

  delete: (id: string) =>
    apiFetch<void>(`/servico-turista/${id}`, { method: "DELETE" }),
};
