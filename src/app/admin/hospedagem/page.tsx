"use client";

import { useEffect, useState } from "react";
import { hospedagemApi } from "@/lib/api";
import type { Hospedagem, CreateHospedagemDto } from "@/lib/api";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminFormField } from "@/components/admin/AdminFormField";
import { LoadingGrid } from "@/components/ui/LoadingGrid";
import { Plus } from "lucide-react";

const empty: CreateHospedagemDto = { nome: "", descricao: "", tipo: "", endereco: "", imagem: "", preco: undefined };

export default function AdminHospedagemPage() {
  const [items, setItems] = useState<Hospedagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing: Hospedagem | null }>({ open: false, editing: null });
  const [form, setForm] = useState<CreateHospedagemDto>(empty);
  const [saving, setSaving] = useState(false);

  const load = () => { setLoading(true); hospedagemApi.getAll().then(setItems).finally(() => setLoading(false)); };
  useEffect(load, []);

  const openCreate = () => { setForm(empty); setModal({ open: true, editing: null }); };
  const openEdit = (item: Hospedagem) => { setForm({ nome: item.nome, descricao: item.descricao, tipo: item.tipo, endereco: item.endereco, imagem: item.imagem, preco: item.preco }); setModal({ open: true, editing: item }); };
  const closeModal = () => setModal({ open: false, editing: null });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true);
    try {
      modal.editing ? await hospedagemApi.update(modal.editing.id, form) : await hospedagemApi.create(form);
      closeModal(); load();
    } finally { setSaving(false); }
  };

  const handleDelete = async (item: Hospedagem) => {
    if (!confirm(`Excluir "${item.nome}"?`)) return;
    await hospedagemApi.remove(item.id); load();
  };

  const set = (k: keyof CreateHospedagemDto) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [k]: k === "preco" ? Number(e.target.value) : e.target.value }));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-widest text-foreground">Hospedagem</h1>
          <p className="text-sm text-muted-foreground">{items.length} registros</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Nova Hospedagem
        </button>
      </div>

      {loading ? <LoadingGrid count={3} /> : (
        <AdminTable
          data={items}
          columns={[
            { key: "id", label: "ID" },
            { key: "nome", label: "Nome" },
            { key: "tipo", label: "Tipo" },
            { key: "endereco", label: "Endereço" },
            { key: "preco", label: "Preço", render: (r) => r.preco ? `R$ ${r.preco}` : "—" },
          ]}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      )}

      <AdminModal title={modal.editing ? "Editar Hospedagem" : "Nova Hospedagem"} open={modal.open} onClose={closeModal}>
        <form onSubmit={handleSave} className="space-y-4">
          <AdminFormField label="Nome" value={form.nome} onChange={set("nome")} required />
          <AdminFormField label="Descrição" value={form.descricao} onChange={set("descricao")} multiline required />
          <AdminFormField label="Tipo" value={form.tipo ?? ""} onChange={set("tipo")} />
          <AdminFormField label="Endereço" value={form.endereco ?? ""} onChange={set("endereco")} />
          <AdminFormField label="Preço (R$)" value={String(form.preco ?? "")} onChange={set("preco")} type="number" min="0" />
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
