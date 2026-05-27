import { apiFetch } from "./config";
import type {
  Hospedagem,
  CreateHospedagemDto,
  UpdateHospedagemDto,
} from "./types";

export const hospedagemApi = {
  getAll: () => apiFetch<Hospedagem[]>("/hospedagem"),
  getById: (id: string) => apiFetch<Hospedagem>(`/hospedagem/${id}`),
  create: (data: FormData) =>
    apiFetch<CreateHospedagemDto>("/hospedagem", {
      method: "POST",
      body: data,
    }),
  update: (id: string, data: FormData) =>
    apiFetch<UpdateHospedagemDto>("/hospedagem", {
      method: "PUT",
      body: data,
    }),
  remove: (id: string) =>
    apiFetch<void>(`/hospedagem/${id}`, { method: "DELETE" }),
};
