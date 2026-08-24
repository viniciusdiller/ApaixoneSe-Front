import { apiFetch } from "./config";

export interface ClickStat {
  categoria: string;
  /** Identificador bruto (uuid/slug/valor fixo) — não exibir quando for uuid, use paginaLabel */
  pagina: string;
  /** Nome real resolvido no backend — sempre use isso pra exibir, nunca `pagina` */
  paginaLabel: string;
  /** Slug do "pai" quando o item pertence a outro (hoje só atividades → slug do roteiro) */
  paginaPai?: string;
  total: number;
}

export interface ClickStatsResumo {
  totalCliques: number;
  totalCombinacoes: number;
  topItem: ClickStat | null;
}

export interface ClickStatsPage {
  items: ClickStat[];
  page: number;
  limit: number;
  totalPaginas: number;
  resumo: ClickStatsResumo;
}

export interface ClickStatsFiltro {
  categoria?: string;
  pagina?: string;
  dataInicio?: string;
  dataFim?: string;
  page?: number;
  limit?: number;
}

export const clicksApi = {
  getStats: (filtro: ClickStatsFiltro = {}) => {
    const params = new URLSearchParams();
    if (filtro.categoria) params.set("categoria", filtro.categoria);
    if (filtro.pagina) params.set("pagina", filtro.pagina);
    if (filtro.dataInicio) params.set("dataInicio", filtro.dataInicio);
    if (filtro.dataFim) params.set("dataFim", filtro.dataFim);
    params.set("page", String(filtro.page ?? 1));
    params.set("limit", String(filtro.limit ?? 10));
    return apiFetch<ClickStatsPage>(`/clicks/stats?${params.toString()}`);
  },
};
