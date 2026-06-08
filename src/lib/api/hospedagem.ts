import { api } from "./client";

export const HOSPEDAGEM_TAGS = [
  "Wi-Fi",
  "Piscina",
  "Ar-condicionado",
  "Estacionamento",
  "Pet Friendly",
  "Café da manhã",
  "Academia",
  "Beira-mar",
  "Chalé",
  "Bangalô",
] as const;

export type HospedagemTag = (typeof HOSPEDAGEM_TAGS)[number];

export interface Hospedagem {
  id: string;
  nome: string;
  telefone: string;
  endereco: string;
  textoDiferencial: string;
  cnpj: string;
  responsavelNome: string;
  responsavelCpf: string;
  documentoPdfUrl: string;
  logoUrl: string;
  usuarioId: string;
  instagram?: string | null;
  status: string;
  tags?: string[] | null;
}

export interface CreateHospedagemDto {
  nome: string;
  telefone: string;
  endereco: string;
  textoDiferencial: string;
  cnpj: string;
  responsavelNome: string;
  responsavelCpf: string;
  documentoPdfUrl: string;
  logoUrl: string;
  usuarioId: string;
  instagram?: string;
  tags?: string[];
}

export const hospedagemApi = {
  getAll: () => api.get<Hospedagem[]>("/hospedagem"),
  getById: (id: string) => api.get<Hospedagem>(`/hospedagem/${id}`),
  create: (formData: FormData) =>
    api.postFormData<Hospedagem>("/hospedagem", formData),
  update: (id: string, formData: FormData) =>
    api.patchFormData<Hospedagem>(`/hospedagem/${id}`, formData),
  delete: (id: string) => api.delete<void>(`/hospedagem/${id}`),
};
