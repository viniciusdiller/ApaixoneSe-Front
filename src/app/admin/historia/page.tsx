"use client";

import { confirmAction } from "@/lib/feedback";

import { useEffect, useState } from "react";
import { culturaApi } from "@/lib/api";
import type { LocalCultural } from "@/lib/api";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminFormField } from "@/components/admin/AdminFormField";
import { FileUploadField } from "@/components/admin/FileUploadField";
import { MediaPreview } from "@/components/admin/MediaPreview";
import { LoadingGrid } from "@/components/ui/LoadingGrid";
import { Plus, Eye, Pencil } from "lucide-react";

const empty = {
  nome: "",
  descricao: "",
  texto: "",
  imagemUrl: "",
  endereco: "",
};

export default function AdminHistoriaPage() {
  const [items, setItems] = useState<LocalCultural[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{
    open: boolean;
    editing: LocalCultural | null;
  }>({ open: false, editing: null });
  const [viewing, setViewing] = useState<LocalCultural | null>(null);
  const [form, setForm] = useState(empty);
  const [files, setFiles] = useState<{ imagem?: File }>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    culturaApi
      .getAll()
      .then(setItems)
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => {
    setForm(empty);
    setFiles({});
    setError("");
    setModal({ open: true, editing: null });
  };
  const openEdit = (item: LocalCultural) => {
    setForm({
      nome: item.nome,
      descricao: item.descricao,
      texto: item.texto,
      imagemUrl: item.imagemUrl ?? "",
      endereco: item.endereco ?? "",
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
      formData.append("descricao", form.descricao);
      formData.append("texto", form.texto);
      if (form.endereco) formData.append("endereco", form.endereco);
      if (files.imagem) formData.append("imagem", files.imagem);

      modal.editing
        ? await culturaApi.update(modal.editing.id, formData)
        : await culturaApi.create(formData);
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

  const handleDelete = async (item: LocalCultural) => {
    if (!(await confirmAction(`Excluir "${item.nome}"?`))) return;
    await culturaApi.remove(item.id);
    load();
  };

  const set =
    (k: keyof typeof empty) =>
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

  const setField = (k: keyof typeof empty, value: string) =>
    setForm((prev) => ({ ...prev, [k]: value }));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-widest">
            Cultura
          </h1>
          <p className="text-sm text-muted-foreground">
            {items.length} registros
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Novo Local Cultural
        </button>
      </div>

      {loading ? (
        <LoadingGrid count={3} />
      ) : (
        <AdminTable
          data={items}
          columns={[
            {
              key: "imagemUrl",
              label: "Imagem",
              render: (_val, row) => (
                <MediaPreview url={row.imagemUrl ?? ""} label={row.nome} />
              ),
            },
            { key: "nome", label: "Nome" },
            {
              key: "descricao",
              label: "Descrição",
              render: (_val, row) => (
                <span className="line-clamp-2 max-w-sm text-sm">
                  {row.descricao}
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
        title="Detalhes do Local Cultural"
        open={!!viewing}
        onClose={() => setViewing(null)}
      >
        {viewing && (
          <div className="space-y-3">
            <MediaPreview url={viewing.imagemUrl ?? ""} label={viewing.nome} />
            <div>
              <p className="font-display font-bold text-lg uppercase tracking-wide">
                {viewing.nome}
              </p>
            </div>
            <ViewRow label="Descrição" value={viewing.descricao} />
            <ViewRow label="Texto" value={viewing.texto} />
            <ViewRow label="Endereço" value={viewing.endereco} />
          </div>
        )}
      </AdminModal>

      {/* Modal Criar/Editar */}
      <AdminModal
        title={modal.editing ? "Editar Local Cultural" : "Novo Local Cultural"}
        open={modal.open}
        onClose={closeModal}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <AdminFormField
            label="Nome"
            value={form.nome}
            onChange={set("nome")}
            maxLength={60}
            required
          />
          <AdminFormField
            label="Descrição (curta, exibida no card)"
            value={form.descricao}
            onChange={set("descricao")}
            maxLength={280}
            multiline
            required
          />
          <AdminFormField
            label="Texto completo (exibido nos detalhes)"
            value={form.texto}
            onChange={set("texto")}
            maxLength={5000}
            multiline
            required
          />
          <AdminFormField
            label="Endereço"
            value={form.endereco}
            onChange={set("endereco")}
            maxLength={191}
            placeholder="Rua Principal, 123 - Centro, Saquarema - RJ"
          />
          <FileUploadField
            label="Imagem"
            accept="image"
            currentUrl={form.imagemUrl ?? ""}
            hint="PNG, JPG ou WEBP"
            onFileChange={(url, file) => {
              setField("imagemUrl", url);
              setFiles((prev) => ({ ...prev, imagem: file }));
            }}
            onClear={() => {
              setField("imagemUrl", "");
              setFiles((prev) => ({ ...prev, imagem: undefined }));
            }}
          />

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
