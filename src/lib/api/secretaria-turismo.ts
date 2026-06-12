import { apiFetch } from "./config";
import type {
  SecretariaTurismo,
  CreateSecretariaTurismoDto,
  UpdateSecretariaTurismoDto,
} from "./types";

export const secretariaTurismoApi = {
  getAll: () => apiFetch<SecretariaTurismo[]>("/secretaria-turismo"),
  getById: (id: string) =>
    apiFetch<SecretariaTurismo>(`/secretaria-turismo/${id}`),

  /** Cria com FormData (multipart — texto, imagens, vídeo) */
  create: (data: FormData) =>
    apiFetch<SecretariaTurismo>("/secretaria-turismo", {
      method: "POST",
      body: data,
    }),

  /** Atualiza com FormData */
  update: (id: string, data: FormData) =>
    apiFetch<SecretariaTurismo>(`/secretaria-turismo/${id}`, {
      method: "PUT",
      body: data,
    }),

  /** Atualiza campos simples via JSON */
  updatePartial: (id: string, data: Partial<UpdateSecretariaTurismoDto>) =>
    apiFetch<SecretariaTurismo>(`/secretaria-turismo/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  remove: (id: string) =>
    apiFetch<void>(`/secretaria-turismo/${id}`, { method: "DELETE" }),
};
