import { apiFetch } from "./config";
import type {
  ServicoTurista,
  CreateServicoTuristaDto,
  UpdateServicoTuristaDto,
} from "./types";

export const servicoTuristaApi = {
  getAll: () => apiFetch<ServicoTurista[]>("/servico-turista"),
  getById: (id: string) => apiFetch<ServicoTurista>(`/servico-turista/${id}`),

  /** Cria com FormData (multipart com logo/foto) */
  create: (data: FormData) =>
    apiFetch<CreateServicoTuristaDto>("/servico-turista", {
      method: "POST",
      body: data,
    }),

  /** Atualiza com FormData (multipart com logo/foto) — usado nos formulários de edição */
  update: (id: string, data: FormData) =>
    apiFetch<UpdateServicoTuristaDto>(`/servico-turista/${id}`, {
      method: "PUT",
      body: data,
    }),

  /** Atualiza apenas campos simples via JSON (ex: { status: "APROVADO" }) — usado no painel admin */
  updateStatus: (id: string, data: Partial<UpdateServicoTuristaDto>) =>
    apiFetch<ServicoTurista>(`/servico-turista/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<void>(`/servico-turista/${id}`, { method: "DELETE" }),
};
