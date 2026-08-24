"use client";

import { useEffect, useState } from "react";
import { BarChart3, Filter, RotateCcw } from "lucide-react";
import { clicksApi } from "@/lib/api";
import type { ClickStat } from "@/lib/api";
import { AdminTable } from "@/components/admin/AdminTable";
import { LoadingGrid } from "@/components/ui/LoadingGrid";

// Mesma whitelist do backend (src/presentation/dto/constants/categoriasClicks.constant.ts)
const CATEGORIAS = [
  "gastronomia",
  "hospedagens",
  "praias",
  "lagoas",
  "roteiros",
  "eventos",
  "agencias",
  "casa-de-cambio",
  "cat",
  "esportes",
  "guias",
  "locadoras",
  "secretaria-de-turismo",
  "taxa-de-turismo",
  "institucional",
];

type ClickStatRow = ClickStat & { id: string };

export default function AdminClicksPage() {
  const [stats, setStats] = useState<ClickStatRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);

  const [categoria, setCategoria] = useState("");
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");

  const carregar = (filtro: {
    categoria?: string;
    dataInicio?: string;
    dataFim?: string;
  }) => {
    setLoading(true);
    setErro(false);
    clicksApi
      .getStats(filtro)
      .then((data) =>
        setStats(
          data.map((s) => ({ ...s, id: `${s.categoria}::${s.pagina}` })),
        ),
      )
      .catch(() => setErro(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    carregar({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const aplicarFiltros = () => {
    carregar({
      categoria: categoria || undefined,
      dataInicio: dataInicio || undefined,
      dataFim: dataFim || undefined,
    });
  };

  const limparFiltros = () => {
    setCategoria("");
    setDataInicio("");
    setDataFim("");
    carregar({});
  };

  const totalGeral = stats.reduce((acc, s) => acc + s.total, 0);

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
            {loading
              ? "Carregando…"
              : `${stats.length} combinações de categoria/página — ${totalGeral} cliques no total`}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap items-end gap-3 rounded-xl border border-border bg-card p-4">
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
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            Data início
          </label>
          <input
            type="date"
            value={dataInicio}
            onChange={(e) => setDataInicio(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">
            Data fim
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
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Filter className="h-4 w-4" /> Filtrar
        </button>

        <button
          onClick={limparFiltros}
          className="flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted"
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
      ) : (
        <AdminTable
          data={stats}
          columns={[
            { key: "categoria", label: "Categoria" },
            { key: "pagina", label: "Página" },
            { key: "total", label: "Total de cliques" },
          ]}
        />
      )}
    </div>
  );
}
