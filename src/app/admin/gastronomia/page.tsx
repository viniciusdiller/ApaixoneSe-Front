"use client";

import { useEffect, useState } from "react";
import { gastronomiaApi, usersApi } from "@/lib/api";
import type { Gastronomia, CreateGastronomiaDto, User } from "@/lib/api";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminFormField } from "@/components/admin/AdminFormField";
import { FileUploadField } from "@/components/admin/FileUploadField";
import { MediaPreview } from "@/components/admin/MediaPreview";
import { LoadingGrid } from "@/components/ui/LoadingGrid";
import { Plus, Eye } from "lucide-react";

const empty: CreateGastronomiaDto = {
  nome: "",
  telefone: "",
  endereco: "",
  cnpj: "",
  responsavelNome: "",
  responsavelCpf: "",
  documentoPdfUrl: "",
  logoUrl: "",
  usuarioId: "",
  instagram: "",
  especialidade: "",
};

export default function AdminGastronomiaPage() {
  const [items, setItems] = useState<Gastronomia[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{
    open: boolean;
    editing: Gastronomia | null;
  }>({ open: false, editing: null });
  const [viewing, setViewing] = useState<Gastronomia | null>(null);
  const [form, setForm] = useState<CreateGastronomiaDto>(empty);
  const [files, setFiles] = useState<{ logo?: File; documentoPdf?: File }>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([gastronomiaApi.getAll(), usersApi.getAll()])
      .then(([g, u]) => {
        setItems(g);
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
  const openEdit = (item: Gastronomia) => {
    setForm({
      nome: item.nome,
      telefone: item.telefone,
      endereco: item.endereco,
      cnpj: item.cnpj,
      responsavelNome: item.responsavelNome,
      responsavelCpf: item.responsavelCpf,
      documentoPdfUrl: item.documentoPdfUrl,
      logoUrl: item.logoUrl,
      usuarioId: item.usuarioId,
      instagram: item.instagram ?? "",
      especialidade: item.especialidade ?? "",
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
      formData.append("cnpj", form.cnpj);
      formData.append("responsavelNome", form.responsavelNome);
      formData.append("responsavelCpf", form.responsavelCpf);
      if (form.especialidade)
        formData.append("especialidade", form.especialidade);
      if (form.instagram) formData.append("instagram", form.instagram);

      if (files.logo) formData.append("logo", files.logo);
      if (files.documentoPdf)
        formData.append("documentoPdf", files.documentoPdf);

      modal.editing
        ? await gastronomiaApi.update(modal.editing.id, formData)
        : await gastronomiaApi.create(formData);

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

  const handleDelete = async (item: Gastronomia) => {
    if (!confirm(`Excluir "${item.nome}"?`)) return;
    await gastronomiaApi.remove(item.id);
    load();
  };

  const set =
    (k: keyof CreateGastronomiaDto) =>
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

  const setField = (k: keyof CreateGastronomiaDto, value: string) =>
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
            Gastronomia
          </h1>
          <p className="text-sm text-muted-foreground">
            {items.length} registros
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Novo Estabelecimento
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
              render: (r) => <MediaPreview url={r.logoUrl} label="Logo" />,
            },
            { key: "nome", label: "Nome" },
            { key: "endereco", label: "Endereço" },
            {
              key: "documentoPdfUrl",
              label: "PDF",
              render: (r) => (
                <MediaPreview url={r.documentoPdfUrl} label="Documento" isPdf />
              ),
            },
            {
              key: "status",
              label: "Status",
              render: (r) => (
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusClass(r.status)}`}
                >
                  {r.status}
                </span>
              ),
            },
          ]}
          extraActions={(row) => (
            <button
              onClick={() => setViewing(row)}
              title="Ver detalhes"
              className="rounded p-1 text-muted-foreground transition hover:bg-surface-offset hover:text-primary"
            >
              <Eye size={16} />
            </button>
          )}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Modal Visualização */}
      <AdminModal
        title="Detalhes do Estabelecimento"
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
              <ViewRow label="Especialidade" value={viewing.especialidade} />
              <ViewRow label="Instagram" value={viewing.instagram} />
              <ViewRow label="Responsável" value={viewing.responsavelNome} />
              <ViewRow label="CPF Responsável" value={viewing.responsavelCpf} />
            </dl>
            <ViewRow label="Endereço" value={viewing.endereco} />
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
        title={modal.editing ? "Editar Gastronomia" : "Novo Estabelecimento"}
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
          <div className="grid grid-cols-2 gap-3">
            <AdminFormField
              label="CNPJ"
              value={form.cnpj}
              onChange={set("cnpj")}
              required
            />
            <AdminFormField
              label="Especialidade"
              value={form.especialidade ?? ""}
              onChange={set("especialidade")}
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
          <AdminFormField
            label="Instagram"
            value={form.instagram ?? ""}
            onChange={set("instagram")}
          />

          <FileUploadField
            label="Logo do Estabelecimento"
            accept="image"
            currentUrl={form.logoUrl}
            required={!modal.editing}
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
            required={!modal.editing}
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
