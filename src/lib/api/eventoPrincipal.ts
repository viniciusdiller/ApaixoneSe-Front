import { apiFetch } from "./config";

export interface EventoPrincipal {
  id: string;
  titulo: string;
  etapa?: string | null;
  data: string; // ISO date string
}

export interface EventoPrincipalCreateDTO {
  titulo: string;
  etapa?: string;
  data: string; // "YYYY-MM-DD"
}

export const eventoPrincipalApi = {
  /** Público — retorna o evento principal ativo (ou array vazio) */
  getAll: () => apiFetch<EventoPrincipal[]>("/evento-principal"),

  /** Admin — cria o evento principal (só pode existir 1) */
  create: (data: EventoPrincipalCreateDTO) =>
    apiFetch<EventoPrincipal>("/evento-principal", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** Admin — atualiza o evento principal */
  update: (id: string, data: Partial<EventoPrincipalCreateDTO>) =>
    apiFetch<EventoPrincipal>(`/evento-principal/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  /** Admin — deleta o evento principal */
  delete: (id: string) =>
    apiFetch<void>(`/evento-principal/${id}`, { method: "DELETE" }),
};
