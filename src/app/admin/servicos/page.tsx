"use client";

import { useEffect, useRef, useState } from "react";
import { servicoTuristaApi, usersApi } from "@/lib/api";
import type {
  ServicoTurista,
  CreateServicoTuristaDto,
  TipoServicoTurista,
  TipoRoteiro,
  User,
} from "@/lib/api";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminFormField } from "@/components/admin/AdminFormField";
import { FileUploadField } from "@/components/admin/FileUploadField";
import { MediaPreview } from "@/components/admin/MediaPreview";
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
  Globe,
} from "lucide-react";
import { safeMediaUrl } from "@/lib/safeMediaUrl";

// ─── constantes ───────────────────────────────────────────────────────────────
const TIPOS_SERVICO: { value: TipoServicoTurista; label: string }[] = [
  { value: "GUIA_TURISMO", label: "Guia de Turismo" },
  { value: "AGENCIA_TURISMO", label: "Agência de Turismo" },
  { value: "ESPORTE_LAZER", label: "Esporte e Lazer" },
  { value: "LOCADORA_VEICULOS", label: "Locadora de Veículos" },
];

const ROTEIROS: { value: TipoRoteiro; label: string }[] = [
  { value: "A_PE", label: "A Pé" },
  { value: "ESPORTE_E_AVENTURA", label: "Esporte e Aventura" },
  { value: "DE_PRAIAS", label: "De Praias" },
  { value: "CULTURAL", label: "Cultural" },
  { value: "RELIGIOSO", label: "Religioso" },
  { value: "RURAL", label: "Rural" },
  { value: "ECOLOGICO", label: "Ecológico" },
];

/** Tipos que EXIGEM comprovante Cadastur */
const REQUER_COMPROVANTE: TipoServicoTurista[] = [
  "GUIA_TURISMO",
  "AGENCIA_TURISMO",
  "LOCADORA_VEICULOS",
];

const empty: CreateServicoTuristaDto & { site?: string } = {
  tipo: "GUIA_TURISMO",
  nome: "",
  telefone: "",
  usuarioId: "",
  instagram: "",
  descricao: "",
  endereco: "",
  cnpj: "",
  idiomas: "",
  logoUrl: "",
  fotoUrl: "",
  validade: "",
  site: "",
};

// ─── helpers de validade ───────────────────────────────────────────────────────
type ValidadeStatus = "ok" | "alerta" | "vencido" | "sem-data";

function validadeStatus(dateStr?: string | null): ValidadeStatus {
  if (!dateStr) return "sem-data";
  const expiry = new Date(dateStr);
  if (isNaN(expiry.getTime())) return "sem-data";
  const now = new Date();
  const diffMs = expiry.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  if (diffDays < 0) return "vencido";
  if (diffDays <= 30) return "alerta";
  return "ok";
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("pt-BR");
}

// ─── ValidityBadge ──────────────────────────────────────────────────────────────
function ValidityBadge({ validade }: { validade?: string | null }) {
  const status = validadeStatus(validade);

  if (status === "sem-data") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
        <Clock size={11} /> Sem validade
      </span>
    );
  }

  if (status === "ok") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950/40 dark:text-green-400">
        <CheckCircle2 size={11} /> Válido até {formatDate(validade)}
      </span>
    );
  }

  if (status === "alerta") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
        <AlertTriangle size={11} /> Vence em {formatDate(validade)}
      </span>
    );
  }

  // vencido
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 dark:bg-red-950/40 dark:text-red-400">
      <AlertTriangle size={11} /> Vencido em {formatDate(validade)}
    </span>
  );
}

// ─── ComprovanteBotao ──────────────────────────────────────────────────────────
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
      <FileText size={12} />
      Ver Comprovante
      <ExternalLink size={11} className="text-muted-foreground" />
    </a>
  );
}

// ─── helpers misc ─────────────────────────────────────────────────────────────────
const statusClass = (s: string) =>
  s === "APROVADO"
    ? "bg-green-100 text-green-700"
    : s === "REJEITADO"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700";

// ─── Página principal ─────────────────────────────────────────────────────────
export default function AdminServicosPage() {
  const [items, setItems] = useState<ServicoTurista[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing: ServicoTurista | null }>(
    { open: false, editing: null }
  );
  const [viewing, setViewing] = useState<ServicoTurista | null>(null);
  const [form, setForm] = useState<typeof empty>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [files, setFiles] = useState<{ logo?: File; foto?: File; comprovante?: File }>({});

  const comprovanteInputRef = useRef<HTMLInputElement>(null);

  const load = () => {
    setLoading(true);
    Promise.all([servicoTuristaApi.getAll(), usersApi.getAll()])
      .then(([s, u]) => { setItems(s); setUsers(u); })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => {
    setForm(empty);
    setFiles({});
    setError("");
    setModal({ open: true, editing: null });
  };

  const openEdit = (item: ServicoTurista) => {
    const s = item as ServicoTurista & { site?: string };
    setForm({
      tipo: item.tipo,
      nome: item.nome,
      telefone: item.telefone,
      usuarioId: item.usuarioId,
      instagram: item.instagram ?? "",
      descricao: item.descricao ?? "",
      endereco: item.endereco ?? "",
      cnpj: item.cnpj ?? "",
      roteiro: item.roteiro ?? undefined,
      idiomas: item.idiomas ?? "",
      logoUrl: item.logoUrl ?? "",
      fotoUrl: item.fotoUrl ?? "",
      validade: item.validade ? item.validade.slice(0, 10) : "",
      site: s.site ?? "",
    });
    setFiles({});
    setError("");
    setModal({ open: true, editing: item });
  };

  const closeModal = () => setModal({ open: false, editing: null });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validação: comprovante obrigatório (exceto ESPORTE_LAZER)
    const requerComprovante = REQUER_COMPROVANTE.includes(form.tipo as TipoServicoTurista);
    if (requerComprovante && !modal.editing && !files.comprovante) {
      setError("O comprovante Cadastur é obrigatório para este tipo de serviço.");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("nome", form.nome);
      formData.append("tipo", form.tipo);
      formData.append("telefone", form.telefone);
      formData.append("endereco", form.endereco || "");
      formData.append("cnpj", form.cnpj || "");
      formData.append("descricao", form.descricao || "");
      formData.append("roteiro", form.roteiro || "");
      formData.append("idiomas", form.idiomas || "");
      formData.append("instagram", form.instagram || "");
      if (form.site) formData.append("site", form.site);

      // Validade (só envia se preenchida)
      if (form.validade) formData.append("validade", form.validade);

      if (files.logo) formData.append("logo", files.logo);
      if (files.foto) formData.append("foto", files.foto);
      if (files.comprovante) formData.append("comprovante", files.comprovante);

      modal.editing
        ? await servicoTuristaApi.update(modal.editing.id, formData)
        : await servicoTuristaApi.create(formData);

      closeModal();
      load();
    } catch (err: unknown) {
      let msg = "Erro ao salvar.";
      if (err instanceof Error) {
        try {
          const p = JSON.parse(err.message);
          msg = Array.isArray(p.message) ? p.message.join(", ") : p.message;
        } catch { msg = err.message; }
      }
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: ServicoTurista) => {
    if (!confirm(`Excluir "${item.nome}"?`)) return;
    await servicoTuristaApi.delete(item.id);
    load();
  };

  const set =
    (k: keyof typeof empty) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | string) => {
      const value = typeof e === "string" ? e : e.target.value;
      setForm((prev) => ({ ...prev, [k]: value }));
    };

  const setField = (k: keyof typeof empty, value: string) =>
    setForm((prev) => ({ ...prev, [k]: value }));

  const tipoLabel = (v: TipoServicoTurista) =>
    TIPOS_SERVICO.find((t) => t.value === v)?.label ?? v;
  const roteiroLabel = (v?: TipoRoteiro) =>
    v ? (ROTEIROS.find((r) => r.value === v)?.label ?? v) : "—";
  const ownerName = (id: string) => {
    const u = users.find((u) => u.id === id);
    return u ? `${u.nome} (@${u.usuario})` : id;
  };

  const requerComprovante = REQUER_COMPROVANTE.includes(form.tipo as TipoServicoTurista);
  // URL do comprovante existente (ao editar), para exibir preview
  const comprovanteExistente = modal.editing?.comprovanteUrl ?? null;
  const comprovantePreviewUrl = files.comprovante
    ? URL.createObjectURL(files.comprovante)
    : safeMediaUrl(comprovanteExistente);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-widest">
            Serviços ao Turista
          </h1>
          <p className="text-sm text-muted-foreground">{items.length} registros</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Novo Serviço
        </button>
      </div>

      {loading ? (
        <LoadingGrid count={3} />
      ) : (
        <AdminTable
          data={items}
          columns={[
            {
              key: "logoUrl",
              label: "Logo",
              render: (_val, row) => <MediaPreview url={row.logoUrl ?? ""} label="Logo" />,
            },
            { key: "nome", label: "Nome" },
            {
              key: "tipo",
              label: "Tipo",
              render: (_val, row) => tipoLabel(row.tipo),
            },
            {
              key: "status",
              label: "Status",
              render: (_val, row) => (
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusClass(row.status)}`}>
                  {row.status}
                </span>
              ),
            },
            {
              key: "validade",
              label: "Validade Cadastur",
              render: (_val, row) =>
                REQUER_COMPROVANTE.includes(row.tipo) ? (
                  <ValidityBadge validade={row.validade} />
                ) : (
                  <span className="text-xs text-muted-foreground">N/A</span>
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
      )}

      {/* ── Modal Visualização ── */}
      <AdminModal
        title="Detalhes do Serviço"
        open={!!viewing}
        onClose={() => setViewing(null)}
      >
        {viewing && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {viewing.logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={viewing.logoUrl}
                  alt={viewing.nome}
                  className="h-14 w-14 rounded-lg object-cover border border-border"
                />
              )}
              <div>
                <p className="font-display font-bold text-lg uppercase tracking-wide">{viewing.nome}</p>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusClass(viewing.status)}`}>
                  {viewing.status}
                </span>
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-3 text-sm">
              <ViewRow label="Tipo" value={tipoLabel(viewing.tipo)} />
              <ViewRow label="Telefone" value={viewing.telefone} />
              <ViewRow label="CNPJ" value={viewing.cnpj} />
              <ViewRow label="Idiomas" value={viewing.idiomas} />
              <ViewRow label="Instagram" value={viewing.instagram} />
              <ViewRow label="Roteiro" value={roteiroLabel(viewing.roteiro)} />
              {(viewing as ServicoTurista & { site?: string }).site && (
                <div className="flex flex-col gap-0.5">
                  <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                    <Globe className="h-3.5 w-3.5" /> Site
                  </dt>
                  <dd className="text-sm">
                    <a
                      href={(viewing as ServicoTurista & { site?: string }).site!.startsWith("http") ? (viewing as ServicoTurista & { site?: string }).site! : `https://${(viewing as ServicoTurista & { site?: string }).site}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {(viewing as ServicoTurista & { site?: string }).site}
                    </a>
                  </dd>
                </div>
              )}
            </dl>
            <ViewRow label="Endereço" value={viewing.endereco} />
            <ViewRow label="Descrição" value={viewing.descricao} />
            <ViewRow label="Usuário Prestador" value={ownerName(viewing.usuarioId)} />

            {/* Comprovante + Validade */}
            {REQUER_COMPROVANTE.includes(viewing.tipo) && (
              <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <FileText size={13} /> Comprovante Cadastur
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <ComprovanteBotao url={viewing.comprovanteUrl} />
                  <ValidityBadge validade={viewing.validade} />
                </div>
              </div>
            )}

            {viewing.fotoUrl && (
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Foto do Serviço</dt>
                <MediaPreview url={viewing.fotoUrl} label="Foto" />
              </div>
            )}
          </div>
        )}
      </AdminModal>

      {/* ── Modal Criar/Editar ── */}
      <AdminModal
        title={modal.editing ? "Editar Serviço" : "Novo Serviço"}
        open={modal.open}
        onClose={closeModal}
      >
        <form onSubmit={handleSave} className="space-y-4">

          {/* Tipo */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tipo *</label>
            <select
              value={form.tipo}
              onChange={set("tipo")}
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            >
              {TIPOS_SERVICO.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <AdminFormField label="Nome" value={form.nome} onChange={set("nome")} required />
            <AdminFormField label="Telefone" value={form.telefone} onChange={set("telefone")} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <AdminFormField label="Instagram" value={form.instagram ?? ""} onChange={set("instagram")} />
            <AdminFormField label="Idiomas" value={form.idiomas ?? ""} onChange={set("idiomas")} />
          </div>
          <AdminFormField label="Endereço" value={form.endereco ?? ""} onChange={set("endereco")} />
          <AdminFormField label="CNPJ" value={form.cnpj ?? ""} onChange={set("cnpj")} />
          <AdminFormField label="Site" value={form.site ?? ""} onChange={set("site")} />
          <AdminFormField label="Descrição" value={form.descricao ?? ""} onChange={set("descricao")} multiline />

          {/* Roteiro */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Roteiro (opcional)</label>
            <select
              value={form.roteiro ?? ""}
              onChange={set("roteiro")}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Nenhum</option>
              {ROTEIROS.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* Logo + Foto */}
          <div className="grid grid-cols-2 gap-3">
            <FileUploadField
              label="Logo"
              accept="image"
              currentUrl={form.logoUrl ?? ""}
              hint="PNG, JPG ou WEBP"
              onFileChange={(url, file) => { setField("logoUrl", url); setFiles((p) => ({ ...p, logo: file })); }}
              onClear={() => setField("logoUrl", "")}
            />
            <FileUploadField
              label="Foto do Serviço"
              accept="image"
              currentUrl={form.fotoUrl ?? ""}
              hint="PNG, JPG ou WEBP"
              onFileChange={(url, file) => { setField("fotoUrl", url); setFiles((p) => ({ ...p, foto: file })); }}
              onClear={() => setField("fotoUrl", "")}
            />
          </div>

          {/* ─── Bloco Comprovante Cadastur ─── */}
          {requerComprovante && (
            <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <FileText size={13} /> Comprovante Cadastur
              </p>

              {/* Upload */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">
                  Arquivo{" "}
                  <span className="text-red-500">*</span>
                  {" "}— PDF ou imagem
                </label>

                {/* Preview do comprovante existente ou novo */}
                {comprovantePreviewUrl && (
                  <div className="flex items-center gap-2">
                    <a
                      href={comprovantePreviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/40 px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted hover:text-primary"
                    >
                      <FileText size={12} />
                      {files.comprovante ? files.comprovante.name : "Comprovante atual"}
                      <ExternalLink size={11} className="text-muted-foreground" />
                    </a>
                    {comprovanteExistente && !files.comprovante && (
                      <span className="text-xs text-muted-foreground">(existente)</span>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => comprovanteInputRef.current?.click()}
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
                  ref={comprovanteInputRef}
                  type="file"
                  accept="application/pdf,image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) setFiles((p) => ({ ...p, comprovante: f }));
                  }}
                />
              </div>

              {/* Data de validade */}
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                  <CalendarClock size={13} />
                  Data de validade do Cadastur
                </label>
                <input
                  type="date"
                  value={form.validade ?? ""}
                  onChange={set("validade")}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
                {/* Preview do badge de validade em tempo real */}
                {form.validade && (
                  <div className="pt-1">
                    <ValidityBadge validade={form.validade} />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Usuário Prestador */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Usuário Prestador *</label>
            <select
              value={form.usuarioId}
              onChange={set("usuarioId")}
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Selecione um usuário</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.nome} (@{u.usuario})</option>
              ))}
            </select>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500 dark:bg-red-950/30">{error}</p>
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
      <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="text-sm text-foreground whitespace-pre-wrap">{value}</dd>
    </div>
  );
}
