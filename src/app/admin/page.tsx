"use client";

import { useEffect, useState, useCallback } from "react";
import {
  usersApi,
  atividadesApi,
  eventosApi,
  gastronomiaApi,
  hospedagemApi,
  servicoTuristaApi,
  planoViagemApi,
  catApi,
} from "@/lib/api";
import type { Gastronomia, Hospedagem, ServicoTurista } from "@/lib/api";
import {
  Users, Calendar, Utensils, BedDouble,
  Wrench, MapPin, BookOpen, Tag, Clock,
  CheckCircle2, XCircle, Building2, ConciergeBell,
} from "lucide-react";

// ────────────────────────────────────────────────────────────────
// StatCard
// ────────────────────────────────────────────────────────────────
function StatCard({
  label, count, icon, color,
}: {
  label: string;
  count: number | string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">{count}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// PendingCard — card de um item pendente com botões aprovar/recusar
// ────────────────────────────────────────────────────────────────
function PendingCard({
  logo, nome, sub, extra, loading,
  onApprove, onReject,
}: {
  logo?: string;
  nome: string;
  sub: string;
  extra?: string;
  loading?: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-lg p-3 transition-opacity"
      style={{
        backgroundColor: "hsl(var(--card))",
        border: "1px solid hsl(var(--border))",
        opacity: loading ? 0.5 : 1,
        pointerEvents: loading ? "none" : "auto",
      }}
    >
      {/* logo / avatar */}
      <div className="relative h-10 w-10 flex-shrink-0">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo}
            alt={nome}
            width={40}
            height={40}
            className="h-10 w-10 rounded-lg object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const fb = e.currentTarget.nextElementSibling as HTMLElement | null;
              if (fb) fb.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted font-bold text-muted-foreground"
          style={logo ? { display: "none" } : {}}
        >
          {nome.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{nome}</p>
        <p className="truncate text-xs text-muted-foreground">{sub}</p>
        {extra && (
          <p className="truncate text-xs text-muted-foreground">{extra}</p>
        )}
      </div>

      {/* ações */}
      <div className="flex items-center gap-1">
        <button
          onClick={onApprove}
          title="Aprovar"
          className="flex items-center gap-1 rounded-md bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-800 transition hover:bg-green-200"
        >
          <CheckCircle2 size={14} />
          <span className="hidden sm:inline">Aprovar</span>
        </button>
        <button
          onClick={onReject}
          title="Recusar"
          className="flex items-center gap-1 rounded-md bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-800 transition hover:bg-red-200"
        >
          <XCircle size={14} />
          <span className="hidden sm:inline">Recusar</span>
        </button>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// PendingSection — container com header e lista
// ────────────────────────────────────────────────────────────────
function PendingSection({
  icon, title, count, children,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        backgroundColor: "hsl(var(--card))",
        border: "1px solid hsl(var(--border))",
      }}
    >
      {/* header */}
      <div className="mb-3 flex items-center gap-2">
        <span className="text-primary">{icon}</span>
        <h3 className="font-display text-sm font-bold uppercase tracking-widest text-foreground">
          {title}
        </h3>
        <span
          className="ml-auto rounded-full px-2 py-0.5 text-xs font-semibold text-amber-800"
          style={{ backgroundColor: "#fef3c7" }}
        >
          {count} pendente{count !== 1 ? "s" : ""}
        </span>
      </div>

      {/* lista */}
      {count === 0 ? (
        <p className="text-sm italic text-muted-foreground">
          Nenhuma solicitação pendente.
        </p>
      ) : (
        <div className="space-y-2">{children}</div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Dashboard
// ────────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  // contadores
  const [stats, setStats] = useState<Record<string, number | string>>({
    users: "...", atividades: "...", eventos: "...", gastronomia: "...",
    hospedagem: "...", servicos: "...", planos: "...", cats: "...",
  });

  // pendentes
  const [pendGast, setPendGast] = useState<Gastronomia[]>([]);
  const [pendHosp, setPendHosp] = useState<Hospedagem[]>([]);
  const [pendServ, setPendServ] = useState<ServicoTurista[]>([]);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [pendLoading, setPendLoading] = useState(true);

  const totalPending = pendGast.length + pendHosp.length + pendServ.length;

  // ── carrega tudo ──
  const loadAll = useCallback(() => {
    // stats
    Promise.allSettled([
      usersApi.getAll(),
      atividadesApi.getAll(),
      eventosApi.getAll(),
      gastronomiaApi.getAll(),
      hospedagemApi.getAll(),
      servicoTuristaApi.getAll(),
      planoViagemApi.getAll(),
      catApi.getAll(),
    ]).then(([u, a, e, g, h, s, p, c]) => {
      setStats({
        users: u.status === "fulfilled" ? u.value.length : "—",
        atividades: a.status === "fulfilled" ? a.value.length : "—",
        eventos: e.status === "fulfilled" ? e.value.length : "—",
        gastronomia: g.status === "fulfilled" ? g.value.length : "—",
        hospedagem: h.status === "fulfilled" ? h.value.length : "—",
        servicos: s.status === "fulfilled" ? s.value.length : "—",
        planos: p.status === "fulfilled" ? p.value.length : "—",
        cats: c.status === "fulfilled" ? c.value.length : "—",
      });
    });

    // pendentes
    setPendLoading(true);
    Promise.allSettled([
      gastronomiaApi.getAll(),
      hospedagemApi.getAll(),
      servicoTuristaApi.getAll(),
    ]).then(([g, h, s]) => {
      setPendGast(g.status === "fulfilled" ? g.value.filter((x) => x.status === "PENDENTE") : []);
      setPendHosp(h.status === "fulfilled" ? h.value.filter((x) => x.status === "PENDENTE") : []);
      setPendServ(s.status === "fulfilled" ? s.value.filter((x) => x.status === "PENDENTE") : []);
    }).finally(() => setPendLoading(false));
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── aprovar / recusar ──
  const reviewGast = async (id: string, status: "APROVADO" | "REJEITADO") => {
    setLoadingId(id);
    try {
      await gastronomiaApi.update(id, { status });
      setPendGast((prev) => prev.filter((x) => x.id !== id));
    } finally { setLoadingId(null); }
  };

  const reviewHosp = async (id: string, status: "APROVADO" | "REJEITADO") => {
    setLoadingId(id);
    try {
      await hospedagemApi.update(id, { status });
      setPendHosp((prev) => prev.filter((x) => x.id !== id));
    } finally { setLoadingId(null); }
  };

  const reviewServ = async (id: string, status: "APROVADO" | "REJEITADO") => {
    setLoadingId(id);
    try {
      await servicoTuristaApi.update(id, { status });
      setPendServ((prev) => prev.filter((x) => x.id !== id));
    } finally { setLoadingId(null); }
  };

  // ── render ──
  return (
    <div className="space-y-10">
      {/* título */}
      <div>
        <h1 className="font-display mb-2 text-3xl font-bold uppercase tracking-widest text-foreground">
          Painel Admin
        </h1>
        <p className="text-muted-foreground">Visão geral dos dados cadastrados no sistema.</p>
      </div>

      {/* stats grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Usuários" count={stats.users} icon={<Users className="h-5 w-5 text-white" />} color="bg-primary" />
        <StatCard label="Atividades" count={stats.atividades} icon={<MapPin className="h-5 w-5 text-white" />} color="bg-restinga" />
        <StatCard label="Eventos" count={stats.eventos} icon={<Calendar className="h-5 w-5 text-white" />} color="bg-accent" />
        <StatCard label="Gastronomia" count={stats.gastronomia} icon={<Utensils className="h-5 w-5 text-white" />} color="bg-secondary" />
        <StatCard label="Hospedagem" count={stats.hospedagem} icon={<BedDouble className="h-5 w-5 text-white" />} color="bg-primary" />
        <StatCard label="Serviços" count={stats.servicos} icon={<Wrench className="h-5 w-5 text-white" />} color="bg-restinga" />
        <StatCard label="Planos de Viagem" count={stats.planos} icon={<BookOpen className="h-5 w-5 text-white" />} color="bg-secondary" />
        <StatCard label="Categorias" count={stats.cats} icon={<Tag className="h-5 w-5 text-white" />} color="bg-accent" />
      </div>

      {/* ─── Seção de Pendentes ─── */}
      <div>
        <div className="mb-4 flex items-center gap-3">
          <Clock size={20} className="text-amber-500" />
          <h2 className="font-display text-xl font-bold uppercase tracking-widest text-foreground">
            Solicitações Pendentes
          </h2>
          {!pendLoading && (
            <span
              className="ml-1 rounded-full px-2.5 py-0.5 text-sm font-bold text-amber-800"
              style={{ backgroundColor: "#fef3c7" }}
            >
              {totalPending}
            </span>
          )}
        </div>

        {pendLoading ? (
          <div
            className="rounded-xl p-8 text-center text-sm text-muted-foreground"
            style={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
          >
            Carregando solicitações…
          </div>
        ) : totalPending === 0 ? (
          <div
            className="rounded-xl p-8 text-center"
            style={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
          >
            <CheckCircle2 size={32} className="mx-auto mb-2 text-green-500" />
            <p className="font-semibold text-foreground">Tudo em dia!</p>
            <p className="text-sm text-muted-foreground">Não há solicitações pendentes no momento.</p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Gastronomia */}
            <PendingSection
              icon={<Utensils size={16} />}
              title="Gastronomia"
              count={pendGast.length}
            >
              {pendGast.map((g) => (
                <PendingCard
                  key={g.id}
                  logo={g.logoUrl}
                  nome={g.nome}
                  sub={g.endereco}
                  extra={g.especialidade ?? undefined}
                  loading={loadingId === g.id}
                  onApprove={() => reviewGast(g.id, "APROVADO")}
                  onReject={() => reviewGast(g.id, "REJEITADO")}
                />
              ))}
            </PendingSection>

            {/* Hospedagem */}
            <PendingSection
              icon={<BedDouble size={16} />}
              title="Hospedagem"
              count={pendHosp.length}
            >
              {pendHosp.map((h) => (
                <PendingCard
                  key={h.id}
                  logo={h.logoUrl}
                  nome={h.nome}
                  sub={h.endereco}
                  extra={h.textoDiferencial}
                  loading={loadingId === h.id}
                  onApprove={() => reviewHosp(h.id, "APROVADO")}
                  onReject={() => reviewHosp(h.id, "REJEITADO")}
                />
              ))}
            </PendingSection>

            {/* Serviços Turísticos */}
            <PendingSection
              icon={<ConciergeBell size={16} />}
              title="Serviços Turísticos"
              count={pendServ.length}
            >
              {pendServ.map((s) => (
                <PendingCard
                  key={s.id}
                  logo={s.logoUrl ?? undefined}
                  nome={s.nome}
                  sub={s.tipo.replace("_", " ")}
                  extra={s.descricao ?? undefined}
                  loading={loadingId === s.id}
                  onApprove={() => reviewServ(s.id, "APROVADO")}
                  onReject={() => reviewServ(s.id, "REJEITADO")}
                />
              ))}
            </PendingSection>
          </div>
        )}
      </div>
    </div>
  );
}
