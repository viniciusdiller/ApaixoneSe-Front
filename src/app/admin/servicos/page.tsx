"use client";

import { useEffect, useState } from "react";
import { servicoTuristaApi, usersApi } from "@/lib/api";
import type { ServicoTurista, CreateServicoTuristaDto, TipoServicoTurista, TipoRoteiro, User } from "@/lib/api";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminFormField } from "@/components/admin/AdminFormField";
import { FileUploadField } from "@/components/admin/FileUploadField";
import { MediaPreview } from "@/components/admin/MediaPreview";
import { LoadingGrid } from "@/components/ui/LoadingGrid";
import { Plus, Eye } from "lucide-react";

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

const empty: CreateServicoTuristaDto = {
  tipo: "GUIA_TURISMO", nome: "", telefone: "", usuarioId: "",
  instagram: "", descricao: "", endereco: "", cnpj: "",
  idiomas: "", logoUrl: "", fotoUrl: "",
};

export default function AdminServicosPage() {
  const [items, setItems] = useState<ServicoTurista[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing: ServicoTurista | null }>({ open: false, editing: null });
  const [viewing, setViewing] = useState<ServicoTurista | null>(null);
  const [form, setForm] = useState<CreateServicoTuristaDto>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([servicoTuristaApi.getAll(), usersApi.getAll()])
      .then(([s, u]) => { setItems(s); setUsers(u); })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => { setForm(empty); setError(""); setModal({ open: true, editing: null }); };
  const openEdit = (item: ServicoTurista) => {
    setForm({
      tipo: item.tipo, nome: item.nome, telefone: item.telefone,
      usuarioId: item.usuarioId, instagram: item.instagram ?? "",
      descricao: item.descricao ?? "", endereco: item.endereco ?? "",
      cnpj: item.cnpj ?? "", roteiro: item.roteiro ?? undefined,
      idiomas: item.idiomas ?? "", logoUrl: item.logoUrl ?? "",
      fotoUrl: item.fotoUrl ?? "",
    });
    setError(""); setModal({ open: true, editing: item });
  };
  const closeModal = () => setModal({ open: false, editing: null });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setSaving(true);
    try {
      modal.editing
        ? await servicoTuristaApi.update(modal.editing.id, form)
        : await servicoTuristaApi.create(form);
      closeModal(); load();
    } catch (err: unknown) {
      try { const p = JSON.parse((err as Error).message); setError(Array.isArray(p.message) ? p.message.join(" ") : p.message); }
      catch { setError("Erro ao salvar."); }
    } finally { setSaving(false); }
  };

  const handleDelete = async (item: ServicoTurista) => {
    if (!confirm(`Excluir "${item.nome}"?`)) return;
    await servicoTuristaApi.remove(item.id); load();
  };

  const set = (k: keyof CreateServicoTuristaDto) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const setField = (k: keyof CreateServicoTuristaDto, value: string) =>
    setForm((prev) => ({ ...prev, [k]: value }));

  const tipoLabel = (v: TipoServicoTurista) => TIPOS_SERVICO.find((t) => t.value === v)?.label ?? v;
  const roteiroLabel = (v?: TipoRoteiro) => v ? (ROTEIROS.find((r) => r.value === v)?.label ?? v) : "—";
  const ownerName = (id: string) => { const u = users.find((u) => u.id === id); return u ? `${u.nome} (@${u.usuario})` : id; };
  const statusClass = (s: string) =>
    s === "APROVADO" ? "bg-green-100 text-green-700" : s === "REJEITADO" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700";

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-widest">Serviços ao Turista</h1>
          <p className="text-sm text-muted-foreground">{items.length} registros</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Novo Serviço
        </button>
      </div>

      {loading ? <LoadingGrid count={3} /> : (
        <AdminTable
          data={items}
          columns={[
            { key: "logoUrl", label: "Logo", render: (r) => <MediaPreview url={r.logoUrl ?? ""} label="Logo" /> },
            { key: "fotoUrl", label: "Foto", render: (r) => <MediaPreview url={r.fotoUrl ?? ""} label="Foto" /> },
            { key: "nome", label: "Nome" },
            { key: "tipo", label: "Tipo", render: (r) => tipoLabel(r.tipo) },
            {
              key: "status", label: "Status", render: (r) => (
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusClass(r.status)}`}>{r.status}</span>
              ),
            },
          ]}
          extraActions={(row) => (
            <button onClick={() => setViewing(row)} title="Ver detalhes"
              className="rounded p-1 text-muted-foreground transition hover:bg-surface-offset hover:text-primary">
              <Eye size={16} />
            </button>
          )}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Modal Visualização */}
      <AdminModal title="Detalhes do Serviço" open={!!viewing} onClose={() => setViewing(null)}>
        {viewing && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {viewing.logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={viewing.logoUrl} alt={viewing.nome} className="h-14 w-14 rounded-lg object-cover border border-border" />
              )}
              <div>
                <p className="font-display font-bold text-lg uppercase tracking-wide">{viewing.nome}</p>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusClass(viewing.status)}`}>{viewing.status}</span>
              </div>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <ViewRow label="Tipo" value={tipoLabel(viewing.tipo)} />
              <ViewRow label="Telefone" value={viewing.telefone} />
              <ViewRow label="CNPJ" value={viewing.cnpj} />
              <ViewRow label="Idiomas" value={viewing.idiomas} />
              <ViewRow label="Instagram" value={viewing.instagram} />
              <ViewRow label="Roteiro" value={roteiroLabel(viewing.roteiro)} />
            </dl>
            <ViewRow label="Endereço" value={viewing.endereco} />
            <ViewRow label="Descrição" value={viewing.descricao} />
            <ViewRow label="Usuário Prestador" value={ownerName(viewing.usuarioId)} />
            {viewing.fotoUrl && (
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Foto do Serviço</dt>
                <MediaPreview url={viewing.fotoUrl} label="Foto" />
              </div>
            )}
          </div>
        )}
      </AdminModal>

      {/* Modal Criar/Editar */}
      <AdminModal
        title={modal.editing ? "Editar Serviço" : "Novo Serviço"}
        open={modal.open}
        onClose={closeModal}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tipo *</label>
            <select value={form.tipo} onChange={set("tipo")} required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary">
              {TIPOS_SERVICO.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
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
          <AdminFormField label="Descrição" value={form.descricao ?? ""} onChange={set("descricao")} multiline />
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Roteiro (opcional)</label>
            <select value={form.roteiro ?? ""} onChange={set("roteiro")}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary">
              <option value="">Nenhum</option>
              {ROTEIROS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FileUploadField
              label="Logo"
              accept="image"
              currentUrl={form.logoUrl ?? ""}
              hint="PNG, JPG ou WEBP"
              onFileChange={(url) => setField("logoUrl", url)}
              onClear={() => setField("logoUrl", "")}
            />
            <FileUploadField
              label="Foto do Serviço"
              accept="image"
              currentUrl={form.fotoUrl ?? ""}
              hint="PNG, JPG ou WEBP"
              onFileChange={(url) => setField("fotoUrl", url)}
              onClear={() => setField("fotoUrl", "")}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Usuário Prestador *</label>
            <select value={form.usuarioId} onChange={set("usuarioId")} required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary">
              <option value="">Selecione um usuário</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.nome} (@{u.usuario})</option>)}
            </select>
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500 dark:bg-red-950/30">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeModal} className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted">Cancelar</button>
            <button type="submit" disabled={saving} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
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
