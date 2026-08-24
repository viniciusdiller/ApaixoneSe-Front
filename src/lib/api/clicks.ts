import { apiFetch } from "./config";

export interface ClickStat {
  categoria: string;
  pagina: string;
  total: number;
}

export interface ClickStatsFiltro {
  categoria?: string;
  pagina?: string;
  dataInicio?: string;
  dataFim?: string;
}

export const clicksApi = {
  getStats: (filtro: ClickStatsFiltro = {}) => {
    const params = new URLSearchParams();
    if (filtro.categoria) params.set("categoria", filtro.categoria);
    if (filtro.pagina) params.set("pagina", filtro.pagina);
    if (filtro.dataInicio) params.set("dataInicio", filtro.dataInicio);
    if (filtro.dataFim) params.set("dataFim", filtro.dataFim);
    const query = params.toString();
    return apiFetch<ClickStat[]>(`clicks/stats${query ? `?${query}` : ""}`);
  },
};
