import { apiFetch } from "./config";
import type {
  Hospedagem,
  CreateHospedagemDto,
  UpdateHospedagemDto,
} from "./types";

export const hospedagemApi = {
  getAll: () => apiFetch<Hospedagem[]>("/hospedagem"),
  getById: (id: string) => apiFetch<Hospedagem>(`/hospedagem/${id}`),

  /** Cria com FormData (multipart com logo) */
  create: (data: FormData) =>
    apiFetch<CreateHospedagemDto>("/hospedagem", {
      method: "POST",
      body: data,
    }),

  /** Atualiza com FormData (multipart com logo) — usado nos formulários de edição */
  update: (id: string, data: FormData) =>
    apiFetch<UpdateHospedagemDto>(`/hospedagem/${id}`, {
      method: "PUT",
      body: data,
    }),

  /** Atualiza apenas campos simples via JSON (ex: { status: "APROVADO" }) — usado no painel admin */
  updateStatus: (id: string, data: Partial<UpdateHospedagemDto>) =>
    apiFetch<Hospedagem>(`/hospedagem/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiFetch<void>(`/hospedagem/${id}`, { method: "DELETE" }),
};
