"use client";

import { useEffect, useState } from "react";
import { casaDeCambioApi, usersApi } from "@/lib/api";
import type { CasaDeCambio, CreateCasaDeCambioDto, User } from "@/lib/api";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminFormField } from "@/components/admin/AdminFormField";
import { FileUploadField } from "@/components/admin/FileUploadField";
import { MediaPreview } from "@/components/admin/MediaPreview";
import { LoadingGrid } from "@/components/ui/LoadingGrid";
import { Plus, Eye, Pencil } from "lucide-react";

const empty: CreateCasaDeCambioDto & { site?: string } = {
  nome: "",
  telefone: "",
  endereco: "",
  descricao: "",
  cnpj: "",
  moedas: "",
  instagram: "",
  site: "",
  logoUrl: "",
  fotoUrl: "",
  usuarioId: "",
};

const statusClass = (s: string) =>
  s === "APROVADO"
    ? "bg-green-100 text-green-700"
    : s === "REJEITADO"
      ? "bg-red-100 text-red-700"
      : "bg-yellow-100 text-yellow-700";

export default function AdminCasaDeCambioPage() {
  const [items, setItems] = useState<CasaDeCambio[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing: CasaDeCambio | null }>({
    open: false,
    editing: null,
  });
  const [viewing, setViewing] = useState<CasaDeCambio | null>(null);
  const [form, setForm] = useState<typeof empty>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [files, setFiles] = useState<{ logo?: File; foto?: File }>({});

  const load = () => {
    setLoading(true);
    Promise.all([casaDeCambioApi.getAll(), usersApi.getAll()])
      .then(([c, u]) => {
        setItems(c);
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

  const openEdit = (item: CasaDeCambio) => {
    setForm({
      nome: item.nome,
      telefone: item.telefone,
      endereco: item.endereco,
      descricao: item.descricao ?? "",
      cnpj: item.cnpj ?? "",
      moedas: item.moedas ?? "",
      instagram: item.instagram ?? "",
      site: item.site ?? "",
      logoUrl: item.logoUrl ?? "",
      fotoUrl: item.fotoUrl ?? "",
      usuarioId: item.usuarioId,
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
      const fd = new FormData();
      fd.append("nome", form.nome);
      fd.append("telefone", form.telefone);
      fd.append("endereco", form.endereco);
      fd.append("descricao", form.descricao || "");
      fd.append("cnpj", form.cnpj || "");
      fd.append("moedas", form.moedas || "");
      fd.append("instagram", form.instagram || "");
      if (form.site) fd.append("site", form.site);
      if (form.usuarioId) fd.append("usuarioId", form.usuarioId);
      if (files.logo) fd.append("logo", files.logo);
      if (files.foto) fd.append("foto", files.foto);

      modal.editing
        ? await casaDeCambioApi.update(modal.editing.id, fd)
        : await casaDeCambioApi.create(fd);

      closeModal();
      load();
    } catch (err: unknown) {
      let msg = "Erro ao salvar.";
      if (err instanceof Error) {
        try {
          const p = JSON.parse(err.message);
          msg = Array.isArray(p.message) ? p.message.join(", ") : p.message;
        } catch {
          msg = err.message;
        }
      }
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: CasaDeCambio) => {
    if (!confirm(`Excluir "${item.nome}"?`)) return;
    await casaDeCambioApi.delete(item.id);
    load();
  };

  const set =
    (k: keyof typeof empty) =>
    (
      e:
        | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
        | string,
    ) => {
      const value = typeof e === "string" ? e : e.target.value;
      setForm((prev) => ({ ...prev, [k]: value }));
    };

  const setField = (k: keyof typeof empty, value: string) =>
    setForm((prev) => ({ ...prev, [k]: value }));

  const ownerName = (id: string) => {
    const u = users.find((u) => u.id === id);
    return u ? `${u.nome} (@${u.usuario})` : id;
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-widest">
            Casas de Câmbio
          </h1>
          <p className="text-sm text-muted-foreground">{items.length} registros</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Nova Casa de Câmbio
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
              render: (_val, row) => <MediaPreview url={row.logoUrl ?? ""} label="Logo" />,
            },
            { key: "nome", label: "Nome" },
            { key: "telefone", label: "Telefone" },
            {
              key: "moedas",
              label: "Moedas",
              render: (_val, row) => (
                <span className="text-xs text-muted-foreground">{row.moedas ?? "—"}</span>
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

      {/* ── Modal Visualização ── */}
      <AdminModal
        title="Detalhes da Casa de Câmbio"
        open={!!viewing}
        onClose={() => setViewing(null)}
      >
        {viewing && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {viewing.logoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={viewing.logoUrl}
                  alt={viewing.nome}
                  className="h-14 w-14 rounded-lg object-cover border border-border"
                />
              )}
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

            <dl className="grid grid-cols-2 gap-3 text-sm">
              <ViewRow label="Telefone" value={viewing.telefone} />
              <ViewRow label="CNPJ" value={viewing.cnpj} />
              <ViewRow label="Instagram" value={viewing.instagram} />
              <ViewRow label="Site" value={viewing.site} />
              <ViewRow label="Moedas aceitas" value={viewing.moedas} />
            </dl>
            <ViewRow label="Endereço" value={viewing.endereco} />
            <ViewRow label="Descrição" value={viewing.descricao} />
            <ViewRow label="Usuário Responsável" value={ownerName(viewing.usuarioId)} />

            {viewing.fotoUrl && (
              <div className="flex flex-col gap-0.5">
                <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Foto do Estabelecimento
                </dt>
                <MediaPreview url={viewing.fotoUrl} label="Foto" />
              </div>
            )}
          </div>
        )}
      </AdminModal>

      {/* ── Modal Criar/Editar ── */}
      <AdminModal
        title={modal.editing ? "Editar Casa de Câmbio" : "Nova Casa de Câmbio"}
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
          <div className="grid grid-cols-2 gap-3">
            <AdminFormField
              label="Instagram"
              value={form.instagram ?? ""}
              onChange={set("instagram")}
            />
            <AdminFormField
              label="Site"
              value={form.site ?? ""}
              onChange={set("site")}
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
              value={form.cnpj ?? ""}
              onChange={set("cnpj")}
            />
            <AdminFormField
              label="Moedas aceitas"
              value={form.moedas ?? ""}
              onChange={set("moedas")}
              placeholder="ex: USD, EUR, GBP"
            />
          </div>
          <AdminFormField
            label="Descrição"
            value={form.descricao ?? ""}
            onChange={set("descricao")}
            multiline
          />

          <div className="grid grid-cols-2 gap-3">
            <FileUploadField
              label="Logo"
              accept="image"
              currentUrl={form.logoUrl ?? ""}
              hint="PNG, JPG ou WEBP"
              onFileChange={(url, file) => {
                setField("logoUrl", url);
                setFiles((p) => ({ ...p, logo: file }));
              }}
              onClear={() => setField("logoUrl", "")}
            />
            <FileUploadField
              label="Foto do Estabelecimento"
              accept="image"
              currentUrl={form.fotoUrl ?? ""}
              hint="PNG, JPG ou WEBP"
              onFileChange={(url, file) => {
                setField("fotoUrl", url);
                setFiles((p) => ({ ...p, foto: file }));
              }}
              onClear={() => setField("fotoUrl", "")}
            />
          </div>

          {/* Usuário Responsável */}
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Usuário Responsável *
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
