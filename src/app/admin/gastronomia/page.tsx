"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { gastronomiaApi, type Gastronomia } from "@/lib/api";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminFormField } from "@/components/admin/AdminFormField";
import { FileUploadField } from "@/components/admin/FileUploadField";
import { MediaPreview } from "@/components/admin/MediaPreview";
import { buildFormData } from "@/lib/buildFormData";

export default function GastronomiaAdminPage() {
  const [items, setItems] = useState<Gastronomia[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Gastronomia | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    nome: "", telefone: "", instagram: "", endereco: "",
    especialidade: "", cnpj: "", responsavelNome: "", responsavelCpf: "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  async function load() {
    setLoading(true);
    try { setItems(await gastronomiaApi.getAll()); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null);
    setForm({ nome: "", telefone: "", instagram: "", endereco: "", especialidade: "", cnpj: "", responsavelNome: "", responsavelCpf: "" });
    setLogoFile(null); setPdfFile(null);
    setModalOpen(true);
  }

  function openEdit(item: Gastronomia) {
    setEditing(item);
    setForm({
      nome: item.nome ?? "", telefone: item.telefone ?? "", instagram: item.instagram ?? "",
      endereco: item.endereco ?? "", especialidade: (item as any).especialidade ?? "",
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
        especialidade: form.especialidade || undefined, cnpj: form.cnpj,
        responsavelNome: form.responsavelNome, responsavelCpf: form.responsavelCpf,
        ...(logoFile ? { logo: logoFile } : {}),
        ...(pdfFile ? { documentoPdf: pdfFile } : {}),
      });
      if (editing) await gastronomiaApi.update(editing.id, fd as any);
      else await gastronomiaApi.create(fd as any);
      setModalOpen(false); load();
    } catch (e) { alert("Erro ao salvar: " + (e as Error).message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: number) {
    if (!confirm("Excluir este item?")) return;
    await gastronomiaApi.delete(id); load();
  }

  const columns = [
    { key: "id", label: "ID" },
    { key: "nome", label: "Nome" },
    { key: "telefone", label: "Telefone" },
    { key: "cnpj", label: "CNPJ" },
    { key: "logo", label: "Logo", render: (v: string) => <MediaPreview url={v} label="Logo" /> },
    { key: "documentoPdf", label: "PDF", render: (v: string) => <MediaPreview url={v} label="Documento" isPdf /> },
    {
      key: "actions", label: "",
      render: (_: unknown, row: Gastronomia) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(row)} className="rounded p-1 hover:bg-muted"><Pencil className="h-4 w-4" /></button>
          <button onClick={() => handleDelete(row.id)} className="rounded p-1 hover:bg-muted text-destructive"><Trash2 className="h-4 w-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Gastronomia</h1>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Novo Item
        </button>
      </div>

      <AdminTable columns={columns} data={items} loading={loading} />

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit} saving={saving}
        title={editing ? "Editar Gastronomia" : "Nova Gastronomia"}>
        <AdminFormField label="Nome *" value={form.nome}
          onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
        <AdminFormField label="Telefone *" value={form.telefone}
          onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))} />
        <AdminFormField label="Instagram" value={form.instagram}
          onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))} />
        <AdminFormField label="Endereço *" value={form.endereco}
          onChange={e => setForm(f => ({ ...f, endereco: e.target.value }))} />
        <AdminFormField label="Especialidade" value={form.especialidade}
          onChange={e => setForm(f => ({ ...f, especialidade: e.target.value }))} />
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
