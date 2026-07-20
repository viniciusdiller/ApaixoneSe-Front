import { apiFetch } from "./config";
import type { PontoAgua, TipoPontoAgua } from "./types";

export const pontosAguaApi = {
  getAll: () => apiFetch<PontoAgua[]>("/pontos-agua"),
  getByTipo: (tipo: TipoPontoAgua) =>
    apiFetch<PontoAgua[]>(`/pontos-agua/tipo/${tipo}`),
  getById: (id: string) => apiFetch<PontoAgua>(`/pontos-agua/${id}`),
  getBySlug: (slug: string) => apiFetch<PontoAgua>(`/pontos-agua/slug/${slug}`),
  create: (data: FormData) =>
    apiFetch<PontoAgua>("/pontos-agua", { method: "POST", body: data }),
  update: (id: string, data: FormData) =>
    apiFetch<PontoAgua>(`/pontos-agua/${id}`, { method: "PUT", body: data }),
  remove: (id: string) =>
    apiFetch<void>(`/pontos-agua/${id}`, { method: "DELETE" }),
};
