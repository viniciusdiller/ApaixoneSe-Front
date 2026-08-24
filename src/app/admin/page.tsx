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
  secretariaTurismoApi,
} from "@/lib/api";
import { API_BASE_URL } from "@/lib/api/config";
import type { Gastronomia, Hospedagem, ServicoTurista } from "@/lib/api";
import { OwnerCard } from "@/components/admin/OwnerCard";
import {
  Users,
  Calendar,
  Utensils,
  BedDouble,
  Wrench,
  MapPin,
  BookOpen,
  Tag,
  Clock,
  CheckCircle2,
  XCircle,
  ConciergeBell,
  Eye,
  X,
  Phone,
  Instagram,
  MapPinned,
  FileText,
  Building,
  ImageOff,
  ExternalLink,
  Building2,
} from "lucide-react";

function resolveUrl(url?: string | null): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE_URL}${url.startsWith("/") ? url : `/${url}`}`;
}

function parseTags(raw: string[] | null | undefined): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as string[];
  try {
    return JSON.parse(raw as unknown as string) as string[];
  } catch {
    return [];
  }
}

const TAG_COLORS = [
  "bg-primary/10 text-primary border-primary/20",
  "bg-blue-100 text-blue-700 border-blue-200",
  "bg-emerald-100 text-emerald-700 border-emerald-200",
  "bg-amber-100 text-amber-700 border-amber-200",
  "bg-rose-100 text-rose-700 border-rose-200",
];

type PendingItem =
  | { kind: "gastronomia"; data: Gastronomia }
  | { kind: "hospedagem"; data: Hospedagem }
  | { kind: "servico"; data: ServicoTurista };

// ── StatCard com ícone + número + label + barra decorativa na base ──────────
function StatCard({
  label,
  count,
  icon,
  color,
  accent,
}: {
  label: string;
  count: number | string;
  icon: React.ReactNode;
  color: string;
  accent?: string;
}) {
  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      {/* brilho de canto superior direito */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-10 transition-opacity group-hover:opacity-20"
        style={{ background: accent ?? "hsl(var(--primary))" }}
      />
      <div className="flex items-start justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${color} shadow-sm`}
          style={{
            boxShadow: `0 2px 8px ${accent ?? "hsl(var(--primary))"}33`,
          }}
        >
          {icon}
        </div>
        <p className="text-2xl font-bold tabular-nums text-foreground">
          {count}
        </p>
      </div>
      <p className="mt-3 text-sm font-medium text-muted-foreground">{label}</p>
      {/* barra decorativa na base */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 left-0 h-0.5 w-full opacity-60"
        style={{
          background: `linear-gradient(90deg, ${accent ?? "hsl(var(--primary))"} 0%, transparent 100%)`,
        }}
      />
    </div>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string | null;
}) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 text-sm">
      <span className="mt-0.5 flex-shrink-0 text-primary">{icon}</span>
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}:{" "}
        </span>
        <span className="text-foreground">{value}</span>
      </div>
    </div>
  );
}

function ImagePreview({ urls, label }: { urls: string[]; label: string }) {
  const resolved = urls.map(resolveUrl).filter(Boolean) as string[];
  if (resolved.length === 0) return null;
  return (
    <div>
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {resolved.map((src, i) => (
          <a
            key={i}
            href={src}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative block"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={`${label} ${i + 1}`}
              width={80}
              height={80}
              className="h-20 w-20 rounded-lg object-cover ring-1 ring-border transition group-hover:ring-primary"
            />
            <span className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/0 transition group-hover:bg-black/30">
              <ExternalLink
                size={16}
                className="text-white opacity-0 transition group-hover:opacity-100"
              />
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

function buildImageList(item: PendingItem): string[] {
  const raw: (string | null | undefined)[] = [];
  if (item.kind === "gastronomia") {
    raw.push(item.data.logoUrl);
  } else if (item.kind === "hospedagem") {
    raw.push(item.data.logoUrl);
  } else {
    raw.push(item.data.logoUrl);
    raw.push(item.data.fotoUrl);
  }
  return [...new Set(raw.filter((v): v is string => Boolean(v)))];
}

function PendingDetailModal({
  item,
  actionLoading,
  onApprove,
  onReject,
  onClose,
}: {
  item: PendingItem;
  actionLoading: boolean;
  onApprove: () => void;
  onReject: () => void;
  onClose: () => void;
}) {
  const { data } = item;
  const images = buildImageList(item);
  const logoResolved = resolveUrl(
    "logoUrl" in data
      ? (data as { logoUrl?: string | null }).logoUrl
      : undefined,
  );
  const nome = data.nome;
  const cnpj = "cnpj" in data ? (data.cnpj ?? undefined) : undefined;
  const telefone = data.telefone;
  const instagram = data.instagram ?? undefined;
  const endereco =
    "endereco" in data ? (data.endereco ?? undefined) : undefined;
  const respNome =
    "responsavelNome" in data ? (data.responsavelNome ?? undefined) : undefined;
  const respCpf =
    "responsavelCpf" in data ? (data.responsavelCpf ?? undefined) : undefined;
  const docUrl = resolveUrl(
    "documentoPdfUrl" in data ? (data.documentoPdfUrl ?? undefined) : undefined,
  );
  const especialidade =
    item.kind === "gastronomia"
      ? (item.data.especialidade ?? undefined)
      : undefined;
  const diferencial =
    item.kind === "hospedagem" ? item.data.textoDiferencial : undefined;
  const hospTags = item.kind === "hospedagem" ? parseTags(item.data.tags) : [];
  const tipo =
    item.kind === "servico" ? item.data.tipo.replaceAll("_", " ") : undefined;
  const descricao =
    item.kind === "servico" ? (item.data.descricao ?? undefined) : undefined;
  const idiomas =
    item.kind === "servico" ? (item.data.idiomas ?? undefined) : undefined;
  const categoryLabel =
    item.kind === "gastronomia"
      ? "Gastronomia"
      : item.kind === "hospedagem"
        ? "Hospedagem"
        : "Serviço Turístico";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl shadow-2xl"
        style={{
          backgroundColor: "hsl(var(--card))",
          border: "1px solid hsl(var(--border))",
        }}
      >
        {/* faixa de cor no topo do modal */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-1 rounded-t-2xl"
          style={{
            background:
              "linear-gradient(90deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)",
          }}
        />
        <div
          className="flex items-center gap-3 px-4 pt-5 pb-4 sm:px-6"
          style={{ borderBottom: "1px solid hsl(var(--border))" }}
        >
          <div className="relative h-10 w-10 flex-shrink-0">
            {logoResolved ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoResolved}
                alt={nome}
                width={40}
                height={40}
                className="h-10 w-10 rounded-lg object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  const fb = e.currentTarget
                    .nextElementSibling as HTMLElement | null;
                  if (fb) fb.style.display = "flex";
                }}
              />
            ) : null}
            <div
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-muted font-bold text-muted-foreground"
              style={logoResolved ? { display: "none" } : {}}
            >
              {nome.charAt(0).toUpperCase()}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display truncate text-lg font-bold uppercase tracking-widest text-foreground">
              {nome}
            </h2>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
              {categoryLabel} · PENDENTE
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="ml-2 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4 sm:px-6">
          <OwnerCard usuarioId={data.usuarioId} embedded={data.usuario} />
          <div
            style={{ height: "1px", backgroundColor: "hsl(var(--border))" }}
          />
          {images.length > 0 ? (
            <ImagePreview urls={images} label="Imagens" />
          ) : (
            <div
              className="flex items-center gap-2 rounded-lg p-3 text-sm text-muted-foreground"
              style={{
                backgroundColor: "hsl(var(--muted))",
                border: "1px dashed hsl(var(--border))",
              }}
            >
              <ImageOff size={15} className="flex-shrink-0" /> Nenhuma imagem
              enviada
            </div>
          )}
          <div
            style={{ height: "1px", backgroundColor: "hsl(var(--border))" }}
          />
          <div className="space-y-2">
            <DetailRow
              icon={<Phone size={14} />}
              label="Telefone"
              value={telefone}
            />
            <DetailRow
              icon={<Instagram size={14} />}
              label="Instagram"
              value={instagram}
            />
            <DetailRow
              icon={<MapPinned size={14} />}
              label="Endereço"
              value={endereco}
            />
            <DetailRow
              icon={<Building size={14} />}
              label="CNPJ"
              value={cnpj}
            />
            <DetailRow
              icon={<Building size={14} />}
              label="Responsável"
              value={respNome}
            />
            <DetailRow
              icon={<FileText size={14} />}
              label="CPF Responsável"
              value={respCpf}
            />
            {especialidade && (
              <DetailRow
                icon={<Utensils size={14} />}
                label="Especialidade"
                value={especialidade}
              />
            )}
            {diferencial && (
              <DetailRow
                icon={<Building size={14} />}
                label="Diferencial"
                value={diferencial}
              />
            )}
            {tipo && (
              <DetailRow
                icon={<ConciergeBell size={14} />}
                label="Tipo de Serviço"
                value={tipo}
              />
            )}
            {descricao && (
              <DetailRow
                icon={<FileText size={14} />}
                label="Descrição"
                value={descricao}
              />
            )}
            {idiomas && (
              <DetailRow
                icon={<FileText size={14} />}
                label="Idiomas"
                value={idiomas}
              />
            )}
          </div>
          {hospTags.length > 0 && (
            <div
              className="rounded-lg p-3"
              style={{
                backgroundColor: "hsl(var(--muted))",
                border: "1px solid hsl(var(--border))",
              }}
            >
              <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Tag size={12} /> Comodidades
              </p>
              <div className="flex flex-wrap gap-1.5">
                {hospTags.map((tag, idx) => (
                  <span
                    key={tag}
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${TAG_COLORS[idx % TAG_COLORS.length]}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          {docUrl && (
            <div
              className="rounded-lg p-3"
              style={{
                backgroundColor: "hsl(var(--muted))",
                border: "1px solid hsl(var(--border))",
              }}
            >
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Comprovante / Documento
              </p>
              <a
                href={docUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
              >
                <FileText size={15} /> Visualizar PDF <ExternalLink size={13} />
              </a>
            </div>
          )}
        </div>
        <div
          className="flex flex-wrap items-center justify-end gap-2 px-4 py-4 sm:px-6"
          style={{ borderTop: "1px solid hsl(var(--border))" }}
        >
          <button
            onClick={onClose}
            className="rounded-lg border border-border px-4 py-2 text-sm transition hover:bg-muted"
          >
            Cancelar
          </button>
          <button
            onClick={onReject}
            disabled={actionLoading}
            className="flex items-center gap-1.5 rounded-lg bg-red-100 px-4 py-2 text-sm font-semibold text-red-800 transition hover:bg-red-200 disabled:opacity-50"
          >
            <XCircle size={15} /> Recusar
          </button>
          <button
            onClick={onApprove}
            disabled={actionLoading}
            className="flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
          >
            <CheckCircle2 size={15} /> Aprovar
          </button>
        </div>
      </div>
    </div>
  );
}

function PendingCard({
  logoRaw,
  nome,
  sub,
  onView,
}: {
  logoRaw?: string | null;
  nome: string;
  sub: string;
  onView: () => void;
}) {
  const logo = resolveUrl(logoRaw);
  return (
    <div
      className="group flex items-center gap-3 rounded-xl p-3 transition-colors"
      style={{
        backgroundColor: "hsl(var(--background))",
        border: "1px solid hsl(var(--border))",
      }}
    >
      <div className="relative h-9 w-9 flex-shrink-0">
        {logo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo}
            alt={nome}
            width={36}
            height={36}
            className="h-9 w-9 rounded-lg object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const fb = e.currentTarget
                .nextElementSibling as HTMLElement | null;
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
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{nome}</p>
        <p className="truncate text-xs text-muted-foreground">{sub}</p>
      </div>
      <button
        onClick={onView}
        className="flex flex-shrink-0 items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground transition hover:bg-muted hover:border-primary/30"
      >
        <Eye size={13} /> Ver mais
      </button>
    </div>
  );
}

function PendingSection({
  icon,
  title,
  count,
  children,
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
      {/* cabeçalho da seção com linha decorativa */}
      <div className="mb-3 flex items-center gap-2">
        <span
          className="flex h-7 w-7 items-center justify-center rounded-lg"
          style={{
            background: "hsl(var(--primary) / 0.1)",
            color: "hsl(var(--primary))",
          }}
        >
          {icon}
        </span>
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
      {/* separador decorativo */}
      <div
        aria-hidden="true"
        className="mb-3 h-px w-full"
        style={{
          background:
            "linear-gradient(90deg, hsl(var(--primary) / 0.3) 0%, transparent 100%)",
        }}
      />
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

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Record<string, number | string>>({
    users: "...",
    atividades: "...",
    eventos: "...",
    gastronomia: "...",
    hospedagem: "...",
    servicos: "...",
    planos: "...",
    cats: "...",
    secretaria: "...",
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
      usersApi.getAll(),
      atividadesApi.getAll(),
      eventosApi.getAll(),
      gastronomiaApi.getAll(),
      hospedagemApi.getAll(),
      servicoTuristaApi.getAll(),
      planoViagemApi.getAll(),
      catApi.getAll(),
      secretariaTurismoApi.getAll(),
    ]).then(([u, a, e, g, h, s, p, c, sec]) => {
      setStats({
        users: u.status === "fulfilled" ? u.value.length : "—",
        atividades: a.status === "fulfilled" ? a.value.length : "—",
        eventos: e.status === "fulfilled" ? e.value.length : "—",
        gastronomia: g.status === "fulfilled" ? g.value.length : "—",
        hospedagem: h.status === "fulfilled" ? h.value.length : "—",
        servicos: s.status === "fulfilled" ? s.value.length : "—",
        planos: p.status === "fulfilled" ? p.value.length : "—",
        cats: c.status === "fulfilled" ? c.value.length : "—",
        secretaria: sec.status === "fulfilled" ? sec.value.length : "—",
      });
    });
    setPendLoading(true);
    Promise.allSettled([
      gastronomiaApi.getAll(),
      hospedagemApi.getAll(),
      servicoTuristaApi.getAll(),
    ])
      .then(([g, h, s]) => {
        setPendGast(
          g.status === "fulfilled"
            ? g.value.filter((x) => x.status === "PENDENTE")
            : [],
        );
        setPendHosp(
          h.status === "fulfilled"
            ? h.value.filter((x) => x.status === "PENDENTE")
            : [],
        );
        setPendServ(
          s.status === "fulfilled"
            ? s.value.filter((x) => x.status === "PENDENTE")
            : [],
        );
      })
      .finally(() => setPendLoading(false));
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleReview = async (status: "APROVADO" | "REJEITADO") => {
    if (!activeItem) return;
    setActionLoading(true);
    try {
      if (activeItem.kind === "gastronomia") {
        await gastronomiaApi.updateStatus(activeItem.data.id, { status });
        setPendGast((p) => p.filter((x) => x.id !== activeItem.data.id));
      } else if (activeItem.kind === "hospedagem") {
        await hospedagemApi.updateStatus(activeItem.data.id, { status });
        setPendHosp((p) => p.filter((x) => x.id !== activeItem.data.id));
      } else {
        await servicoTuristaApi.updateStatus(activeItem.data.id, { status });
        setPendServ((p) => p.filter((x) => x.id !== activeItem.data.id));
      }
      setActiveItem(null);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-10">
      {/* Header com divisor decorativo */}
      <div className="relative pb-6">
        <h1 className="font-display mb-1 text-3xl font-bold uppercase tracking-widest text-foreground">
          Painel Admin
        </h1>
        <p className="text-muted-foreground">
          Visão geral dos dados cadastrados no sistema.
        </p>
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 h-px w-24"
          style={{
            background:
              "linear-gradient(90deg, hsl(var(--primary)) 0%, transparent 100%)",
          }}
        />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Usuários"
          count={stats.users}
          icon={<Users className="h-5 w-5 text-white" />}
          color="bg-primary"
          accent="hsl(var(--primary))"
        />
        <StatCard
          label="Atividades"
          count={stats.atividades}
          icon={<MapPin className="h-5 w-5 text-white" />}
          color="bg-restinga"
          accent="hsl(var(--restinga))"
        />
        <StatCard
          label="Eventos"
          count={stats.eventos}
          icon={<Calendar className="h-5 w-5 text-white" />}
          color="bg-accent"
          accent="hsl(var(--accent))"
        />
        <StatCard
          label="Gastronomia"
          count={stats.gastronomia}
          icon={<Utensils className="h-5 w-5 text-white" />}
          color="bg-secondary"
          accent="hsl(var(--secondary))"
        />
        <StatCard
          label="Hospedagem"
          count={stats.hospedagem}
          icon={<BedDouble className="h-5 w-5 text-white" />}
          color="bg-primary"
          accent="hsl(var(--primary))"
        />
        <StatCard
          label="Serviços"
          count={stats.servicos}
          icon={<Wrench className="h-5 w-5 text-white" />}
          color="bg-restinga"
          accent="hsl(var(--restinga))"
        />

        <StatCard
          label="CAT"
          count={stats.cats}
          icon={<Tag className="h-5 w-5 text-white" />}
          color="bg-accent"
          accent="hsl(var(--accent))"
        />
        <StatCard
          label="Sec. de Turismo"
          count={stats.secretaria}
          icon={<Building2 className="h-5 w-5 text-white" />}
          color="bg-primary"
          accent="hsl(var(--primary))"
        />
      </div>

      {/* Pendentes */}
      <div>
        <div className="mb-4 flex items-center gap-3">
          <span
            className="flex h-8 w-8 items-center justify-center rounded-lg"
            style={{ background: "#fef3c7", color: "#92400e" }}
          >
            <Clock size={18} />
          </span>
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
            style={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
            }}
          >
            Carregando solicitações…
          </div>
        ) : totalPending === 0 ? (
          <div
            className="rounded-xl p-8 text-center"
            style={{
              backgroundColor: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
            }}
          >
            <CheckCircle2 size={32} className="mx-auto mb-2 text-green-500" />
            <p className="font-semibold text-foreground">Tudo em dia!</p>
            <p className="text-sm text-muted-foreground">
              Não há solicitações pendentes no momento.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            <PendingSection
              icon={<Utensils size={14} />}
              title="Gastronomia"
              count={pendGast.length}
            >
              {pendGast.map((g) => (
                <PendingCard
                  key={g.id}
                  logoRaw={g.logoUrl}
                  nome={g.nome}
                  sub={g.endereco}
                  onView={() => setActiveItem({ kind: "gastronomia", data: g })}
                />
              ))}
            </PendingSection>
            <PendingSection
              icon={<BedDouble size={14} />}
              title="Hospedagem"
              count={pendHosp.length}
            >
              {pendHosp.map((h) => (
                <PendingCard
                  key={h.id}
                  logoRaw={h.logoUrl}
                  nome={h.nome}
                  sub={h.endereco}
                  onView={() => setActiveItem({ kind: "hospedagem", data: h })}
                />
              ))}
            </PendingSection>
            <PendingSection
              icon={<ConciergeBell size={14} />}
              title="Serviços Turísticos"
              count={pendServ.length}
            >
              {pendServ.map((s) => (
                <PendingCard
                  key={s.id}
                  logoRaw={s.logoUrl}
                  nome={s.nome}
                  sub={s.tipo.replaceAll("_", " ")}
                  onView={() => setActiveItem({ kind: "servico", data: s })}
                />
              ))}
            </PendingSection>
          </div>
        )}
      </div>

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
