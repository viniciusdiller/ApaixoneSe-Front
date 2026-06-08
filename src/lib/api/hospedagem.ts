import { apiFetch } from "./config";
import type { Hospedagem, CreateHospedagemDto, UpdateHospedagemDto } from "./types";

export const HOSPEDAGEM_TAGS = [
  "Wi-Fi",
  "Piscina",
  "Ar-condicionado",
  "Estacionamento",
  "Pet Friendly",
  "Caf\u00e9 da manh\u00e3",
  "Academia",
  "Beira-mar",
  "Chal\u00e9",
  "Bangal\u00f4",
] as const;

export type HospedagemTag = (typeof HOSPEDAGEM_TAGS)[number];

export const hospedagemApi = {
  getAll: () => apiFetch<Hospedagem[]>("/hospedagem"),
  getById: (id: string) => apiFetch<Hospedagem>(`/hospedagem/${id}`),

  /** Cria com FormData (multipart com logo/pdf/tags) */
  create: (data: FormData) =>
    apiFetch<Hospedagem>("/hospedagem", {
      method: "POST",
      body: data,
    }),

  /** Atualiza com FormData (multipart) */
  update: (id: string, data: FormData) =>
    apiFetch<Hospedagem>(`/hospedagem/${id}`, {
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
