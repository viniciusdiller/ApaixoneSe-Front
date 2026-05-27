"use client";

import { useEffect, useState } from "react";
import { catApi } from "@/lib/api";
import type { Cat, CreateCatDto } from "@/lib/api";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminFormField } from "@/components/admin/AdminFormField";
import { FileUploadField } from "@/components/admin/FileUploadField";
import { MediaPreview } from "@/components/admin/MediaPreview";
import { LoadingGrid } from "@/components/ui/LoadingGrid";
import { Plus, Eye, Pencil, Files } from "lucide-react";

const empty: CreateCatDto = { texto: "", arquivoUrl: "" };

export default function AdminCategoriasPage() {
  const [items, setItems] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing: Cat | null }>({
    open: false,
    editing: null,
  });
  const [viewing, setViewing] = useState<Cat | null>(null);
  const [form, setForm] = useState<CreateCatDto>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const load = () => {
    setLoading(true);
    catApi
      .getAll()
      .then(setItems)
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const openCreate = () => {
    setForm(empty);
    setFile(null);
    setError("");
    setModal({ open: true, editing: null });
  };
  const openEdit = (item: Cat) => {
    setForm({ texto: item.texto, arquivoUrl: item.arquivoUrl });
    setFile(null);
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
      formData.append("texto", form.texto);

      if (file) {
        formData.append("arquivo", file);
      }

      modal.editing
        ? await catApi.update(modal.editing.id, formData)
        : await catApi.create(formData);

      closeModal();
      load();
    } catch (err: unknown) {
      console.error("Erro detalhado:", err);
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

  const handleDelete = async (item: Cat) => {
    if (!confirm(`Excluir este registro CAT?`)) return;
    await catApi.remove(item.id);
    load();
  };

  const setField = (k: keyof CreateCatDto, value: string) =>
    setForm((prev) => ({ ...prev, [k]: value }));

  const set =
    (k: keyof CreateCatDto) =>
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

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-widest">
            CAT
          </h1>
          <p className="text-sm text-muted-foreground">
            Central de Atendimento ao Turista — {items.length} registros
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Novo Registro
        </button>
      </div>

      {loading ? (
        <LoadingGrid count={3} />
      ) : (
        <AdminTable
          data={items}
          columns={[
            {
              key: "texto",
              label: "Texto",
              render: (_val, row) => (
                <span className="line-clamp-2 max-w-sm text-sm">
                  {row.texto}
                </span>
              ),
            },
            {
              key: "arquivoUrl",
              label: "Arquivo",
              render: (_val, row) => (
                <MediaPreview
                  url={row.arquivoUrl}
                  label="Arquivo"
                  isPdf={row.arquivoUrl?.toLowerCase().endsWith(".pdf")}
                />
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
        title="Detalhes do Registro CAT"
        open={!!viewing}
        onClose={() => setViewing(null)}
      >
        {viewing && (
          <dl className="space-y-4 text-sm">
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Texto
              </dt>
              <dd className="text-sm text-foreground whitespace-pre-wrap">
                {viewing.texto}
              </dd>
            </div>
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Arquivo
              </dt>
              <dd>
                <MediaPreview
                  url={viewing.arquivoUrl}
                  label="Arquivo"
                  isPdf={viewing.arquivoUrl?.toLowerCase().endsWith(".pdf")}
                />
              </dd>
            </div>
          </dl>
        )}
      </AdminModal>

      {/* Modal Criar/Editar */}
      <AdminModal
        title={modal.editing ? "Editar CAT" : "Novo Registro CAT"}
        open={modal.open}
        onClose={closeModal}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <AdminFormField
            label="Texto descritivo"
            value={form.texto}
            onChange={set("texto")}
            multiline
            required
          />
          <FileUploadField
            label="Arquivo (PDF ou Imagem)"
            accept="any"
            currentUrl={form.arquivoUrl}
            required={!modal.editing}
            hint="PDF, PNG, JPG ou WEBP"
            onFileChange={(url, selectedFile) => {
              setField("arquivoUrl", url);
              setFile(selectedFile);
            }}
            onClear={() => {
              setField("arquivoUrl", "");
              setFile(null);
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
