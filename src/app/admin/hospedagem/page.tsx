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
import { Plus, Eye, Pencil } from "lucide-react";

const empty: CreateHospedagemDto = {
  nome: "",
  telefone: "",
  endereco: "",
  textoDiferencial: "",
  cnpj: "",
  responsavelNome: "",
  responsavelCpf: "",
  documentoPdfUrl: "",
  logoUrl: "",
  usuarioId: "",
  instagram: "",
};

export default function AdminHospedagemPage() {
  const [items, setItems] = useState<Hospedagem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{
    open: boolean;
    editing: Hospedagem | null;
  }>({ open: false, editing: null });
  const [viewing, setViewing] = useState<Hospedagem | null>(null);
  const [form, setForm] = useState<CreateHospedagemDto>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [files, setFiles] = useState<{ logo?: File; documentoPdf?: File }>({});

  const load = () => {
    setLoading(true);
    Promise.all([hospedagemApi.getAll(), usersApi.getAll()])
      .then(([h, u]) => {
        setItems(h);
        setUsers(u);
      })
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => {
    setForm(empty);
    setFiles({});
    setError("");
    setModal({ open: true, editing: null });
  };
  const openEdit = (item: Hospedagem) => {
    setForm({
      nome: item.nome,
      telefone: item.telefone,
      endereco: item.endereco,
      textoDiferencial: item.textoDiferencial,
      cnpj: item.cnpj,
      responsavelNome: item.responsavelNome,
      responsavelCpf: item.responsavelCpf,
      documentoPdfUrl: item.documentoPdfUrl,
      logoUrl: item.logoUrl,
      usuarioId: item.usuarioId,
      instagram: item.instagram ?? "",
    });
    setFiles({});
    setError("");
    setModal({ open: true, editing: item });
  };
  const closeModal = () => setModal({ open: false, editing: null });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const formData = new FormData();

      formData.append("nome", form.nome);
      formData.append("telefone", form.telefone);
      formData.append("endereco", form.endereco);
      formData.append("textoDiferencial", form.textoDiferencial);
      formData.append("cnpj", form.cnpj);
      formData.append("responsavelNome", form.responsavelNome);
      formData.append("responsavelCpf", form.responsavelCpf);

      if (form.instagram) formData.append("instagram", form.instagram);

      if (files.logo) formData.append("logo", files.logo);
      if (files.documentoPdf)
        formData.append("documentoPdf", files.documentoPdf);
      modal.editing
        ? await hospedagemApi.update(modal.editing.id, formData)
        : await hospedagemApi.create(formData);
      closeModal();
      load();
    } catch (err: unknown) {
      try {
        const p = JSON.parse((err as Error).message);
        setError(Array.isArray(p.message) ? p.message.join(" ") : p.message);
      } catch {
        setError("Erro ao salvar.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: Hospedagem) => {
    if (!confirm(`Excluir "${item.nome}"?`)) return;
    await hospedagemApi.remove(item.id);
    load();
  };

  const set =
    (k: keyof CreateHospedagemDto) =>
    (
      e:
        | React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
          >
        | string,
    ) => {
      const value = typeof e === "string" ? e : e.target.value;
      setForm((prev) => ({ ...prev, [k]: value }));
    };

  const setField = (k: keyof CreateHospedagemDto, value: string) =>
    setForm((prev) => ({ ...prev, [k]: value }));

  const ownerName = (id: string) => {
    const u = users.find((u) => u.id === id);
    return u ? `${u.nome} (@${u.usuario})` : id;
  };

  const statusClass = (s: string) =>
    s === "APROVADO"
      ? "bg-green-100 text-green-700"
      : s === "REJEITADO"
        ? "bg-red-100 text-red-700"
        : "bg-yellow-100 text-yellow-700";

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-widest">
            Hospedagem
          </h1>
          <p className="text-sm text-muted-foreground">
            {items.length} registros
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Nova Hospedagem
        </button>
      </div>

      {loading ? (
        <LoadingGrid count={3} />
      ) : (
        <AdminTable
          data={items}
          columns={[
            {
              key: "logoUrl",
              label: "Logo",
              render: (_val, row) => (
                <MediaPreview url={row.logoUrl} label="Logo" />
              ),
            },
            { key: "nome", label: "Nome" },
            { key: "endereco", label: "Endereço" },
            {
              key: "documentoPdfUrl",
              label: "PDF",
              render: (_val, row) => (
                <MediaPreview
                  url={row.documentoPdfUrl}
                  label="Documento"
                  isPdf
                />
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (_val, row) => (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusClass(row.status)}`}
                >
                  {row.status}
                </span>
              ),
            },
          ]}
          extraActions={(row) => (
            <>
              <button
                onClick={() => setViewing(row)}
                title="Ver detalhes"
                className="rounded p-1 text-muted-foreground transition hover:bg-surface-offset hover:text-primary"
              >
                <Eye size={16} />
              </button>
              <button
                onClick={() => openEdit(row)}
                title="Editar"
                className="rounded p-1 text-muted-foreground transition hover:bg-surface-offset hover:text-primary"
              >
                <Pencil size={16} />
              </button>
            </>
          )}
          onDelete={handleDelete}
        />
      )}

      {/* Modal Visualização */}
      <AdminModal
        title="Detalhes da Hospedagem"
        open={!!viewing}
        onClose={() => setViewing(null)}
      >
        {viewing && (
          <div className="space-y-4">
            {viewing.logoUrl && (
              <div className="flex items-center gap-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={viewing.logoUrl}
                  alt={viewing.nome}
                  className="h-16 w-16 rounded-lg object-cover border border-border"
                />
                <div>
                  <p className="font-display font-bold text-lg uppercase tracking-wide">
                    {viewing.nome}
                  </p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusClass(viewing.status)}`}
                  >
                    {viewing.status}
                  </span>
                </div>
              </div>
            )}
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <ViewRow label="Telefone" value={viewing.telefone} />
              <ViewRow label="CNPJ" value={viewing.cnpj} />
              <ViewRow label="Instagram" value={viewing.instagram} />
              <ViewRow label="Responsável" value={viewing.responsavelNome} />
              <ViewRow label="CPF Responsável" value={viewing.responsavelCpf} />
            </dl>
            <ViewRow label="Endereço" value={viewing.endereco} />
            <ViewRow
              label="Texto Diferencial"
              value={viewing.textoDiferencial}
            />
            <ViewRow
              label="Usuário Dono"
              value={ownerName(viewing.usuarioId)}
            />
            {viewing.documentoPdfUrl && (
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Documento
                </dt>
                <MediaPreview
                  url={viewing.documentoPdfUrl}
                  label="Documento"
                  isPdf
                />
              </div>
            )}
          </div>
        )}
      </AdminModal>

      {/* Modal Criar/Editar */}
      <AdminModal
        title={modal.editing ? "Editar Hospedagem" : "Nova Hospedagem"}
        open={modal.open}
        onClose={closeModal}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <AdminFormField
              label="Nome"
              value={form.nome}
              onChange={set("nome")}
              required
            />
            <AdminFormField
              label="Telefone"
              value={form.telefone}
              onChange={set("telefone")}
              required
            />
          </div>
          <AdminFormField
            label="Endereço"
            value={form.endereco}
            onChange={set("endereco")}
            required
          />
          <AdminFormField
            label="Texto Diferencial"
            value={form.textoDiferencial}
            onChange={set("textoDiferencial")}
            multiline
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <AdminFormField
              label="CNPJ"
              value={form.cnpj}
              onChange={set("cnpj")}
              required
            />
            <AdminFormField
              label="Instagram"
              value={form.instagram ?? ""}
              onChange={set("instagram")}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <AdminFormField
              label="Responsável (Nome)"
              value={form.responsavelNome}
              onChange={set("responsavelNome")}
              required
            />
            <AdminFormField
              label="Responsável (CPF)"
              value={form.responsavelCpf}
              onChange={set("responsavelCpf")}
              required
            />
          </div>

          <FileUploadField
            label="Logo do Estabelecimento"
            accept="image"
            currentUrl={form.logoUrl}
            required
            hint="PNG, JPG ou WEBP"
            onFileChange={(url, file) => {
              setField("logoUrl", url);
              setFiles((prev) => ({ ...prev, logo: file }));
            }}
            onClear={() => {
              setField("logoUrl", "");
              setFiles((prev) => ({ ...prev, logo: undefined }));
            }}
          />

          <FileUploadField
            label="Documento (PDF)"
            accept="pdf"
            currentUrl={form.documentoPdfUrl}
            required
            hint="Apenas arquivos .pdf"
            onFileChange={(url, file) => {
              setField("documentoPdfUrl", url);
              setFiles((prev) => ({ ...prev, documentoPdf: file }));
            }}
            onClear={() => {
              setField("documentoPdfUrl", "");
              setFiles((prev) => ({ ...prev, documentoPdf: undefined }));
            }}
          />

          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Usuário Dono *
            </label>
            <select
              value={form.usuarioId}
              onChange={set("usuarioId")}
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Selecione um usuário</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome} (@{u.usuario})
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500 dark:bg-red-950/30">
              {error}
            </p>
          )}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              {saving ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}

function ViewRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd className="text-sm text-foreground whitespace-pre-wrap">{value}</dd>
    </div>
  );
}
