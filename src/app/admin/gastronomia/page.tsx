"use client";

import { useEffect, useState } from "react";
import { gastronomiaApi, usersApi } from "@/lib/api";
import type { Gastronomia, CreateGastronomiaDto, User } from "@/lib/api";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminFormField } from "@/components/admin/AdminFormField";
import { LoadingGrid } from "@/components/ui/LoadingGrid";
import { Plus } from "lucide-react";

const empty: CreateGastronomiaDto = { nome: "", telefone: "", endereco: "", cnpj: "", responsavelNome: "", responsavelCpf: "", documentoPdfUrl: "", logoUrl: "", usuarioId: "", instagram: "", especialidade: "" };

export default function AdminGastronomiaPage() {
  const [items, setItems] = useState<Gastronomia[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing: Gastronomia | null }>({ open: false, editing: null });
  const [form, setForm] = useState<CreateGastronomiaDto>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([gastronomiaApi.getAll(), usersApi.getAll()])
      .then(([g, u]) => { setItems(g); setUsers(u); })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => { setForm(empty); setError(""); setModal({ open: true, editing: null }); };
  const openEdit = (item: Gastronomia) => {
    setForm({ nome: item.nome, telefone: item.telefone, endereco: item.endereco, cnpj: item.cnpj, responsavelNome: item.responsavelNome, responsavelCpf: item.responsavelCpf, documentoPdfUrl: item.documentoPdfUrl, logoUrl: item.logoUrl, usuarioId: item.usuarioId, instagram: item.instagram ?? "", especialidade: item.especialidade ?? "" });
    setError(""); setModal({ open: true, editing: item });
  };
  const closeModal = () => setModal({ open: false, editing: null });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setSaving(true);
    try {
      modal.editing ? await gastronomiaApi.update(modal.editing.id, form) : await gastronomiaApi.create(form);
      closeModal(); load();
    } catch (err: any) {
      try { const p = JSON.parse(err.message); setError(Array.isArray(p.message) ? p.message.join(" ") : p.message); }
      catch { setError("Erro ao salvar."); }
    } finally { setSaving(false); }
  };

  const handleDelete = async (item: Gastronomia) => {
    if (!confirm(`Excluir "${item.nome}"?`)) return;
    await gastronomiaApi.remove(item.id); load();
  };

  const set = (k: keyof CreateGastronomiaDto) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [k]: e.target.value }));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-widest">Gastronomia</h1>
          <p className="text-sm text-muted-foreground">{items.length} registros</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Novo Estabelecimento
        </button>
      </div>

      {loading ? <LoadingGrid count={3} /> : (
        <AdminTable data={items} columns={[
          { key: "id", label: "ID", render: (r) => <span className="font-mono text-xs">{String(r.id).slice(0, 8)}…</span> },
          { key: "nome", label: "Nome" },
          { key: "endereco", label: "Endereço" },
          { key: "status", label: "Status", render: (r) => (
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ r.status === "APROVADO" ? "bg-green-100 text-green-700" : r.status === "REJEITADO" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700" }`}>{r.status}</span>
          )},
        ]} onEdit={openEdit} onDelete={handleDelete} />
      )}

      <AdminModal title={modal.editing ? "Editar Gastronomia" : "Novo Estabelecimento"} open={modal.open} onClose={closeModal}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <AdminFormField label="Nome" value={form.nome} onChange={set("nome")} required />
            <AdminFormField label="Telefone" value={form.telefone} onChange={set("telefone")} required />
          </div>
          <AdminFormField label="Endereço" value={form.endereco} onChange={set("endereco")} required />
          <div className="grid grid-cols-2 gap-3">
            <AdminFormField label="CNPJ" value={form.cnpj} onChange={set("cnpj")} required />
            <AdminFormField label="Especialidade" value={form.especialidade ?? ""} onChange={set("especialidade")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <AdminFormField label="Responsável (Nome)" value={form.responsavelNome} onChange={set("responsavelNome")} required />
            <AdminFormField label="Responsável (CPF)" value={form.responsavelCpf} onChange={set("responsavelCpf")} required />
          </div>
          <AdminFormField label="Instagram" value={form.instagram ?? ""} onChange={set("instagram")} />
          <AdminFormField label="URL do PDF" value={form.documentoPdfUrl} onChange={set("documentoPdfUrl")} type="url" required />
          <AdminFormField label="URL do Logo" value={form.logoUrl} onChange={set("logoUrl")} type="url" required />
          <div className="space-y-1">
            <label className="text-sm font-medium">Usuário Dono *</label>
            <select value={form.usuarioId} onChange={set("usuarioId")} required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary">
              <option value="">Selecione um usuário</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.nome} (@{u.usuario})</option>)}
            </select>
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
