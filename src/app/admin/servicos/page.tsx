"use client";

import { useEffect, useState } from "react";
import { servicoTuristaApi } from "@/lib/api";
import type { ServicoTurista, CreateServicoTuristaDto } from "@/lib/api";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminFormField } from "@/components/admin/AdminFormField";
import { LoadingGrid } from "@/components/ui/LoadingGrid";
import { Plus } from "lucide-react";

const empty: CreateServicoTuristaDto = { nome: "", descricao: "", categoria: "", contato: "", imagem: "" };

export default function AdminServicosPage() {
  const [items, setItems] = useState<ServicoTurista[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing: ServicoTurista | null }>({ open: false, editing: null });
  const [form, setForm] = useState<CreateServicoTuristaDto>(empty);
  const [saving, setSaving] = useState(false);

  const load = () => { setLoading(true); servicoTuristaApi.getAll().then(setItems).finally(() => setLoading(false)); };
  useEffect(load, []);

  const openCreate = () => { setForm(empty); setModal({ open: true, editing: null }); };
  const openEdit = (item: ServicoTurista) => { setForm({ nome: item.nome, descricao: item.descricao, categoria: item.categoria, contato: item.contato, imagem: item.imagem }); setModal({ open: true, editing: item }); };
  const closeModal = () => setModal({ open: false, editing: null });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      modal.editing ? await servicoTuristaApi.update(modal.editing.id, form) : await servicoTuristaApi.create(form);
      closeModal(); load();
    } finally { setSaving(false); }
  };

  const handleDelete = async (item: ServicoTurista) => {
    if (!confirm(`Excluir "${item.nome}"?`)) return;
    await servicoTuristaApi.remove(item.id); load();
  };

  const set = (k: keyof CreateServicoTuristaDto) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-widest text-foreground">Serviços ao Turista</h1>
          <p className="text-sm text-muted-foreground">{items.length} registros</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Novo Serviço
        </button>
      </div>

      {loading ? <LoadingGrid count={3} /> : (
        <AdminTable
          data={items}
          columns={[
            { key: "id", label: "ID" },
            { key: "nome", label: "Nome" },
            { key: "categoria", label: "Categoria" },
            { key: "contato", label: "Contato" },
          ]}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      )}

      <AdminModal title={modal.editing ? "Editar Serviço" : "Novo Serviço"} open={modal.open} onClose={closeModal}>
        <form onSubmit={handleSave} className="space-y-4">
          <AdminFormField label="Nome" value={form.nome} onChange={set("nome")} required />
          <AdminFormField label="Descrição" value={form.descricao} onChange={set("descricao")} multiline required />
          <AdminFormField label="Categoria" value={form.categoria ?? ""} onChange={set("categoria")} />
          <AdminFormField label="Contato" value={form.contato ?? ""} onChange={set("contato")} />
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
