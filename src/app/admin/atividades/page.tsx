"use client";

import { useEffect, useState } from "react";
import { atividadesApi } from "@/lib/api";
import type { Atividade, CreateAtividadeDto, TipoRoteiro } from "@/lib/api";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminFormField } from "@/components/admin/AdminFormField";
import { LoadingGrid } from "@/components/ui/LoadingGrid";
import { Plus, Eye } from "lucide-react";

const ROTEIROS: { value: TipoRoteiro; label: string }[] = [
  { value: "A_PE", label: "A Pé" },
  { value: "ESPORTE_E_AVENTURA", label: "Esporte e Aventura" },
  { value: "DE_PRAIAS", label: "De Praias" },
  { value: "CULTURAL", label: "Cultural" },
  { value: "RELIGIOSO", label: "Religioso" },
  { value: "RURAL", label: "Rural" },
  { value: "ECOLOGICO", label: "Ecológico" },
];

const empty: CreateAtividadeDto = { titulo: "", descricao: "", local: "", roteiro: "A_PE" };

export default function AdminAtividadesPage() {
  const [items, setItems] = useState<Atividade[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing: Atividade | null }>({ open: false, editing: null });
  const [viewing, setViewing] = useState<Atividade | null>(null);
  const [form, setForm] = useState<CreateAtividadeDto>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => { setLoading(true); atividadesApi.getAll().then(setItems).finally(() => setLoading(false)); };
  useEffect(load, []);

  const openCreate = () => { setForm(empty); setError(""); setModal({ open: true, editing: null }); };
  const openEdit = (item: Atividade) => {
    setForm({ titulo: item.titulo, descricao: item.descricao, local: item.local, roteiro: item.roteiro, latitude: item.latitude, longitude: item.longitude });
    setError(""); setModal({ open: true, editing: item });
  };
  const closeModal = () => setModal({ open: false, editing: null });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setSaving(true);
    try {
      modal.editing ? await atividadesApi.update(modal.editing.id, form) : await atividadesApi.create(form);
      closeModal(); load();
    } catch (err: unknown) {
      try { const p = JSON.parse((err as Error).message); setError(Array.isArray(p.message) ? p.message.join(" ") : p.message); }
      catch { setError("Erro ao salvar."); }
    } finally { setSaving(false); }
  };

  const handleDelete = async (item: Atividade) => {
    if (!confirm(`Excluir "${item.titulo}"?`)) return;
    await atividadesApi.remove(item.id); load();
  };

  const set = (k: keyof CreateAtividadeDto) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const roteiroLabel = (v: TipoRoteiro) => ROTEIROS.find((r) => r.value === v)?.label ?? v;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-widest">Atividades</h1>
          <p className="text-sm text-muted-foreground">{items.length} registros</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Nova Atividade
        </button>
      </div>

      {loading ? <LoadingGrid count={3} /> : (
        <AdminTable data={items} columns={[
          { key: "titulo", label: "Título" },
          { key: "local", label: "Local" },
          { key: "roteiro", label: "Roteiro", render: (r) => roteiroLabel(r.roteiro) },
        ]} extraActions={(row) => (
          <button onClick={() => setViewing(row)} title="Ver detalhes"
            className="rounded p-1 text-muted-foreground transition hover:bg-surface-offset hover:text-primary">
            <Eye size={16} />
          </button>
        )} onEdit={openEdit} onDelete={handleDelete} />
      )}

      {/* Modal Visualização */}
      <AdminModal title="Detalhes da Atividade" open={!!viewing} onClose={() => setViewing(null)}>
        {viewing && (
          <dl className="space-y-3 text-sm">
            <ViewRow label="Título" value={viewing.titulo} />
            <ViewRow label="Local" value={viewing.local} />
            <ViewRow label="Roteiro" value={roteiroLabel(viewing.roteiro)} />
            <ViewRow label="Descrição" value={viewing.descricao} />
            {viewing.latitude != null && <ViewRow label="Latitude" value={String(viewing.latitude)} />}
            {viewing.longitude != null && <ViewRow label="Longitude" value={String(viewing.longitude)} />}
          </dl>
        )}
      </AdminModal>

      {/* Modal Criar/Editar */}
      <AdminModal title={modal.editing ? "Editar Atividade" : "Nova Atividade"} open={modal.open} onClose={closeModal}>
        <form onSubmit={handleSave} className="space-y-4">
          <AdminFormField label="Título" value={form.titulo} onChange={set("titulo")} required />
          <AdminFormField label="Local" value={form.local} onChange={set("local")} required />
          <AdminFormField label="Descrição" value={form.descricao} onChange={set("descricao")} multiline required />
          <div className="space-y-1">
            <label className="text-sm font-medium">Roteiro *</label>
            <select value={form.roteiro} onChange={set("roteiro")} required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary">
              {ROTEIROS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <AdminFormField label="Latitude (opcional)" value={String(form.latitude ?? "")} onChange={set("latitude")} type="number" />
            <AdminFormField label="Longitude (opcional)" value={String(form.longitude ?? "")} onChange={set("longitude")} type="number" />
          </div>
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500 dark:bg-red-950/30">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeModal} className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted">Cancelar</button>
            <button type="submit" disabled={saving} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{saving ? "Salvando..." : "Salvar"}</button>
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
