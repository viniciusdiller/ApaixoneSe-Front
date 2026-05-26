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
  CheckCircle2, XCircle, ConciergeBell, Eye, X,
  Phone, Instagram, MapPinned, FileText, Building,
} from "lucide-react";

// ────────────────────────────────────────────────────────────────
// Tipos
// ────────────────────────────────────────────────────────────────
type PendingItem =
  | { kind: "gastronomia"; data: Gastronomia }
  | { kind: "hospedagem"; data: Hospedagem }
  | { kind: "servico"; data: ServicoTurista };

// ────────────────────────────────────────────────────────────────
// StatCard
// ────────────────────────────────────────────────────────────────
function StatCard({ label, count, icon, color }: {
  label: string; count: number | string;
  icon: React.ReactNode; color: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-5 shadow-sm">
      <div className={`flex h-12 w-12 items-center justify-center rounded-full ${color}`}>{icon}</div>
      <div>
        <p className="text-2xl font-bold text-foreground">{count}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// DetailRow — linha de info no modal
// ────────────────────────────────────────────────────────────────
function DetailRow({ icon, label, value }: {
  icon: React.ReactNode; label: string; value?: string | null;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="mt-0.5 flex-shrink-0 text-primary">{icon}</span>
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}: </span>
        <span className="text-foreground">{value}</span>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// Modal de detalhes do item pendente
// ────────────────────────────────────────────────────────────────
function PendingDetailModal({
  item, actionLoading, onApprove, onReject, onClose,
}: {
  item: PendingItem;
  actionLoading: boolean;
  onApprove: () => void;
  onReject: () => void;
  onClose: () => void;
}) {
  const { data } = item;

  const logo = "logoUrl" in data ? (data.logoUrl ?? undefined) : undefined;
  const nome = data.nome;
  const cnpj = "cnpj" in data ? (data.cnpj ?? undefined) : undefined;
  const telefone = data.telefone;
  const instagram = data.instagram ?? undefined;
  const endereco = "endereco" in data ? (data.endereco ?? undefined) : undefined;
  const respNome = "responsavelNome" in data ? (data.responsavelNome ?? undefined) : undefined;
  const respCpf = "responsavelCpf" in data ? (data.responsavelCpf ?? undefined) : undefined;
  const docUrl = "documentoPdfUrl" in data ? (data.documentoPdfUrl ?? undefined) : undefined;

  // campos específicos por tipo
  const especialidade = item.kind === "gastronomia" ? (item.data.especialidade ?? undefined) : undefined;
  const diferencial = item.kind === "hospedagem" ? item.data.textoDiferencial : undefined;
  const tipo = item.kind === "servico" ? item.data.tipo.replaceAll("_", " ") : undefined;
  const descricao = item.kind === "servico" ? (item.data.descricao ?? undefined) : undefined;
  const idiomas = item.kind === "servico" ? (item.data.idiomas ?? undefined) : undefined;

  const categoryLabel =
    item.kind === "gastronomia" ? "Gastronomia" :
    item.kind === "hospedagem" ? "Hospedagem" : "Serviço Turístico";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div
        className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-xl shadow-2xl"
        style={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
      >
        {/* header */}
        <div className="flex items-center gap-3 px-6 py-4" style={{ borderBottom: "1px solid hsl(var(--border))" }}>
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logo} alt={nome} width={40} height={40}
              className="h-10 w-10 flex-shrink-0 rounded-lg object-cover"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                const fb = e.currentTarget.nextElementSibling as HTMLElement | null;
                if (fb) fb.style.display = "flex";
              }}
            />
          ) : null}
          <div
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-muted font-bold text-muted-foreground"
            style={logo ? { display: "none" } : {}}
          >
            {nome.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-display text-lg font-bold uppercase tracking-widest text-foreground truncate">
              {nome}
            </h2>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
              {categoryLabel} · PENDENTE
            </span>
          </div>
          <button onClick={onClose} className="ml-2 rounded p-1 text-muted-foreground hover:text-foreground">
            <X size={18} />
          </button>
        </div>

        {/* body */}
        <div className="flex-1 space-y-3 overflow-y-auto px-6 py-4">
          <DetailRow icon={<Phone size={14} />} label="Telefone" value={telefone} />
          <DetailRow icon={<Instagram size={14} />} label="Instagram" value={instagram} />
          <DetailRow icon={<MapPinned size={14} />} label="Endereço" value={endereco} />
          <DetailRow icon={<Building size={14} />} label="CNPJ" value={cnpj} />
          <DetailRow icon={<Building size={14} />} label="Responsável" value={respNome} />
          <DetailRow icon={<FileText size={14} />} label="CPF Responsável" value={respCpf} />
          {docUrl && (
            <div className="flex items-center gap-2 text-sm">
              <FileText size={14} className="text-primary flex-shrink-0" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Documento: </span>
              <a
                href={docUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="truncate text-primary underline underline-offset-2 hover:text-primary/80"
              >
                Visualizar PDF
              </a>
            </div>
          )}
          {especialidade && <DetailRow icon={<Utensils size={14} />} label="Especialidade" value={especialidade} />}
          {diferencial && <DetailRow icon={<Building size={14} />} label="Diferencial" value={diferencial} />}
          {tipo && <DetailRow icon={<ConciergeBell size={14} />} label="Tipo de Serviço" value={tipo} />}
          {descricao && <DetailRow icon={<FileText size={14} />} label="Descrição" value={descricao} />}
          {idiomas && <DetailRow icon={<FileText size={14} />} label="Idiomas" value={idiomas} />}
        </div>

        {/* footer com ações */}
        <div
          className="flex items-center justify-end gap-2 px-6 py-4"
          style={{ borderTop: "1px solid hsl(var(--border))" }}
        >
          <button
            onClick={onClose}
            className="rounded-md border border-border px-4 py-2 text-sm transition hover:bg-muted"
          >
            Cancelar
          </button>
          <button
            onClick={onReject}
            disabled={actionLoading}
            className="flex items-center gap-1.5 rounded-md bg-red-100 px-4 py-2 text-sm font-semibold text-red-800 transition hover:bg-red-200 disabled:opacity-50"
          >
            <XCircle size={15} />
            Recusar
          </button>
          <button
            onClick={onApprove}
            disabled={actionLoading}
            className="flex items-center gap-1.5 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
          >
            <CheckCircle2 size={15} />
            Aprovar
          </button>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// PendingCard — linha do card com botão "Ver mais"
// ────────────────────────────────────────────────────────────────
function PendingCard({ logo, nome, sub, onView }: {
  logo?: string;
  nome: string;
  sub: string;
  onView: () => void;
}) {
  return (
    <div
      className="flex items-center gap-3 rounded-lg p-3"
      style={{ backgroundColor: "hsl(var(--background))", border: "1px solid hsl(var(--border))" }}
    >
      {/* logo / avatar */}
      <div className="relative h-9 w-9 flex-shrink-0">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo} alt={nome} width={36} height={36}
            className="h-9 w-9 rounded-lg object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const fb = e.currentTarget.nextElementSibling as HTMLElement | null;
              if (fb) fb.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-xs font-bold text-muted-foreground"
          style={logo ? { display: "none" } : {}}
        >
          {nome.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* info */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{nome}</p>
        <p className="truncate text-xs text-muted-foreground">{sub}</p>
      </div>

      {/* botão ver mais */}
      <button
        onClick={onView}
        className="flex flex-shrink-0 items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted"
      >
        <Eye size={13} />
        Ver mais
      </button>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────
// PendingSection
// ────────────────────────────────────────────────────────────────
function PendingSection({ icon, title, count, children }: {
  icon: React.ReactNode; title: string; count: number; children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl p-4"
      style={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="text-primary">{icon}</span>
        <h3 className="font-display text-sm font-bold uppercase tracking-widest text-foreground">{title}</h3>
        <span className="ml-auto rounded-full px-2 py-0.5 text-xs font-semibold text-amber-800" style={{ backgroundColor: "#fef3c7" }}>
          {count} pendente{count !== 1 ? "s" : ""}
        </span>
      </div>
      {count === 0 ? (
        <p className="text-sm italic text-muted-foreground">Nenhuma solicitação pendente.</p>
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
  const [stats, setStats] = useState<Record<string, number | string>>({
    users: "...", atividades: "...", eventos: "...", gastronomia: "...",
    hospedagem: "...", servicos: "...", planos: "...", cats: "...",
  });

  const [pendGast, setPendGast] = useState<Gastronomia[]>([]);
  const [pendHosp, setPendHosp] = useState<Hospedagem[]>([]);
  const [pendServ, setPendServ] = useState<ServicoTurista[]>([]);
  const [pendLoading, setPendLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeItem, setActiveItem] = useState<PendingItem | null>(null);

  const totalPending = pendGast.length + pendHosp.length + pendServ.length;

  const loadAll = useCallback(() => {
    Promise.allSettled([
      usersApi.getAll(), atividadesApi.getAll(), eventosApi.getAll(),
      gastronomiaApi.getAll(), hospedagemApi.getAll(), servicoTuristaApi.getAll(),
      planoViagemApi.getAll(), catApi.getAll(),
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

  // ── review ──
  const handleReview = async (status: "APROVADO" | "REJEITADO") => {
    if (!activeItem) return;
    setActionLoading(true);
    try {
      if (activeItem.kind === "gastronomia") {
        await gastronomiaApi.update(activeItem.data.id, { status });
        setPendGast((p) => p.filter((x) => x.id !== activeItem.data.id));
      } else if (activeItem.kind === "hospedagem") {
        await hospedagemApi.update(activeItem.data.id, { status });
        setPendHosp((p) => p.filter((x) => x.id !== activeItem.data.id));
      } else {
        await servicoTuristaApi.update(activeItem.data.id, { status });
        setPendServ((p) => p.filter((x) => x.id !== activeItem.data.id));
      }
      setActiveItem(null);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-display mb-2 text-3xl font-bold uppercase tracking-widest text-foreground">Painel Admin</h1>
        <p className="text-muted-foreground">Visão geral dos dados cadastrados no sistema.</p>
      </div>

      {/* stats */}
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

      {/* pendentes */}
      <div>
        <div className="mb-4 flex items-center gap-3">
          <Clock size={20} className="text-amber-500" />
          <h2 className="font-display text-xl font-bold uppercase tracking-widest text-foreground">Solicitações Pendentes</h2>
          {!pendLoading && (
            <span className="ml-1 rounded-full px-2.5 py-0.5 text-sm font-bold text-amber-800" style={{ backgroundColor: "#fef3c7" }}>
              {totalPending}
            </span>
          )}
        </div>

        {pendLoading ? (
          <div className="rounded-xl p-8 text-center text-sm text-muted-foreground" style={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
            Carregando solicitações…
          </div>
        ) : totalPending === 0 ? (
          <div className="rounded-xl p-8 text-center" style={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
            <CheckCircle2 size={32} className="mx-auto mb-2 text-green-500" />
            <p className="font-semibold text-foreground">Tudo em dia!</p>
            <p className="text-sm text-muted-foreground">Não há solicitações pendentes no momento.</p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            <PendingSection icon={<Utensils size={16} />} title="Gastronomia" count={pendGast.length}>
              {pendGast.map((g) => (
                <PendingCard key={g.id} logo={g.logoUrl} nome={g.nome} sub={g.endereco}
                  onView={() => setActiveItem({ kind: "gastronomia", data: g })} />
              ))}
            </PendingSection>

            <PendingSection icon={<BedDouble size={16} />} title="Hospedagem" count={pendHosp.length}>
              {pendHosp.map((h) => (
                <PendingCard key={h.id} logo={h.logoUrl} nome={h.nome} sub={h.endereco}
                  onView={() => setActiveItem({ kind: "hospedagem", data: h })} />
              ))}
            </PendingSection>

            <PendingSection icon={<ConciergeBell size={16} />} title="Serviços Turísticos" count={pendServ.length}>
              {pendServ.map((s) => (
                <PendingCard key={s.id} logo={s.logoUrl ?? undefined} nome={s.nome} sub={s.tipo.replaceAll("_", " ")}
                  onView={() => setActiveItem({ kind: "servico", data: s })} />
              ))}
            </PendingSection>
          </div>
        )}
      </div>

      {/* modal de detalhes */}
      {activeItem && (
        <PendingDetailModal
          item={activeItem}
          actionLoading={actionLoading}
          onApprove={() => handleReview("APROVADO")}
          onReject={() => handleReview("REJEITADO")}
          onClose={() => setActiveItem(null)}
        />
      )}
    </div>
  );
}
