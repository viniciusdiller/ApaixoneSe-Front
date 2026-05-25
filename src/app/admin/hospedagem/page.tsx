"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { hospedagemApi, type Hospedagem } from "@/lib/api";
import { AdminTable, type Column } from "@/components/admin/AdminTable";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminFormField } from "@/components/admin/AdminFormField";
import { FileUploadField } from "@/components/admin/FileUploadField";
import { MediaPreview } from "@/components/admin/MediaPreview";
import { buildFormData } from "@/lib/buildFormData";

export default function HospedagemAdminPage() {
  const [items, setItems] = useState<Hospedagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Hospedagem | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    nome: "", telefone: "", instagram: "", endereco: "",
    textoDiferencial: "", cnpj: "", responsavelNome: "", responsavelCpf: "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  async function load() {
    setLoading(true);
    try { setItems(await hospedagemApi.getAll()); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null);
    setForm({ nome: "", telefone: "", instagram: "", endereco: "", textoDiferencial: "", cnpj: "", responsavelNome: "", responsavelCpf: "" });
    setLogoFile(null); setPdfFile(null);
    setModalOpen(true);
  }

  function openEdit(item: Hospedagem) {
    setEditing(item);
    setForm({
      nome: item.nome ?? "", telefone: item.telefone ?? "", instagram: item.instagram ?? "",
      endereco: item.endereco ?? "", textoDiferencial: (item as any).textoDiferencial ?? "",
      cnpj: (item as any).cnpj ?? "", responsavelNome: (item as any).responsavelNome ?? "",
      responsavelCpf: (item as any).responsavelCpf ?? "",
    });
    setLogoFile(null); setPdfFile(null);
    setModalOpen(true);
  }

  async function handleSubmit() {
    setSaving(true);
    try {
      const fd = buildFormData({
        nome: form.nome, telefone: form.telefone,
        instagram: form.instagram || undefined, endereco: form.endereco,
        textoDiferencial: form.textoDiferencial, cnpj: form.cnpj,
        responsavelNome: form.responsavelNome, responsavelCpf: form.responsavelCpf,
        ...(logoFile ? { logo: logoFile } : {}),
        ...(pdfFile ? { documentoPdf: pdfFile } : {}),
      });
      if (editing) await hospedagemApi.update(editing.id, fd as any);
      else await hospedagemApi.create(fd as any);
      setModalOpen(false); load();
    } catch (e) { alert("Erro ao salvar: " + (e as Error).message); }
    finally { setSaving(false); }
  }

  async function handleDelete(item: Hospedagem) {
    if (!confirm("Excluir este item?")) return;
    await hospedagemApi.remove(item.id); load();
  }

  const columns: Column<Hospedagem>[] = [
    { key: "id", label: "ID" },
    { key: "nome", label: "Nome" },
    { key: "telefone", label: "Telefone" },
    { key: "cnpj", label: "CNPJ" },
    { key: "logoUrl", label: "Logo", render: (v) => <MediaPreview url={v as string} label="Logo" /> },
    { key: "documentoPdfUrl", label: "PDF", render: (v) => <MediaPreview url={v as string} label="Documento" isPdf /> },
    {
      key: "actions", label: "",
      render: (_: unknown, row: Hospedagem) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(row)} className="rounded p-1 hover:bg-muted"><Pencil className="h-4 w-4" /></button>
          <button onClick={() => handleDelete(row)} className="rounded p-1 hover:bg-muted text-destructive"><Trash2 className="h-4 w-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Hospedagem</h1>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Nova Hospedagem
        </button>
      </div>

      <AdminTable<Hospedagem> columns={columns} data={items} loading={loading} />

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit} saving={saving}
        title={editing ? "Editar Hospedagem" : "Nova Hospedagem"}>
        <AdminFormField label="Nome *" value={form.nome}
          onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
        <AdminFormField label="Telefone *" value={form.telefone}
          onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))} />
        <AdminFormField label="Instagram" value={form.instagram}
          onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))} />
        <AdminFormField label="Endereço *" value={form.endereco}
          onChange={e => setForm(f => ({ ...f, endereco: e.target.value }))} />
        <AdminFormField label="Texto Diferencial *" multiline value={form.textoDiferencial}
          onChange={e => setForm(f => ({ ...f, textoDiferencial: e.target.value }))} />
        <AdminFormField label="CNPJ *" value={form.cnpj}
          onChange={e => setForm(f => ({ ...f, cnpj: e.target.value }))} />
        <AdminFormField label="Responsável Nome *" value={form.responsavelNome}
          onChange={e => setForm(f => ({ ...f, responsavelNome: e.target.value }))} />
        <AdminFormField label="Responsável CPF *" value={form.responsavelCpf}
          onChange={e => setForm(f => ({ ...f, responsavelCpf: e.target.value }))} />
        <div className="grid grid-cols-2 gap-4">
          <FileUploadField label="Logo" accept="image"
            currentUrl={(editing as any)?.logo ?? ""}
            onFileChange={(_, file) => setLogoFile(file)}
            onClear={() => setLogoFile(null)} />
          <FileUploadField label="Documento PDF" accept="pdf"
            currentUrl={(editing as any)?.documentoPdf ?? ""}
            onFileChange={(_, file) => setPdfFile(file)}
            onClear={() => setPdfFile(null)} />
        </div>
      </AdminModal>
    </div>
  );
}
