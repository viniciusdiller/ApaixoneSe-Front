"use client";

import { confirmAction, notify } from "@/lib/feedback";

import { useEffect, useRef, useState, useMemo } from "react";
import { gastronomiaApi, usersApi } from "@/lib/api";
import type { Gastronomia, CreateGastronomiaDto, User } from "@/lib/api";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminFormField } from "@/components/admin/AdminFormField";
import { FileUploadField } from "@/components/admin/FileUploadField";
import { MediaPreview } from "@/components/admin/MediaPreview";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { LoadingGrid } from "@/components/ui/LoadingGrid";
import {
  Plus,
  Eye,
  Pencil,
  ExternalLink,
  FileText,
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock,
  Search,
  X,
} from "lucide-react";
import { safeMediaUrl } from "@/lib/safeMediaUrl";
import {
  maskCnpj,
  maskCpf,
  maskPersonName,
  maskPhone,
  numericInputProps,
} from "@/lib/masks";

const PAGE_SIZE = 10;

// ─── helpers de validade ───────────────────────────────────────────────────
type ValidadeStatus = "ok" | "alerta" | "vencido" | "sem-data";

function validadeStatus(dateStr?: string | null): ValidadeStatus {
  if (!dateStr) return "sem-data";
  const expiry = new Date(dateStr);
  if (isNaN(expiry.getTime())) return "sem-data";
  const diffDays = (expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  if (diffDays < 0) return "vencido";
  if (diffDays <= 30) return "alerta";
  return "ok";
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? "—" : d.toLocaleDateString("pt-BR");
}

function ValidityBadge({ validade }: { validade?: string | null }) {
  const status = validadeStatus(validade);
  if (status === "sem-data")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
        <Clock size={11} /> Sem validade
      </span>
    );
  if (status === "ok")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950/40 dark:text-green-400">
        <CheckCircle2 size={11} /> Válido até {formatDate(validade)}
      </span>
    );
  if (status === "alerta")
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
        <AlertTriangle size={11} /> Vence em {formatDate(validade)}
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-400">
      <AlertTriangle size={11} /> Vencido em {formatDate(validade)}
    </span>
  );
}

function ComprovanteBotao({ url }: { url?: string | null }) {
  const src = safeMediaUrl(url);
  if (!src) return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <a
      href={src}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-foreground transition hover:bg-muted hover:text-primary"
    >
      <FileText size={12} /> Ver Comprovante{" "}
      <ExternalLink size={11} className="text-muted-foreground" />
    </a>
  );
}

// ─── estado inicial do form ────────────────────────────────────────────────
const empty: CreateGastronomiaDto & { validade?: string } = {
  nome: "",
  telefone: "",
  endereco: "",
  especialidade: "",
  cnpj: "",
  responsavelNome: "",
  responsavelCpf: "",
  documentoPdfUrl: "",
  logoUrl: "",
  usuarioId: "",
  instagram: "",
  validade: "",
};

const statusClass = (s: string) =>
  s === "APROVADO"
    ? "bg-green-100 text-green-700"
    : s === "REJEITADO"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700";

// ─── Página ────────────────────────────────────────────────────────────────
export default function AdminGastronomiaPage() {
  const [items, setItems] = useState<Gastronomia[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<{
    open: boolean;
    editing: Gastronomia | null;
  }>({ open: false, editing: null });
  const [viewing, setViewing] = useState<Gastronomia | null>(null);
  const [form, setForm] = useState<typeof empty>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [files, setFiles] = useState<{ logo?: File; comprovante?: File }>({});

  const comprovanteRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    Promise.all([gastronomiaApi.getAll(), usersApi.getAll()])
      .then(([g, u]) => {
        setItems(g);
        setUsers(u);
      })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  // ── filtro + paginação ──
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.nome.toLowerCase().includes(q) ||
        i.endereco.toLowerCase().includes(q) ||
        (i.especialidade ?? "").toLowerCase().includes(q),
    );
  }, [items, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

  const openCreate = () => {
    setForm(empty);
    setFiles({});
    setError("");
    setModal({ open: true, editing: null });
  };

  const openEdit = (item: Gastronomia) => {
    setForm({
      nome: item.nome,
      telefone: item.telefone,
      endereco: item.endereco,
      especialidade: item.especialidade ?? "",
      cnpj: item.cnpj,
      responsavelNome: item.responsavelNome,
      responsavelCpf: item.responsavelCpf,
      documentoPdfUrl: item.documentoPdfUrl,
      logoUrl: item.logoUrl,
      usuarioId: item.usuarioId,
      instagram: item.instagram ?? "",
      validade: (item as Gastronomia & { validade?: string }).validade
        ? (item as Gastronomia & { validade?: string }).validade!.slice(0, 10)
        : "",
    });
    setFiles({});
    setError("");
    setModal({ open: true, editing: item });
  };

  const closeModal = () => setModal({ open: false, editing: null });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("nome", form.nome);
      fd.append("telefone", form.telefone);
      fd.append("endereco", form.endereco);
      if (form.especialidade) fd.append("especialidade", form.especialidade);
      fd.append("cnpj", form.cnpj);
      fd.append("responsavelNome", form.responsavelNome);
      fd.append("responsavelCpf", form.responsavelCpf);
      if (form.instagram) fd.append("instagram", form.instagram);
      if (files.logo) fd.append("logo", files.logo);
      if (files.comprovante) fd.append("documentoPdf", files.comprovante);

      if (modal.editing) {
        await gastronomiaApi.update(modal.editing.id, fd);
        if (form.validade) {
          await gastronomiaApi.updateStatus(modal.editing.id, {
            validade: form.validade,
          });
        }
      } else {
        await gastronomiaApi.create(fd);
      }
      closeModal();
      load();
    } catch (err: unknown) {
      try {
        const p = JSON.parse((err as Error).message);
        setError(Array.isArray(p.message) ? p.message.join(" ") : p.message);
      } catch {
        setError("Erro ao salvar.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: Gastronomia) => {
    if (!(await confirmAction(`Excluir "${item.nome}"?`))) return;
    await gastronomiaApi.delete(item.id);
    load();
  };

  const set =
    (k: keyof typeof empty) =>
    (
      e:
        | React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
          >
        | string,
    ) => {
      const value = typeof e === "string" ? e : e.target.value;
      setForm((prev) => ({ ...prev, [k]: value }));
    };

  const setField = (k: keyof typeof empty, value: string) =>
    setForm((prev) => ({ ...prev, [k]: value }));

  const ownerName = (id: string) => {
    const u = users.find((u) => u.id === id);
    return u ? `${u.nome} (@${u.usuario})` : id;
  };

  const comprovanteExistente =
    (modal.editing as (Gastronomia & { documentoPdfUrl?: string }) | null)
      ?.documentoPdfUrl ?? null;
  const comprovantePreviewUrl = files.comprovante
    ? URL.createObjectURL(files.comprovante)
    : safeMediaUrl(comprovanteExistente);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-widest">
            Gastronomia
          </h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length === items.length
              ? `${items.length} registros`
              : `${filtered.length} de ${items.length} registros`}
            {totalPages > 1 && ` — página ${page} de ${totalPages}`}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Novo Estabelecimento
        </button>
      </div>

      {/* barra de pesquisa */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        <input
          type="search"
          placeholder="Pesquisar por nome, endereço ou especialidade…"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {search && (
          <button
            type="button"
            onClick={() => handleSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground transition hover:text-foreground"
            aria-label="Limpar pesquisa"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {loading ? (
        <LoadingGrid count={3} />
      ) : (
        <>
          <AdminTable
            data={paged}
            columns={[
              {
                key: "logoUrl",
                label: "Logo",
                render: (_val, row) => (
                  <MediaPreview url={row.logoUrl} label="Logo" />
                ),
              },
              { key: "nome", label: "Nome" },
              { key: "endereco", label: "Endereço" },
              {
                key: "status",
                label: "Status",
                render: (_val, row) => (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusClass(row.status)}`}
                  >
                    {row.status}
                  </span>
                ),
              },
              {
                key: "validade",
                label: "Validade Comprovante Cadastur",
                render: (_val, row) => (
                  <ValidityBadge
                    validade={
                      (row as Gastronomia & { validade?: string }).validade
                    }
                  />
                ),
              },
            ]}
            extraActions={(row) => (
              <>
                <button
                  onClick={() => setViewing(row)}
                  title="Ver detalhes"
                  className="rounded p-1 text-muted-foreground transition hover:bg-surface-offset hover:text-primary"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => openEdit(row)}
                  title="Editar"
                  className="rounded p-1 text-muted-foreground transition hover:bg-surface-offset hover:text-primary"
                >
                  <Pencil size={16} />
                </button>
              </>
            )}
            onDelete={handleDelete}
          />

          <AdminPagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}

      {/* ── Modal Visualização ── */}
      <AdminModal
        title="Detalhes da Gastronomia"
        open={!!viewing}
        onClose={() => setViewing(null)}
      >
        {viewing && (
          <div className="space-y-4">
            {viewing.logoUrl && (
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={safeMediaUrl(viewing.logoUrl)}
                  alt={viewing.nome}
                  className="h-16 w-16 rounded-lg object-cover border border-border"
                />
                <div>
                  <p className="font-display font-bold text-lg uppercase tracking-wide">
                    {viewing.nome}
                  </p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusClass(viewing.status)}`}
                  >
                    {viewing.status}
                  </span>
                </div>
              </div>
            )}
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <ViewRow label="Telefone" value={viewing.telefone} />
              <ViewRow label="CNPJ" value={viewing.cnpj} />
              <ViewRow label="Instagram" value={viewing.instagram} />
              <ViewRow label="Responsável" value={viewing.responsavelNome} />
              <ViewRow label="CPF Responsável" value={viewing.responsavelCpf} />
            </dl>
            <ViewRow label="Endereço" value={viewing.endereco} />
            <ViewRow label="Especialidade" value={viewing.especialidade} />
            <ViewRow
              label="Usuário Dono"
              value={ownerName(viewing.usuarioId)}
            />

            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileText size={13} /> Comprovante Cadastur
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <ComprovanteBotao url={viewing.documentoPdfUrl} />
                <ValidityBadge
                  validade={
                    (viewing as Gastronomia & { validade?: string }).validade
                  }
                />
              </div>
            </div>
          </div>
        )}
      </AdminModal>

      {/* ── Modal Criar/Editar ── */}
      <AdminModal
        title={modal.editing ? "Editar Gastronomia" : "Nova Gastronomia"}
        open={modal.open}
        onClose={closeModal}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <AdminFormField
              label="Nome"
              value={form.nome}
              onChange={set("nome")}
              required
            />
            <AdminFormField
              label="Telefone"
              value={form.telefone}
              onChange={set("telefone")}
              mask={maskPhone}
              maxLength={15}
              {...numericInputProps}
              required
            />
          </div>
          <AdminFormField
            label="Endereço"
            value={form.endereco}
            onChange={set("endereco")}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <AdminFormField
              label="Especialidade"
              value={form.especialidade ?? ""}
              onChange={set("especialidade")}
            />
            <AdminFormField
              label="CNPJ"
              value={form.cnpj}
              onChange={set("cnpj")}
              mask={maskCnpj}
              maxLength={18}
              {...numericInputProps}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <AdminFormField
              label="Responsável (Nome)"
              value={form.responsavelNome}
              onChange={set("responsavelNome")}
              mask={maskPersonName}
              required
            />
            <AdminFormField
              label="Responsável (CPF)"
              value={form.responsavelCpf}
              onChange={set("responsavelCpf")}
              mask={maskCpf}
              maxLength={14}
              {...numericInputProps}
              required
            />
          </div>
          <AdminFormField
            label="Instagram"
            value={form.instagram ?? ""}
            onChange={set("instagram")}
          />

          <FileUploadField
            label="Logo do Estabelecimento"
            accept="image"
            currentUrl={form.logoUrl}
            required={!modal.editing}
            hint="PNG, JPG ou WEBP"
            onFileChange={(url, file) => {
              setField("logoUrl", url);
              setFiles((p) => ({ ...p, logo: file }));
            }}
            onClear={() => {
              setField("logoUrl", "");
              setFiles((p) => ({ ...p, logo: undefined }));
            }}
          />

          <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <FileText size={13} /> Comprovante Cadastur
            </p>

            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Arquivo
                {!modal.editing && <span className="text-red-500"> *</span>} —
                PDF ou imagem
              </label>
              {comprovantePreviewUrl && (
                <div className="flex items-center gap-2">
                  <a
                    href={comprovantePreviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted hover:text-primary"
                  >
                    <FileText size={12} />
                    {files.comprovante
                      ? files.comprovante.name
                      : "Comprovante atual"}
                    <ExternalLink size={11} className="text-muted-foreground" />
                  </a>
                  {comprovanteExistente && !files.comprovante && (
                    <span className="text-xs text-muted-foreground">
                      (existente)
                    </span>
                  )}
                </div>
              )}
              <button
                type="button"
                onClick={() => comprovanteRef.current?.click()}
                className="flex items-center gap-2 rounded-md border border-dashed border-border bg-muted/20 px-3 py-2 text-xs text-muted-foreground transition hover:border-primary hover:text-primary"
              >
                <FileText size={14} />
                {files.comprovante
                  ? "Trocar arquivo"
                  : comprovanteExistente
                    ? "Substituir comprovante"
                    : "Selecionar comprovante (PDF ou imagem)"}
              </button>
              <input
                ref={comprovanteRef}
                type="file"
                accept="application/pdf,image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setFiles((p) => ({ ...p, comprovante: f }));
                }}
              />
            </div>

            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <CalendarClock size={13} /> Data de validade do comprovante cadastur
              </label>
              <input
                type="date"
                value={form.validade ?? ""}
                onChange={set("validade")}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              />
              {form.validade && (
                <div className="pt-1">
                  <ValidityBadge validade={form.validade} />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Usuário Dono *
            </label>
            <select
              value={form.usuarioId}
              onChange={set("usuarioId")}
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Selecione um usuário</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome} (@{u.usuario})
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500 dark:bg-red-950/30">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}

function ViewRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm text-foreground whitespace-pre-wrap">{value}</dd>
    </div>
  );
}
