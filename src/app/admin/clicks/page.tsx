"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  Filter,
  RotateCcw,
  MousePointerClick,
  Layers,
  Trophy,
  CalendarRange,
} from "lucide-react";
import { clicksApi } from "@/lib/api";
import type { ClickStat, ClickStatsResumo } from "@/lib/api";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { LoadingGrid } from "@/components/ui/LoadingGrid";

const PAGE_SIZE = 10;

// 4 grupos categóricos (não 15 cores — 15 seria ruído visual e falha de
// acessibilidade). Reaproveita as cores já usadas no dashboard principal.
type Grupo = "lugares" | "estabelecimentos" | "eventos" | "institucional";

const GRUPOS: Record<
  Grupo,
  { label: string; bg: string; text: string; dot: string }
> = {
  lugares: {
    label: "Lugares",
    bg: "bg-restinga/10",
    text: "text-restinga",
    dot: "bg-restinga",
  },
  estabelecimentos: {
    label: "Estabelecimentos",
    bg: "bg-secondary/10",
    text: "text-secondary",
    dot: "bg-secondary",
  },
  eventos: {
    label: "Eventos",
    bg: "bg-accent/15",
    text: "text-accent-foreground",
    dot: "bg-accent",
  },
  institucional: {
    label: "Institucional",
    bg: "bg-primary/10",
    text: "text-primary",
    dot: "bg-primary",
  },
};

const CATEGORIAS: { valor: string; label: string; grupo: Grupo }[] = [
  { valor: "praias", label: "Praias", grupo: "lugares" },
  { valor: "lagoas", label: "Lagoas", grupo: "lugares" },
  { valor: "roteiros", label: "Roteiros", grupo: "lugares" },
  { valor: "gastronomia", label: "Gastronomia", grupo: "estabelecimentos" },
  { valor: "hospedagens", label: "Hospedagem", grupo: "estabelecimentos" },
  {
    valor: "agencias",
    label: "Agências de Turismo",
    grupo: "estabelecimentos",
  },
  { valor: "esportes", label: "Esportes & Lazer", grupo: "estabelecimentos" },
  { valor: "guias", label: "Guias de Turismo", grupo: "estabelecimentos" },
  {
    valor: "locadoras",
    label: "Locadoras de Veículos",
    grupo: "estabelecimentos",
  },
  {
    valor: "casa-de-cambio",
    label: "Casa de Câmbio",
    grupo: "estabelecimentos",
  },
  { valor: "eventos", label: "Eventos", grupo: "eventos" },
  { valor: "cat", label: "CAT", grupo: "institucional" },
  {
    valor: "secretaria-de-turismo",
    label: "Secretaria de Turismo",
    grupo: "institucional",
  },
  {
    valor: "taxa-de-turismo",
    label: "Taxa de Turismo",
    grupo: "institucional",
  },
  { valor: "institucional", label: "Institucional", grupo: "institucional" },
];

const CATEGORIA_INFO = new Map(CATEGORIAS.map((c) => [c.valor, c]));

function categoriaInfo(categoria: string) {
  return (
    CATEGORIA_INFO.get(categoria) ?? {
      valor: categoria,
      label: categoria,
      grupo: "institucional" as Grupo,
    }
  );
}

function CategoriaBadge({ categoria }: { categoria: string }) {
  const info = categoriaInfo(categoria);
  const grupo = GRUPOS[info.grupo];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full ${grupo.bg} px-2.5 py-1 text-xs font-semibold ${grupo.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${grupo.dot}`} />
      {info.label}
    </span>
  );
}

function StatTile({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  accent: string;
}) {
  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10 transition-opacity group-hover:opacity-20"
        style={{ background: accent }}
      />
      <div
        className="flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-sm"
        style={{ background: accent, boxShadow: `0 2px 8px ${accent}33` }}
      >
        {icon}
      </div>
      <div className="mt-3 min-w-0">{value}</div>
      <p className="mt-1 text-sm font-medium text-muted-foreground">
        {label}
      </p>
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-0.5 w-full opacity-60"
        style={{
          background: `linear-gradient(90deg, ${accent} 0%, transparent 100%)`,
        }}
      />
    </div>
  );
}

/** Barra de magnitude — uma única cor sequencial, largura relativa ao maior total da página atual. */
function MagnitudeBar({ total, max }: { total: number; max: number }) {
  const pct = max > 0 ? Math.max(4, Math.round((total / max) * 100)) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="w-10 shrink-0 text-right text-sm font-bold tabular-nums text-foreground">
        {total}
      </span>
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function ItemLabel({ item }: { item: ClickStat }) {
  if (item.paginaLabel === "Item removido") {
    return (
      <span className="italic text-muted-foreground">{item.paginaLabel}</span>
    );
  }
  return <span className="font-medium text-foreground">{item.paginaLabel}</span>;
}

export default function AdminClicksPage() {
  const [items, setItems] = useState<ClickStat[]>([]);
  const [resumo, setResumo] = useState<ClickStatsResumo | null>(null);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);

  const [categoria, setCategoria] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [page, setPage] = useState(1);

  const carregar = (filtro: {
    categoria?: string;
    dataInicio?: string;
    dataFim?: string;
    page: number;
  }) => {
    setLoading(true);
    setErro(false);
    clicksApi
      .getStats({ ...filtro, limit: PAGE_SIZE })
      .then((data) => {
        setItems(data.items);
        setResumo(data.resumo);
        setTotalPaginas(data.totalPaginas);
      })
      .catch(() => setErro(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    carregar({ page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const aplicarFiltros = () => {
    setPage(1);
    carregar({
      categoria: categoria || undefined,
      dataInicio: dataInicio || undefined,
      dataFim: dataFim || undefined,
      page: 1,
    });
  };

  const limparFiltros = () => {
    setCategoria("");
    setDataInicio("");
    setDataFim("");
    setPage(1);
    carregar({ page: 1 });
  };

  const mudarPagina = (novaPagina: number) => {
    setPage(novaPagina);
    carregar({
      categoria: categoria || undefined,
      dataInicio: dataInicio || undefined,
      dataFim: dataFim || undefined,
      page: novaPagina,
    });
  };

  // Escala pelo maior total do RESULTADO FILTRADO INTEIRO (resumo.topItem),
  // não só da página atual - senão toda página além da 1ª parece "cheia".
  const maxTotal = Math.max(1, resumo?.topItem?.total ?? 0);

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-widest">
            Cliques
          </h1>
          <p className="text-sm text-muted-foreground">
            Engajamento por categoria e página, agregado por dia
          </p>
        </div>
      </div>

      {/* Stat tiles */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile
          icon={<MousePointerClick className="h-5 w-5" />}
          label="Total de cliques"
          value={
            <p className="text-2xl font-bold tabular-nums text-foreground">
              {resumo ? resumo.totalCliques : "—"}
            </p>
          }
          accent="hsl(var(--primary))"
        />
        <StatTile
          icon={<Layers className="h-5 w-5" />}
          label="Combinações ativas"
          value={
            <p className="text-2xl font-bold tabular-nums text-foreground">
              {resumo ? resumo.totalCombinacoes : "—"}
            </p>
          }
          accent="hsl(var(--secondary))"
        />
        <StatTile
          icon={<Trophy className="h-5 w-5" />}
          label="Item mais clicado"
          value={
            resumo?.topItem ? (
              <div className="min-w-0">
                <p className="truncate text-base font-bold text-foreground">
                  {resumo.topItem.paginaLabel}
                </p>
                <p className="text-xs text-muted-foreground">
                  {resumo.topItem.total} cliques
                </p>
              </div>
            ) : (
              <p className="text-base font-bold text-muted-foreground">—</p>
            )
          }
          accent="hsl(var(--accent))"
        />
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            Categoria
          </label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Todas</option>
            {(Object.keys(GRUPOS) as Grupo[]).map((g) => (
              <optgroup key={g} label={GRUPOS[g].label}>
                {CATEGORIAS.filter((c) => c.grupo === g).map((c) => (
                  <option key={c.valor} value={c.valor}>
                    {c.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <CalendarRange className="h-3 w-3" /> Data início
          </label>
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <CalendarRange className="h-3 w-3" /> Data fim
          </label>
          <input
            type="date"
            value={dataFim}
            onChange={(e) => setDataFim(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <button
          onClick={aplicarFiltros}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          <Filter className="h-4 w-4" /> Filtrar
        </button>

        <button
          onClick={limparFiltros}
          className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground transition hover:bg-muted"
        >
          <RotateCcw className="h-4 w-4" /> Limpar
        </button>
      </div>

      {loading ? (
        <LoadingGrid count={3} />
      ) : erro ? (
        <div className="rounded-xl border border-border bg-card py-16 text-center text-muted-foreground">
          Não foi possível carregar os cliques. Tente novamente mais tarde.
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 py-16 text-center text-muted-foreground">
          Nenhum clique registrado ainda para esse filtro.
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr
                  className="border-b border-border"
                  style={{
                    background:
                      "linear-gradient(90deg, hsl(var(--primary) / 0.06) 0%, hsl(var(--card)) 100%)",
                  }}
                >
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Categoria
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Item
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Cliques
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr
                    key={`${item.categoria}::${item.pagina}`}
                    className="border-b border-border last:border-0 transition-colors hover:bg-primary/[0.03]"
                    style={i % 2 === 1 ? { backgroundColor: "hsl(var(--muted) / 0.3)" } : {}}
                  >
                    <td className="px-4 py-3">
                      <CategoriaBadge categoria={item.categoria} />
                    </td>
                    <td className="px-4 py-3">
                      <ItemLabel item={item} />
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end">
                        <MagnitudeBar total={item.total} max={maxTotal} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <AdminPagination
            page={page}
            totalPages={totalPaginas}
            onPageChange={mudarPagina}
          />
        </>
      )}
    </div>
  );
}
