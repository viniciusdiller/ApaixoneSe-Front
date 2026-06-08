import { apiFetch } from "./config";

export interface MinhasVisitas {
  gastronomias: string[];
  atividades: string[];
}

interface ToggleResponse {
  message: string;
  status: "adicionado" | "removido";
}

export const visitasApi = {
  /** Carrega os IDs de gastronomias e atividades já visitadas pelo usuário logado */
  getMinhasVisitas: () =>
    apiFetch<MinhasVisitas>("/visitas/minhas"),

  /** Faz toggle de check-in em uma gastronomia (marca ou desmarca) */
  toggleGastronomia: (gastronomiaId: string) =>
    apiFetch<ToggleResponse>(`/visitas/gastronomia/${gastronomiaId}`, {
      method: "POST",
    }),

  /** Faz toggle de check-in em uma atividade (marca ou desmarca) */
  toggleAtividade: (atividadeId: string) =>
    apiFetch<ToggleResponse>(`/visitas/atividade/${atividadeId}`, {
      method: "POST",
    }),
};
