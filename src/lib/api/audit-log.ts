import { apiFetch } from "./config";

export type AcaoAuditoria = "APROVAR" | "REJEITAR" | "EDITAR" | "EXCLUIR";

export interface AuditLog {
  id: string;
  acao: AcaoAuditoria;
  recurso: string;
  recursoId?: string | null;
  descricao?: string | null;
  detalhes?: Record<string, unknown> | null;
  ip?: string | null;
  adminId: string;
  adminNome: string;
  createdAt: string;
}

export interface AuditLogPage {
  items: AuditLog[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AuditLogFiltro {
  page?: number;
  pageSize?: number;
  adminId?: string;
  acao?: AcaoAuditoria;
  recurso?: string;
}

export const auditLogApi = {
  getAll: (filtro: AuditLogFiltro = {}) => {
    const params = new URLSearchParams();
    params.set("page", String(filtro.page ?? 1));
    params.set("pageSize", String(filtro.pageSize ?? 20));
    if (filtro.adminId) params.set("adminId", filtro.adminId);
    if (filtro.acao) params.set("acao", filtro.acao);
    if (filtro.recurso) params.set("recurso", filtro.recurso);
    return apiFetch<AuditLogPage>(`/audit-log?${params.toString()}`);
  },
};
