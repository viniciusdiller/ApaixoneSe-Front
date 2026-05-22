"use client";

import { useEffect, useState } from "react";
import { atividadesApi } from "@/lib/api";
import type { Atividade, CreateAtividadeDto } from "@/lib/api";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminFormField } from "@/components/admin/AdminFormField";
import { LoadingGrid } from "@/components/ui/LoadingGrid";
import { Plus } from "lucide-react";

const empty: CreateAtividadeDto = { nome: "", descricao: "", roteiro: "", imagem: "" };

export default function AdminAtividadesPage() {
  const [items, setItems] = useState<Atividade[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing: Atividade | null }>({
    open: false,
    editing: null,
  });
  const [form, setForm] = useState<CreateAtividadeDto>(empty);
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    atividadesApi.getAll().then(setItems).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => { setForm(empty); setModal({ open: true, editing: null }); };
  const openEdit = (item: Atividade) => { setForm({ nome: item.nome, descricao: item.descricao, roteiro: item.roteiro, imagem: item.imagem }); setModal({ open: true, editing: item }); };
  const closeModal = () => setModal({ open: false, editing: null });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (modal.editing) {
        await atividadesApi.update(modal.editing.id, form);
      } else {
        await atividadesApi.create(form);
      }
      closeModal();
      load();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: Atividade) => {
    if (!confirm(`Excluir "${item.nome}"?`)) return;
    await atividadesApi.remove(item.id);
    load();
  };

  const set = (k: keyof CreateAtividadeDto) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-widest text-foreground">Atividades</h1>
          <p className="text-sm text-muted-foreground">{items.length} registros</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Nova Atividade
        </button>
      </div>

      {loading ? <LoadingGrid count={3} /> : (
        <AdminTable
          data={items}
          columns={[
            { key: "id", label: "ID" },
            { key: "nome", label: "Nome" },
            { key: "descricao", label: "Descrição", render: (r) => <span className="line-clamp-1 max-w-xs">{r.descricao}</span> },
            { key: "roteiro", label: "Roteiro" },
          ]}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      )}

      <AdminModal title={modal.editing ? "Editar Atividade" : "Nova Atividade"} open={modal.open} onClose={closeModal}>
        <form onSubmit={handleSave} className="space-y-4">
          <AdminFormField label="Nome" value={form.nome} onChange={set("nome")} required />
          <AdminFormField label="Descrição" value={form.descricao} onChange={set("descricao")} multiline required />
          <AdminFormField label="Roteiro" value={form.roteiro ?? ""} onChange={set("roteiro")} />
          <AdminFormField label="URL da Imagem" value={form.imagem ?? ""} onChange={set("imagem")} type="url" />
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeModal} className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted">Cancelar</button>
            <button type="submit" disabled={saving} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{saving ? "Salvando..." : "Salvar"}</button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
