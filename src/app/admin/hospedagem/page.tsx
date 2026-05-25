"use client";

import { useEffect, useState } from "react";
import { hospedagemApi, usersApi } from "@/lib/api";
import type { Hospedagem, CreateHospedagemDto, User } from "@/lib/api";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminFormField } from "@/components/admin/AdminFormField";
import { FileUploadField } from "@/components/admin/FileUploadField";
import { MediaPreview } from "@/components/admin/MediaPreview";
import { LoadingGrid } from "@/components/ui/LoadingGrid";
import { Plus } from "lucide-react";

const empty: CreateHospedagemDto = {
  nome: "", telefone: "", endereco: "", textoDiferencial: "",
  cnpj: "", responsavelNome: "", responsavelCpf: "",
  documentoPdfUrl: "", logoUrl: "", usuarioId: "", instagram: "",
};

export default function AdminHospedagemPage() {
  const [items, setItems] = useState<Hospedagem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing: Hospedagem | null }>({ open: false, editing: null });
  const [form, setForm] = useState<CreateHospedagemDto>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([hospedagemApi.getAll(), usersApi.getAll()])
      .then(([h, u]) => { setItems(h); setUsers(u); })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => { setForm(empty); setError(""); setModal({ open: true, editing: null }); };
  const openEdit = (item: Hospedagem) => {
    setForm({
      nome: item.nome, telefone: item.telefone, endereco: item.endereco,
      textoDiferencial: item.textoDiferencial, cnpj: item.cnpj,
      responsavelNome: item.responsavelNome, responsavelCpf: item.responsavelCpf,
      documentoPdfUrl: item.documentoPdfUrl, logoUrl: item.logoUrl,
      usuarioId: item.usuarioId, instagram: item.instagram ?? "",
    });
    setError(""); setModal({ open: true, editing: item });
  };
  const closeModal = () => setModal({ open: false, editing: null });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setError(""); setSaving(true);
    try {
      modal.editing
        ? await hospedagemApi.update(modal.editing.id, form)
        : await hospedagemApi.create(form);
      closeModal(); load();
    } catch (err: unknown) {
      try { const p = JSON.parse((err as Error).message); setError(Array.isArray(p.message) ? p.message.join(" ") : p.message); }
      catch { setError("Erro ao salvar."); }
    } finally { setSaving(false); }
  };

  const handleDelete = async (item: Hospedagem) => {
    if (!confirm(`Excluir "${item.nome}"?`)) return;
    await hospedagemApi.remove(item.id); load();
  };

  const set = (k: keyof CreateHospedagemDto) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const setField = (k: keyof CreateHospedagemDto, value: string) =>
    setForm((prev) => ({ ...prev, [k]: value }));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-widest">Hospedagem</h1>
          <p className="text-sm text-muted-foreground">{items.length} registros</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Nova Hospedagem
        </button>
      </div>

      {loading ? <LoadingGrid count={3} /> : (
        <AdminTable
          data={items}
          columns={[
            { key: "id", label: "ID", render: (r) => <span className="font-mono text-xs">{String(r.id).slice(0, 8)}…</span> },
            { key: "logoUrl", label: "Logo", render: (r) => <MediaPreview url={r.logoUrl} label="Logo" /> },
            { key: "nome", label: "Nome" },
            { key: "endereco", label: "Endereço" },
            { key: "documentoPdfUrl", label: "PDF", render: (r) => <MediaPreview url={r.documentoPdfUrl} label="Documento" isPdf /> },
            {
              key: "status", label: "Status", render: (r) => (
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                  r.status === "APROVADO" ? "bg-green-100 text-green-700"
                  : r.status === "REJEITADO" ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
                }`}>{r.status}</span>
              ),
            },
          ]}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      )}

      <AdminModal
        title={modal.editing ? "Editar Hospedagem" : "Nova Hospedagem"}
        open={modal.open}
        onClose={closeModal}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <AdminFormField label="Nome" value={form.nome} onChange={set("nome")} required />
            <AdminFormField label="Telefone" value={form.telefone} onChange={set("telefone")} required />
          </div>
          <AdminFormField label="Endereço" value={form.endereco} onChange={set("endereco")} required />
          <AdminFormField label="Texto Diferencial" value={form.textoDiferencial} onChange={set("textoDiferencial")} multiline required />
          <div className="grid grid-cols-2 gap-3">
            <AdminFormField label="CNPJ" value={form.cnpj} onChange={set("cnpj")} required />
            <AdminFormField label="Instagram" value={form.instagram ?? ""} onChange={set("instagram")} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <AdminFormField label="Responsável (Nome)" value={form.responsavelNome} onChange={set("responsavelNome")} required />
            <AdminFormField label="Responsável (CPF)" value={form.responsavelCpf} onChange={set("responsavelCpf")} required />
          </div>

          <FileUploadField
            label="Logo do Estabelecimento"
            accept="image"
            currentUrl={form.logoUrl}
            required
            hint="PNG, JPG ou WEBP"
            onFileChange={(url) => setField("logoUrl", url)}
            onClear={() => setField("logoUrl", "")}
          />

          <FileUploadField
            label="Documento (PDF)"
            accept="pdf"
            currentUrl={form.documentoPdfUrl}
            required
            hint="Apenas arquivos .pdf"
            onFileChange={(url) => setField("documentoPdfUrl", url)}
            onClear={() => setField("documentoPdfUrl", "")}
          />

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Usuário Dono *</label>
            <select
              value={form.usuarioId}
              onChange={set("usuarioId")}
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Selecione um usuário</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.nome} (@{u.usuario})</option>)}
            </select>
          </div>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500 dark:bg-red-950/30">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeModal} className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted">Cancelar</button>
            <button type="submit" disabled={saving} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
