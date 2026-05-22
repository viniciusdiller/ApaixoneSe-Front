"use client";

import { useEffect, useState } from "react";
import { planoViagemApi } from "@/lib/api";
import type { PlanoViagem, CreatePlanoViagemDto } from "@/lib/api";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminFormField } from "@/components/admin/AdminFormField";
import { LoadingGrid } from "@/components/ui/LoadingGrid";
import { Plus } from "lucide-react";

const empty: CreatePlanoViagemDto = { titulo: "", descricao: "" };

export default function AdminPlanosPage() {
  const [items, setItems] = useState<PlanoViagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing: PlanoViagem | null }>({ open: false, editing: null });
  const [form, setForm] = useState<CreatePlanoViagemDto>(empty);
  const [saving, setSaving] = useState(false);

  const load = () => { setLoading(true); planoViagemApi.getAll().then(setItems).finally(() => setLoading(false)); };
  useEffect(load, []);

  const openCreate = () => { setForm(empty); setModal({ open: true, editing: null }); };
  const openEdit = (item: PlanoViagem) => { setForm({ titulo: item.titulo, descricao: item.descricao }); setModal({ open: true, editing: item }); };
  const closeModal = () => setModal({ open: false, editing: null });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      modal.editing ? await planoViagemApi.update(modal.editing.id, form) : await planoViagemApi.create(form);
      closeModal(); load();
    } finally { setSaving(false); }
  };

  const handleDelete = async (item: PlanoViagem) => {
    if (!confirm(`Excluir plano "${item.titulo}"?`)) return;
    await planoViagemApi.remove(item.id); load();
  };

  const set = (k: keyof CreatePlanoViagemDto) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-widest text-foreground">Planos de Viagem</h1>
          <p className="text-sm text-muted-foreground">{items.length} registros</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Novo Plano
        </button>
      </div>

      {loading ? <LoadingGrid count={3} /> : (
        <AdminTable
          data={items}
          columns={[
            { key: "id", label: "ID" },
            { key: "titulo", label: "Título" },
            { key: "descricao", label: "Descrição", render: (r) => <span className="line-clamp-1 max-w-xs">{r.descricao ?? "—"}</span> },
            { key: "createdAt", label: "Criado em", render: (r) => r.createdAt ? new Date(r.createdAt).toLocaleDateString("pt-BR") : "—" },
          ]}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      )}

      <AdminModal title={modal.editing ? "Editar Plano" : "Novo Plano"} open={modal.open} onClose={closeModal}>
        <form onSubmit={handleSave} className="space-y-4">
          <AdminFormField label="Título" value={form.titulo} onChange={set("titulo")} required />
          <AdminFormField label="Descrição" value={form.descricao ?? ""} onChange={set("descricao")} multiline />
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeModal} className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted">Cancelar</button>
            <button type="submit" disabled={saving} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{saving ? "Salvando..." : "Salvar"}</button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
