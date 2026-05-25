"use client";

import { useEffect, useState } from "react";
import { catApi } from "@/lib/api";
import type { Cat, CreateCatDto } from "@/lib/api";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminFormField } from "@/components/admin/AdminFormField";
import { LoadingGrid } from "@/components/ui/LoadingGrid";
import { Plus } from "lucide-react";

const empty: CreateCatDto = { texto: "", arquivoUrl: "" };

export default function AdminCategoriasPage() {
  const [items, setItems] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing: Cat | null }>({ open: false, editing: null });
  const [form, setForm] = useState<CreateCatDto>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => { setLoading(true); catApi.getAll().then(setItems).finally(() => setLoading(false)); };
  useEffect(load, []);

  const openCreate = () => { setForm(empty); setError(""); setModal({ open: true, editing: null }); };
  const openEdit = (item: Cat) => { setForm({ texto: item.texto, arquivoUrl: item.arquivoUrl }); setError(""); setModal({ open: true, editing: item }); };
  const closeModal = () => setModal({ open: false, editing: null });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setSaving(true);
    try {
      modal.editing ? await catApi.update(modal.editing.id, form) : await catApi.create(form);
      closeModal(); load();
    } catch (err: any) {
      try { const p = JSON.parse(err.message); setError(Array.isArray(p.message) ? p.message.join(" ") : p.message); }
      catch { setError("Erro ao salvar."); }
    } finally { setSaving(false); }
  };

  const handleDelete = async (item: Cat) => {
    if (!confirm(`Excluir este registro CAT?`)) return;
    await catApi.remove(item.id); load();
  };

  const set = (k: keyof CreateCatDto) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [k]: e.target.value }));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-widest">CAT</h1>
          <p className="text-sm text-muted-foreground">Central de Atendimento ao Turista — {items.length} registros</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Novo Registro
        </button>
      </div>

      {loading ? <LoadingGrid count={3} /> : (
        <AdminTable data={items} columns={[
          { key: "id", label: "ID", render: (r) => <span className="font-mono text-xs">{String(r.id).slice(0, 8)}…</span> },
          { key: "texto", label: "Texto", render: (r) => <span className="line-clamp-2 max-w-sm text-sm">{r.texto}</span> },
          { key: "arquivoUrl", label: "Arquivo", render: (r) => <a href={r.arquivoUrl} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 text-xs">Ver arquivo</a> },
        ]} onEdit={openEdit} onDelete={handleDelete} />
      )}

      <AdminModal title={modal.editing ? "Editar CAT" : "Novo Registro CAT"} open={modal.open} onClose={closeModal}>
        <form onSubmit={handleSave} className="space-y-4">
          <AdminFormField label="Texto descritivo" value={form.texto} onChange={set("texto")} multiline required />
          <AdminFormField label="URL do Arquivo (PDF ou Imagem)" value={form.arquivoUrl} onChange={set("arquivoUrl")} type="url" required />
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
