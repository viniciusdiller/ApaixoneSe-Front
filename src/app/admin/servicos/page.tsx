"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { servicoTuristaApi } from "@/lib/api";
import type { ServicoTurista, CreateServicoTuristaDto, TipoServicoTurista, TipoRoteiro } from "@/lib/api";
import { AdminTable, type Column } from "@/components/admin/AdminTable";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminFormField } from "@/components/admin/AdminFormField";
import { LoadingGrid } from "@/components/ui/LoadingGrid";

const TIPOS: { value: TipoServicoTurista; label: string }[] = [
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

const emptyForm = (): CreateServicoTuristaDto => ({
  tipo: "GUIA_TURISMO",
  nome: "",
  telefone: "",
  usuarioId: "",
  instagram: "",
  descricao: "",
  endereco: "",
  cnpj: "",
  idiomas: "",
});

export default function AdminServicosPage() {
  const [items, setItems] = useState<ServicoTurista[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ServicoTurista | null>(null);
  const [form, setForm] = useState<CreateServicoTuristaDto>(emptyForm());
  const [saving, setSaving] = useState(false);

  const load = () => { setLoading(true); servicoTuristaApi.getAll().then(setItems).finally(() => setLoading(false)); };
  useEffect(load, []);

  function openCreate() {
    setEditing(null); setForm(emptyForm()); setModalOpen(true);
  }

  function openEdit(item: ServicoTurista) {
    setEditing(item);
    setForm({
      tipo: item.tipo,
      nome: item.nome ?? "",
      telefone: item.telefone ?? "",
      usuarioId: item.usuarioId ?? "",
      instagram: item.instagram ?? "",
      descricao: item.descricao ?? "",
      endereco: item.endereco ?? "",
      cnpj: item.cnpj ?? "",
      roteiro: item.roteiro ?? undefined,
      idiomas: item.idiomas ?? "",
    });
    setModalOpen(true);
  }

  async function handleSubmit() {
    setSaving(true);
    try {
      if (editing) await servicoTuristaApi.update(editing.id, form);
      else await servicoTuristaApi.create(form);
      setModalOpen(false); load();
    } catch (e) { alert("Erro ao salvar: " + (e as Error).message); }
    finally { setSaving(false); }
  }

  async function handleDelete(item: ServicoTurista) {
    if (!confirm(`Excluir "${item.nome}"?`)) return;
    await servicoTuristaApi.remove(item.id); load();
  }

  const set = (k: keyof CreateServicoTuristaDto) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const columns: Column<ServicoTurista>[] = [
    { key: "id", label: "ID" },
    { key: "tipo", label: "Tipo", render: (v) => TIPOS.find(t => t.value === (v as string))?.label ?? String(v) },
    { key: "nome", label: "Nome" },
    { key: "telefone", label: "Telefone" },
    { key: "status", label: "Status" },
    {
      key: "actions", label: "",
      render: (_: unknown, row: ServicoTurista) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(row)} className="rounded p-1 hover:bg-muted"><Pencil className="h-4 w-4" /></button>
          <button onClick={() => handleDelete(row)} className="rounded p-1 hover:bg-muted text-destructive"><Trash2 className="h-4 w-4" /></button>
        </div>
      ),
    },
  ];

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

      {loading ? <LoadingGrid count={3} /> : <AdminTable<ServicoTurista> columns={columns} data={items} />}

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit} saving={saving}
        title={editing ? "Editar Serviço" : "Novo Serviço"}>
        <div className="space-y-1">
          <label className="text-sm font-medium">Tipo *</label>
          <select value={form.tipo} onChange={set("tipo")}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary">
            {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <AdminFormField label="Nome *" value={form.nome ?? ""} onChange={set("nome")} />
        <AdminFormField label="Telefone *" value={form.telefone ?? ""} onChange={set("telefone")} />
        <AdminFormField label="ID do Usuário *" value={form.usuarioId ?? ""} onChange={set("usuarioId")} />
        <AdminFormField label="Instagram" value={form.instagram ?? ""} onChange={set("instagram")} />
        <AdminFormField label="Descrição" value={form.descricao ?? ""} onChange={set("descricao")} multiline />
        <AdminFormField label="Endereço" value={form.endereco ?? ""} onChange={set("endereco")} />
        <AdminFormField label="CNPJ" value={form.cnpj ?? ""} onChange={set("cnpj")} />
        <AdminFormField label="Idiomas" value={form.idiomas ?? ""} onChange={set("idiomas")} />
        <div className="space-y-1">
          <label className="text-sm font-medium">Roteiro (opcional)</label>
          <select value={form.roteiro ?? ""} onChange={set("roteiro")}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary">
            <option value="">— nenhum —</option>
            {ROTEIROS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
      </AdminModal>
    </div>
  );
}
