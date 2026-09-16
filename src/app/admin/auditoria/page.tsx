"use client";

import { useEffect, useState } from "react";
import { auditLogApi } from "@/lib/api";
import type { AcaoAuditoria, AuditLog } from "@/lib/api";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { LoadingGrid } from "@/components/ui/LoadingGrid";
import { ShieldCheck, CheckCircle2, XCircle, Pencil, Trash2 } from "lucide-react";

const PAGE_SIZE = 6;

// Traduz o nome tecnico do recurso (deriva do nome da controller no
// backend, ex: "ServicoTurista") pra algo que faça sentido pra quem nao
// programa. Novos recursos que ainda nao estao aqui caem no fallback
// (separaPalavras), que ao menos separa "PontoAgua" em "Ponto Agua".
const AREA_LABELS: Record<string, string> = {
  Gastronomia: "Gastronomia",
  Hospedagem: "Hospedagem",
  ServicoTurista: "Serviços ao Turista",
  Evento: "Eventos",
  EventoPrincipal: "Evento Principal",
  Atividade: "Atividades",
  PlanoViagem: "Plano de Viagem",
  ItemPlanoViagem: "Item do Plano de Viagem",
  Visita: "Check-ins",
  Cat: "CAT",
  CatMovel: "CAT Móvel",
  CasaDeCambio: "Casa de Câmbio",
  SecretariaTurismo: "Secretaria de Turismo",
  FiquePorDentro: "Fique Por Dentro",
  PontoAgua: "Praias e Lagoas",
  LocalCultural: "História",
  Clicks: "Cliques",
  User: "Usuários",
};

function separaPalavras(valor: string): string {
  return valor.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
}

function labelArea(recurso: string): string {
  return AREA_LABELS[recurso] ?? separaPalavras(recurso);
}

const ACOES: { value: AcaoAuditoria | ""; label: string }[] = [
  { value: "", label: "Todas as ações" },
  { value: "APROVAR", label: "Aprovações" },
  { value: "REJEITAR", label: "Rejeições" },
  { value: "EDITAR", label: "Edições" },
  { value: "EXCLUIR", label: "Exclusões" },
];

const AREAS = Object.keys(AREA_LABELS).sort((a, b) =>
  AREA_LABELS[a].localeCompare(AREA_LABELS[b], "pt-BR"),
);

const ACAO_INFO: Record<
  AcaoAuditoria,
  { verbo: string; className: string; Icon: typeof CheckCircle2 }
> = {
  APROVAR: {
    verbo: "aprovou",
    className:
      "bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400",
    Icon: CheckCircle2,
  },
  REJEITAR: {
    verbo: "rejeitou",
    className: "bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-400",
    Icon: XCircle,
  },
  EDITAR: {
    verbo: "editou",
    className:
      "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400",
    Icon: Pencil,
  },
  EXCLUIR: {
    verbo: "excluiu",
    className:
      "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
    Icon: Trash2,
  },
};

function formatDateTime(dateStr: string): { data: string; hora: string } {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return { data: "—", hora: "" };
  return {
    data: d.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }),
    hora: d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
  };
}

function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/);
  const primeira = partes[0]?.[0] ?? "?";
  const ultima = partes.length > 1 ? partes[partes.length - 1][0] : "";
  return (primeira + ultima).toUpperCase();
}

function LinhaAuditoria({ log }: { log: AuditLog }) {
  const info = ACAO_INFO[log.acao];
  const { data, hora } = formatDateTime(log.createdAt);
  const area = labelArea(log.recurso);

  return (
    <li className="flex items-start gap-4 border-b border-border px-4 py-4 last:border-0 sm:px-6">
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${info.className}`}
        aria-hidden="true"
      >
        <info.Icon size={16} />
      </span>

      <div className="min-w-0 flex-1">
        <p className="text-sm leading-relaxed text-foreground">
          <span className="font-semibold">{log.adminNome}</span>{" "}
          {info.verbo}{" "}
          {log.descricao ? (
            <span className="font-semibold">&ldquo;{log.descricao}&rdquo;</span>
          ) : (
            <span className="text-muted-foreground">um registro</span>
          )}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 font-medium">
            {area}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            {data} às {hora}
          </span>
        </div>
      </div>

      <span
        className="hidden h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary sm:flex"
        title={log.adminNome}
        aria-hidden="true"
      >
        {iniciais(log.adminNome)}
      </span>
    </li>
  );
}

export default function AdminAuditoriaPage() {
  const [items, setItems] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);
  const [page, setPage] = useState(1);
  const [acao, setAcao] = useState<AcaoAuditoria | "">("");
  const [recurso, setRecurso] = useState("");

  useEffect(() => {
    setLoading(true);
    setErro(false);
    auditLogApi
      .getAll({
        page,
        pageSize: PAGE_SIZE,
        acao: acao || undefined,
        recurso: recurso || undefined,
      })
      .then((res) => {
        setItems(res.items);
        setTotal(res.total);
      })
      .catch(() => setErro(true))
      .finally(() => setLoading(false));
  }, [page, acao, recurso]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleFiltroChange = (fn: () => void) => {
    fn();
    setPage(1);
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 font-display text-2xl font-bold uppercase tracking-widest sm:text-3xl">
            <ShieldCheck className="h-6 w-6 text-primary" />
            Auditoria
          </h1>
          <p className="text-sm text-muted-foreground">
            O que os administradores aprovaram, editaram ou excluíram no
            sistema.
            {total > 0 && ` ${total} registros`}
            {totalPages > 1 && ` — página ${page} de ${totalPages}`}
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <select
          value={acao}
          onChange={(e) =>
            handleFiltroChange(() => setAcao(e.target.value as AcaoAuditoria | ""))
          }
          className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          {ACOES.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>

        <select
          value={recurso}
          onChange={(e) => handleFiltroChange(() => setRecurso(e.target.value))}
          className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        >
          <option value="">Todas as áreas</option>
          {AREAS.map((r) => (
            <option key={r} value={r}>
              {AREA_LABELS[r]}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <LoadingGrid count={3} />
      ) : erro ? (
        <div className="rounded-xl border border-border bg-card py-16 text-center text-muted-foreground">
          Não foi possível carregar o histórico de ações.
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-border bg-card py-16 text-center text-muted-foreground">
          Nenhuma ação administrativa registrada ainda.
        </div>
      ) : (
        <>
          <ul className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            {items.map((log) => (
              <LinhaAuditoria key={log.id} log={log} />
            ))}
          </ul>

          <AdminPagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
