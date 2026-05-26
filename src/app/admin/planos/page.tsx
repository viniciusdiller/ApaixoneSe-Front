"use client";

import { useEffect, useState } from "react";
import { planoViagemApi } from "@/lib/api";
import type { PlanoViagem, CreatePlanoViagemDto } from "@/lib/api";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminFormField } from "@/components/admin/AdminFormField";
import { OwnerCard } from "@/components/admin/OwnerCard";
import { LoadingGrid } from "@/components/ui/LoadingGrid";
import { Plus } from "lucide-react";

const empty: CreatePlanoViagemDto = { titulo: "", dataInicio: "", dataFim: "", usuarioId: "" };

export default function AdminPlanosPage() {
  const [items, setItems] = useState<PlanoViagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing: PlanoViagem | null }>({ open: false, editing: null });
  const [form, setForm] = useState<CreatePlanoViagemDto>(empty);
  const [saving, setSaving] = useState(false);

  const load = () => { setLoading(true); planoViagemApi.getAll().then(setItems).finally(() => setLoading(false)); };
  useEffect(load, []);

  const openCreate = () => { setForm(empty); setModal({ open: true, editing: null }); };
  const openEdit = (item: PlanoViagem) => {
    setForm({
      titulo: item.titulo,
      dataInicio: item.dataInicio?.slice(0, 10) ?? "",
      dataFim: item.dataFim?.slice(0, 10) ?? "",
      usuarioId: item.usuarioId,
    });
    setModal({ open: true, editing: item });
  };
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
        <AdminTable<PlanoViagem>
          data={items}
          columns={[
            { key: "titulo", label: "Título" },
            { key: "dataInicio", label: "Início", render: (_, row) => row.dataInicio ? new Date(row.dataInicio).toLocaleDateString("pt-BR") : "—" },
            { key: "dataFim", label: "Fim", render: (_, row) => row.dataFim ? new Date(row.dataFim).toLocaleDateString("pt-BR") : "—" },
            { key: "createdAt", label: "Criado em", render: (_, row) => row.createdAt ? new Date(row.createdAt).toLocaleDateString("pt-BR") : "—" },
          ]}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      )}

      <AdminModal title={modal.editing ? "Editar Plano" : "Novo Plano"} open={modal.open} onClose={closeModal}>
        <form onSubmit={handleSave} className="space-y-4">

          {/* Dono da conta — só aparece ao editar */}
          {modal.editing && (
            <OwnerCard
              usuarioId={modal.editing.usuarioId}
              embedded={modal.editing.usuario ?? undefined}
            />
          )}

          <AdminFormField label="Título" value={form.titulo} onChange={set("titulo")} required />
          <div className="grid grid-cols-2 gap-3">
            <AdminFormField label="Data Início" value={form.dataInicio} onChange={set("dataInicio")} type="date" required />
            <AdminFormField label="Data Fim" value={form.dataFim} onChange={set("dataFim")} type="date" required />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeModal} className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted">Cancelar</button>
            <button type="submit" disabled={saving} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{saving ? "Salvando..." : "Salvar"}</button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
