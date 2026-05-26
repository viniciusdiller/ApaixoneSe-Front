"use client";

import { useEffect, useState } from "react";
import { eventosApi } from "@/lib/api";
import type { Evento, CreateEventoDto } from "@/lib/api";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminFormField } from "@/components/admin/AdminFormField";
import { LoadingGrid } from "@/components/ui/LoadingGrid";
import { Plus, Eye } from "lucide-react";

const empty: CreateEventoDto = { titulo: "", descricao: "", data: "", local: "" };

export default function AdminEventosPage() {
  const [items, setItems] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing: Evento | null }>({ open: false, editing: null });
  const [viewing, setViewing] = useState<Evento | null>(null);
  const [form, setForm] = useState<CreateEventoDto>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => { setLoading(true); eventosApi.getAll().then(setItems).finally(() => setLoading(false)); };
  useEffect(load, []);

  const openCreate = () => { setForm(empty); setError(""); setModal({ open: true, editing: null }); };
  const openEdit = (item: Evento) => { setForm({ titulo: item.titulo, descricao: item.descricao, data: item.data?.slice(0, 16) ?? "", local: item.local }); setError(""); setModal({ open: true, editing: item }); };
  const closeModal = () => setModal({ open: false, editing: null });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setSaving(true);
    try {
      modal.editing ? await eventosApi.update(modal.editing.id, form) : await eventosApi.create(form);
      closeModal(); load();
    } catch (err: unknown) {
      try {
        const p = JSON.parse((err as Error).message);
        setError(Array.isArray(p.message) ? p.message.join(" ") : p.message);
      } catch {
        setError("Erro ao salvar.");
      }
    } finally { setSaving(false); }
  };

  const handleDelete = async (item: Evento) => {
    if (!confirm(`Excluir "${item.titulo}"?`)) return;
    await eventosApi.remove(item.id); load();
  };

  const set = (k: keyof CreateEventoDto) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [k]: e.target.value }));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-widest">Eventos</h1>
          <p className="text-sm text-muted-foreground">{items.length} registros</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Novo Evento
        </button>
      </div>

      {loading ? <LoadingGrid count={3} /> : (
        <AdminTable data={items} columns={[
          { key: "titulo", label: "Título" },
          { key: "local", label: "Local" },
          { key: "data", label: "Data", render: (r) => new Date(r.data).toLocaleDateString("pt-BR") },
        ]} extraActions={(row) => (
          <button onClick={() => setViewing(row)} title="Ver detalhes"
            className="rounded p-1 text-muted-foreground transition hover:bg-surface-offset hover:text-primary">
            <Eye size={16} />
          </button>
        )} onEdit={openEdit} onDelete={handleDelete} />
      )}

      {/* Modal Visualização */}
      <AdminModal title="Detalhes do Evento" open={!!viewing} onClose={() => setViewing(null)}>
        {viewing && (
          <dl className="space-y-3 text-sm">
            <ViewRow label="Título" value={viewing.titulo} />
            <ViewRow label="Local" value={viewing.local} />
            <ViewRow label="Data" value={new Date(viewing.data).toLocaleString("pt-BR")} />
            <ViewRow label="Descrição" value={viewing.descricao} />
          </dl>
        )}
      </AdminModal>

      {/* Modal Criar/Editar */}
      <AdminModal title={modal.editing ? "Editar Evento" : "Novo Evento"} open={modal.open} onClose={closeModal}>
        <form onSubmit={handleSave} className="space-y-4">
          <AdminFormField label="Título" value={form.titulo} onChange={set("titulo")} required />
          <AdminFormField label="Local" value={form.local} onChange={set("local")} required />
          <AdminFormField label="Data e Hora" value={form.data} onChange={set("data")} type="datetime-local" required />
          <AdminFormField label="Descrição" value={form.descricao} onChange={set("descricao")} multiline required />
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
