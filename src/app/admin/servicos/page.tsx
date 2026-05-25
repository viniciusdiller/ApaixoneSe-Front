"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { servicoTuristaApi, type ServicoTurista } from "@/lib/api";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminFormField } from "@/components/admin/AdminFormField";
import { FileUploadField } from "@/components/admin/FileUploadField";
import { MediaPreview } from "@/components/admin/MediaPreview";
import { buildFormData } from "@/lib/buildFormData";

const TIPOS = ["AGENCIA_TURISMO", "GUIA_TURISMO", "ESPORTE_LAZER", "LOCADORA"];
const ROTEIROS = ["A_PE", "ESPORTE_E_AVENTURA", "DE_PRAIAS", "CULTURAL", "RELIGIOSO", "RURAL", "ECOLOGICO"];

const labelSelect = "text-xs font-semibold uppercase tracking-wider text-muted-foreground";
const inputSelect = "w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40";

export default function ServicosAdminPage() {
  const [items, setItems] = useState<ServicoTurista[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ServicoTurista | null>(null);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    tipo: "AGENCIA_TURISMO",
    nome: "", telefone: "", instagram: "", endereco: "",
    descricao: "", cnpj: "", roteiro: "", idiomas: "",
  });
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [fotoFile, setFotoFile] = useState<File | null>(null);

  async function load() {
    setLoading(true);
    try { setItems(await servicoTuristaApi.getAll()); } finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditing(null);
    setForm({ tipo: "AGENCIA_TURISMO", nome: "", telefone: "", instagram: "", endereco: "", descricao: "", cnpj: "", roteiro: "", idiomas: "" });
    setLogoFile(null); setFotoFile(null);
    setModalOpen(true);
  }

  function openEdit(item: ServicoTurista) {
    setEditing(item);
    setForm({
      tipo: item.tipo ?? "AGENCIA_TURISMO",
      nome: item.nome ?? "", telefone: item.telefone ?? "",
      instagram: item.instagram ?? "", endereco: item.endereco ?? "",
      descricao: (item as any).descricao ?? "", cnpj: (item as any).cnpj ?? "",
      roteiro: (item as any).roteiro ?? "", idiomas: (item as any).idiomas ?? "",
    });
    setLogoFile(null); setFotoFile(null);
    setModalOpen(true);
  }

  async function handleSubmit() {
    setSaving(true);
    try {
      const fd = buildFormData({
        tipo: form.tipo, nome: form.nome, telefone: form.telefone,
        instagram: form.instagram || undefined, endereco: form.endereco || undefined,
        descricao: form.descricao || undefined, cnpj: form.cnpj || undefined,
        roteiro: form.roteiro || undefined, idiomas: form.idiomas || undefined,
        ...(logoFile ? { logo: logoFile } : {}),
        ...(fotoFile ? { foto: fotoFile } : {}),
      });
      if (editing) await servicoTuristaApi.update(editing.id, fd as any);
      else await servicoTuristaApi.create(fd as any);
      setModalOpen(false); load();
    } catch (e) { alert("Erro ao salvar: " + (e as Error).message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: number) {
    if (!confirm("Excluir este serviço?")) return;
    await servicoTuristaApi.delete(id); load();
  }

  const columns = [
    { key: "id", label: "ID" },
    { key: "tipo", label: "Tipo" },
    { key: "nome", label: "Nome" },
    { key: "telefone", label: "Telefone" },
    { key: "logo", label: "Logo", render: (v: string) => <MediaPreview url={v} label="Logo" /> },
    { key: "foto", label: "Foto", render: (v: string) => <MediaPreview url={v} label="Foto" /> },
    {
      key: "actions", label: "",
      render: (_: unknown, row: ServicoTurista) => (
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
        <h1 className="text-xl font-bold">Serviços Turísticos</h1>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          <Plus className="h-4 w-4" /> Novo Serviço
        </button>
      </div>

      <AdminTable columns={columns} data={items} loading={loading} />

      <AdminModal open={modalOpen} onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit} saving={saving}
        title={editing ? "Editar Serviço" : "Novo Serviço"}>

        {/* Tipo — apenas o select, sem AdminFormField duplicado */}
        <div className="flex flex-col gap-1">
          <label className={labelSelect}>Tipo *</label>
          <select
            value={form.tipo}
            onChange={e => setForm(f => ({ ...f, tipo: e.target.value }))}
            className={inputSelect}
          >
            {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <AdminFormField label="Nome *" value={form.nome}
          onChange={e => setForm(f => ({ ...f, nome: e.target.value }))} />
        <AdminFormField label="Telefone *" value={form.telefone}
          onChange={e => setForm(f => ({ ...f, telefone: e.target.value }))} />
        <AdminFormField label="Instagram" value={form.instagram}
          onChange={e => setForm(f => ({ ...f, instagram: e.target.value }))} />
        <AdminFormField label="Endereço" value={form.endereco}
          onChange={e => setForm(f => ({ ...f, endereco: e.target.value }))} />

        {(form.tipo === "AGENCIA_TURISMO" || form.tipo === "ESPORTE_LAZER") && (
          <AdminFormField label="Descrição *" multiline value={form.descricao}
            onChange={e => setForm(f => ({ ...f, descricao: e.target.value }))} />
        )}

        {form.tipo === "GUIA_TURISMO" && (
          <>
            <AdminFormField label="CNPJ *" value={form.cnpj}
              onChange={e => setForm(f => ({ ...f, cnpj: e.target.value }))} />
            <div className="flex flex-col gap-1">
              <label className={labelSelect}>Roteiro *</label>
              <select
                value={form.roteiro}
                onChange={e => setForm(f => ({ ...f, roteiro: e.target.value }))}
                className={inputSelect}
              >
                <option value="">Selecione...</option>
                {ROTEIROS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <AdminFormField label="Idiomas *" placeholder="Ex: Português, Inglês"
              value={form.idiomas} onChange={e => setForm(f => ({ ...f, idiomas: e.target.value }))} />
          </>
        )}

        <div className="grid grid-cols-2 gap-4">
          <FileUploadField label="Logo" accept="image"
            currentUrl={(editing as any)?.logo ?? ""}
            onFileChange={(_, file) => setLogoFile(file)}
            onClear={() => setLogoFile(null)} />
          <FileUploadField label="Foto" accept="image"
            currentUrl={(editing as any)?.foto ?? ""}
            onFileChange={(_, file) => setFotoFile(file)}
            onClear={() => setFotoFile(null)} />
        </div>
      </AdminModal>
    </div>
  );
}
