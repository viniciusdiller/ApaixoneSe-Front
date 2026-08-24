"use client";

import { useEffect, useState } from "react";
import {
  BarChart3,
  Filter,
  RotateCcw,
  CalendarRange,
  ChevronDown,
  ChevronUp,
  Search,
  ListFilter,
  X,
} from "lucide-react";
import { clicksApi } from "@/lib/api";
import type { ClickStat } from "@/lib/api";
import { ROTEIROS } from "@/lib/roteiros";
import { LoadingGrid } from "@/components/ui/LoadingGrid";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const ITENS_VISIVEIS_PADRAO = 8;
// Busca tudo de uma vez (sem categoria) e agrupa no client - cardinalidade
// real de um site institucional fica bem abaixo disso.
const LIMITE_BUSCA = 500;

type Grupo = "lugares" | "estabelecimentos" | "eventos" | "institucional";

const GRUPOS: Record<Grupo, { label: string; border: string }> = {
  lugares: { label: "Lugares", border: "border-restinga" },
  estabelecimentos: { label: "Estabelecimentos", border: "border-secondary" },
  eventos: { label: "Eventos", border: "border-accent" },
  institucional: { label: "Institucional", border: "border-primary" },
};

const CATEGORIAS: { valor: string; label: string; grupo: Grupo }[] = [
  { valor: "praias", label: "Praias", grupo: "lugares" },
  { valor: "lagoas", label: "Lagoas", grupo: "lugares" },
  { valor: "roteiros", label: "Roteiros", grupo: "lugares" },
  { valor: "gastronomia", label: "Gastronomia", grupo: "estabelecimentos" },
  { valor: "hospedagens", label: "Hospedagem", grupo: "estabelecimentos" },
  { valor: "agencias", label: "Agências de Turismo", grupo: "estabelecimentos" },
  { valor: "esportes", label: "Esportes & Lazer", grupo: "estabelecimentos" },
  { valor: "guias", label: "Guias de Turismo", grupo: "estabelecimentos" },
  { valor: "locadoras", label: "Locadoras de Veículos", grupo: "estabelecimentos" },
  { valor: "casa-de-cambio", label: "Casa de Câmbio", grupo: "estabelecimentos" },
  { valor: "eventos", label: "Eventos", grupo: "eventos" },
  { valor: "cat", label: "CAT", grupo: "institucional" },
  { valor: "secretaria-de-turismo", label: "Secretaria de Turismo", grupo: "institucional" },
  { valor: "taxa-de-turismo", label: "Taxa de Turismo", grupo: "institucional" },
  { valor: "institucional", label: "Institucional", grupo: "institucional" },
];

const CATEGORIA_INFO = new Map(CATEGORIAS.map((c) => [c.valor, c]));
const ROTEIRO_LABEL_BY_SLUG = new Map(
  ROTEIROS.map((r) => [r.slug, `Roteiro ${r.label}`]),
);

function categoriaInfo(categoria: string) {
  return (
    CATEGORIA_INFO.get(categoria) ?? {
      valor: categoria,
      label: categoria,
      grupo: "institucional" as Grupo,
    }
  );
}

function magnitudePct(total: number, max: number): number {
  return max > 0 ? Math.max(4, Math.round((total / max) * 100)) : 0;
}

interface RoteiroComAtividades {
  slug: string;
  label: string;
  total: number;
  atividades: ClickStat[];
}

/** Agrupa items de categoria=roteiros e categoria=atividades numa estrutura roteiro→filhos */
function montarRoteiros(items: ClickStat[]): {
  roteiros: RoteiroComAtividades[];
  orfas: ClickStat[];
} {
  const porSlug = new Map<string, RoteiroComAtividades>();
  const orfas: ClickStat[] = [];

  for (const item of items) {
    if (item.categoria === "roteiros") {
      const atual = porSlug.get(item.pagina);
      porSlug.set(item.pagina, {
        slug: item.pagina,
        label: item.paginaLabel,
        total: item.total,
        atividades: atual?.atividades ?? [],
      });
    }
  }

  for (const item of items) {
    if (item.categoria !== "atividades") continue;
    const slug = item.paginaPai;
    if (!slug) {
      orfas.push(item);
      continue;
    }
    const atual = porSlug.get(slug);
    if (atual) {
      atual.atividades.push(item);
    } else {
      porSlug.set(slug, {
        slug,
        label: ROTEIRO_LABEL_BY_SLUG.get(slug) ?? slug,
        total: 0,
        atividades: [item],
      });
    }
  }

  const roteiros = Array.from(porSlug.values()).sort((a, b) => {
    const totalA = a.total + a.atividades.reduce((s, x) => s + x.total, 0);
    const totalB = b.total + b.atividades.reduce((s, x) => s + x.total, 0);
    return totalB - totalA;
  });

  return { roteiros, orfas };
}

function ItemRow({
  item,
  max,
  indent = false,
}: {
  item: ClickStat;
  max: number;
  indent?: boolean;
}) {
  const removido = item.paginaLabel === "Item removido";
  return (
    <div className={`flex items-center justify-between gap-4 py-1.5 ${indent ? "pl-5" : ""}`}>
      <span
        className={`truncate text-sm ${
          removido
            ? "italic text-muted-foreground"
            : indent
              ? "text-muted-foreground"
              : "font-medium text-foreground"
        }`}
        title={item.paginaLabel}
      >
        {item.paginaLabel}
      </span>
      <div className="flex shrink-0 items-center gap-2">
        <div className="h-1 w-16 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{ width: `${magnitudePct(item.total, max)}%` }}
          />
        </div>
        <span className="w-7 text-right text-sm font-bold tabular-nums text-foreground">
          {item.total}
        </span>
      </div>
    </div>
  );
}

function VerMaisToggle({
  expandido,
  restantes,
  onClick,
}: {
  expandido: boolean;
  restantes: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="mt-1 flex items-center gap-1 text-xs font-medium text-primary hover:underline"
    >
      {expandido ? (
        <>
          <ChevronUp className="h-3 w-3" /> Ver menos
        </>
      ) : (
        <>
          <ChevronDown className="h-3 w-3" /> Ver mais {restantes}
        </>
      )}
    </button>
  );
}

function SecaoCategoria({
  categoria,
  items,
  expandido,
  onToggle,
}: {
  categoria: string;
  items: ClickStat[];
  expandido: boolean;
  onToggle: () => void;
}) {
  const info = categoriaInfo(categoria);
  const total = items.reduce((s, i) => s + i.total, 0);
  const max = Math.max(1, ...items.map((i) => i.total));
  const temMais = items.length > ITENS_VISIVEIS_PADRAO;
  const visiveis = expandido ? items : items.slice(0, ITENS_VISIVEIS_PADRAO);

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h3 className="text-base font-bold text-foreground">{info.label}</h3>
        <span className="text-xs font-medium text-muted-foreground">
          {total} {total === 1 ? "clique" : "cliques"}
        </span>
      </div>
      <div className="mt-1 divide-y divide-border/60">
        {visiveis.map((item) => (
          <ItemRow key={item.pagina} item={item} max={max} />
        ))}
      </div>
      {temMais && (
        <VerMaisToggle
          expandido={expandido}
          restantes={items.length - ITENS_VISIVEIS_PADRAO}
          onClick={onToggle}
        />
      )}
    </div>
  );
}

function SecaoRoteiros({ items, busca }: { items: ClickStat[]; busca: string }) {
  const { roteiros: todosRoteiros, orfas: todasOrfas } = montarRoteiros(items);
  const buscaNorm = busca.trim().toLowerCase();

  // Com busca ativa: mantém um roteiro se o nome dele bate OU se alguma
  // atividade dele bate (mostrando só as atividades que batem, a menos que
  // o roteiro em si já tenha batido - aí mostra todas, pra dar contexto).
  const roteiros = !buscaNorm
    ? todosRoteiros
    : todosRoteiros
        .map((r) => {
          const roteiroBate = r.label.toLowerCase().includes(buscaNorm);
          const atividades = roteiroBate
            ? r.atividades
            : r.atividades.filter((a) =>
                a.paginaLabel.toLowerCase().includes(buscaNorm),
              );
          return { ...r, atividades, roteiroBate };
        })
        .filter((r) => r.roteiroBate || r.atividades.length > 0);

  const orfas = !buscaNorm
    ? todasOrfas
    : todasOrfas.filter((a) => a.paginaLabel.toLowerCase().includes(buscaNorm));

  if (roteiros.length === 0 && orfas.length === 0) return null;

  const maxRoteiros = Math.max(1, ...roteiros.map((r) => r.total));
  const todasAtividades = roteiros.flatMap((r) => r.atividades).concat(orfas);
  const maxAtividades = Math.max(1, ...todasAtividades.map((a) => a.total));
  const totalGeral =
    roteiros.reduce(
      (s, r) => s + r.total + r.atividades.reduce((s2, a) => s2 + a.total, 0),
      0,
    ) + orfas.reduce((s, a) => s + a.total, 0);

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h3 className="text-base font-bold text-foreground">Roteiros</h3>
        <span className="text-xs font-medium text-muted-foreground">
          {totalGeral} {totalGeral === 1 ? "clique" : "cliques"}
        </span>
      </div>
      <div className="mt-1">
        {roteiros.map((roteiro) => (
          <div key={roteiro.slug} className="border-b border-border/60 py-1 last:border-0">
            <ItemRow
              item={{
                categoria: "roteiros",
                pagina: roteiro.slug,
                paginaLabel: roteiro.label,
                total: roteiro.total,
              }}
              max={maxRoteiros}
            />
            {roteiro.atividades.map((atividade) => (
              <ItemRow
                key={atividade.pagina}
                item={atividade}
                max={maxAtividades}
                indent
              />
            ))}
          </div>
        ))}
        {orfas.length > 0 && (
          <div className="border-b border-border/60 py-1 last:border-0">
            <p className="pl-0 text-sm font-medium text-muted-foreground">
              Outras atividades
            </p>
            {orfas.map((atividade) => (
              <ItemRow
                key={atividade.pagina}
                item={atividade}
                max={maxAtividades}
                indent
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminClicksPage() {
  const [items, setItems] = useState<ClickStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);

  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [expandidas, setExpandidas] = useState<Set<string>>(new Set());
  const [busca, setBusca] = useState("");
  const [categoriasSelecionadas, setCategoriasSelecionadas] = useState<Set<string>>(
    () => new Set(CATEGORIAS.map((c) => c.valor)),
  );

  const carregar = (filtro: { dataInicio?: string; dataFim?: string }) => {
    setLoading(true);
    setErro(false);
    clicksApi
      .getStats({ ...filtro, limit: LIMITE_BUSCA, page: 1 })
      .then((data) => setItems(data.items))
      .catch(() => setErro(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    carregar({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const aplicarFiltroData = () => {
    carregar({
      dataInicio: dataInicio || undefined,
      dataFim: dataFim || undefined,
    });
  };

  const limparFiltros = () => {
    setDataInicio("");
    setDataFim("");
    setBusca("");
    setCategoriasSelecionadas(new Set(CATEGORIAS.map((c) => c.valor)));
    carregar({});
  };

  const toggleExpandida = (categoria: string) => {
    setExpandidas((prev) => {
      const next = new Set(prev);
      if (next.has(categoria)) next.delete(categoria);
      else next.add(categoria);
      return next;
    });
  };

  const toggleCategoriaSelecionada = (valor: string) => {
    setCategoriasSelecionadas((prev) => {
      const next = new Set(prev);
      if (next.has(valor)) next.delete(valor);
      else next.add(valor);
      return next;
    });
  };

  const totalCliques = items.reduce((s, i) => s + i.total, 0);
  const totalItens = items.length;
  const buscaNorm = busca.trim().toLowerCase();
  const correspondeABusca = (label: string) =>
    !buscaNorm || label.toLowerCase().includes(buscaNorm);

  // Só itens de categorias marcadas no filtro (roteiros/atividades seguem
  // juntos, controlados pela seleção de "roteiros")
  const itemsCategoriaFiltrados = items.filter((item) =>
    item.categoria === "atividades"
      ? categoriasSelecionadas.has("roteiros")
      : categoriasSelecionadas.has(item.categoria),
  );

  // Agrupa por categoria (roteiros/atividades tratados à parte, aninhados) -
  // busca já aplicada aqui pras categorias "flat"; Roteiros aplica a busca
  // sozinho (precisa da lógica de pai/filho, ver SecaoRoteiros)
  const porCategoria = new Map<string, ClickStat[]>();
  for (const item of itemsCategoriaFiltrados) {
    if (item.categoria === "atividades" || item.categoria === "roteiros") continue;
    if (!correspondeABusca(item.paginaLabel)) continue;
    const lista = porCategoria.get(item.categoria) ?? [];
    lista.push(item);
    porCategoria.set(item.categoria, lista);
  }

  const temRoteirosOuAtividades =
    categoriasSelecionadas.has("roteiros") &&
    itemsCategoriaFiltrados.some(
      (i) =>
        (i.categoria === "roteiros" || i.categoria === "atividades") &&
        correspondeABusca(i.paginaLabel),
    );

  const grupos = (Object.keys(GRUPOS) as Grupo[])
    .map((g) => {
      const categoriasComDado = CATEGORIAS.filter(
        (c) =>
          c.grupo === g &&
          (c.valor === "roteiros"
            ? temRoteirosOuAtividades
            : porCategoria.has(c.valor)),
      );
      return { grupo: g, categorias: categoriasComDado };
    })
    .filter((g) => g.categorias.length > 0);

  return (
    <div>
      <div className="mb-1 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-widest">
            Cliques
          </h1>
        </div>
      </div>

      <p className="mb-4 pl-[52px] text-sm text-muted-foreground">
        {loading
          ? "Carregando…"
          : `${totalCliques} ${totalCliques === 1 ? "clique" : "cliques"} em ${totalItens} ${totalItens === 1 ? "item diferente" : "itens diferentes"}`}
      </p>

      {/* Filtros — discretos, sem card grande */}
      <div className="mb-8 space-y-3 border-b border-border pb-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome…"
              className="w-56 rounded-lg border border-border bg-background py-1.5 pl-8 pr-7 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            {busca && (
              <button
                onClick={() => setBusca("")}
                aria-label="Limpar busca"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline" size="sm" className="gap-1.5">
                <ListFilter className="h-3.5 w-3.5" />
                {categoriasSelecionadas.size === CATEGORIAS.length
                  ? "Todas as categorias"
                  : categoriasSelecionadas.size === 0
                    ? "Nenhuma categoria"
                    : `${categoriasSelecionadas.size} categorias`}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="max-h-96 w-72 overflow-y-auto">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Categorias
                </p>
                <div className="flex gap-2 text-xs">
                  <button
                    onClick={() =>
                      setCategoriasSelecionadas(new Set(CATEGORIAS.map((c) => c.valor)))
                    }
                    className="text-primary hover:underline"
                  >
                    Todas
                  </button>
                  <button
                    onClick={() => setCategoriasSelecionadas(new Set())}
                    className="text-muted-foreground hover:underline"
                  >
                    Nenhuma
                  </button>
                </div>
              </div>
              {(Object.keys(GRUPOS) as Grupo[]).map((g) => (
                <div key={g} className="mb-3 last:mb-0">
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {GRUPOS[g].label}
                  </p>
                  <div className="space-y-1">
                    {CATEGORIAS.filter((c) => c.grupo === g).map((c) => (
                      <label
                        key={c.valor}
                        className="flex cursor-pointer items-center gap-2 text-sm text-foreground"
                      >
                        <input
                          type="checkbox"
                          checked={categoriasSelecionadas.has(c.valor)}
                          onChange={() => toggleCategoriaSelecionada(c.valor)}
                          className="h-3.5 w-3.5 rounded border-border accent-primary"
                        />
                        {c.label}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <CalendarRange className="h-3 w-3" /> Data início
            </label>
            <input
              type="date"
              value={dataInicio}
              onChange={(e) => setDataInicio(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
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
              className="rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
          <button
            onClick={aplicarFiltroData}
            className="flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            <Filter className="h-3.5 w-3.5" /> Filtrar
          </button>
          <button
            onClick={limparFiltros}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground transition hover:bg-muted"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Limpar filtros
          </button>
        </div>
      </div>

      {loading ? (
        <LoadingGrid count={3} />
      ) : erro ? (
        <div className="rounded-xl border border-border bg-card py-16 text-center text-muted-foreground">
          Não foi possível carregar os cliques. Tente novamente mais tarde.
        </div>
      ) : totalItens === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 py-16 text-center text-muted-foreground">
          Nenhum clique registrado ainda para esse filtro.
        </div>
      ) : grupos.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card/50 py-16 text-center text-muted-foreground">
          Nenhum resultado pra essa busca/categoria selecionada.
        </div>
      ) : (
        <div className="space-y-10">
          {grupos.map(({ grupo, categorias }) => (
            <div key={grupo} className={`border-l-2 pl-5 ${GRUPOS[grupo].border}`}>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                {GRUPOS[grupo].label}
              </p>
              <div className="space-y-6">
                {categorias.map((c) =>
                  c.valor === "roteiros" ? (
                    <SecaoRoteiros
                      key="roteiros"
                      items={itemsCategoriaFiltrados}
                      busca={busca}
                    />
                  ) : (
                    <SecaoCategoria
                      key={c.valor}
                      categoria={c.valor}
                      items={porCategoria.get(c.valor) ?? []}
                      expandido={expandidas.has(c.valor)}
                      onToggle={() => toggleExpandida(c.valor)}
                    />
                  ),
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
