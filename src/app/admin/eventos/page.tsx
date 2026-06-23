"use client";

import { useEffect, useState } from "react";
import { eventosApi } from "@/lib/api";
import type { Evento, CreateEventoDto } from "@/lib/api";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminFormField } from "@/components/admin/AdminFormField";
import { FileUploadField } from "@/components/admin/FileUploadField";
import { MediaPreview } from "@/components/admin/MediaPreview";
import { LoadingGrid } from "@/components/ui/LoadingGrid";
import { Plus, Eye, Pencil } from "lucide-react";

const empty: CreateEventoDto = {
  titulo: "",
  descricao: "",
  data: "",
  local: "",
  fotoUrl: "",
};

export default function AdminEventosPage() {
  const [items, setItems] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing: Evento | null }>(
    { open: false, editing: null },
  );
  const [viewing, setViewing] = useState<Evento | null>(null);
  const [form, setForm] = useState<CreateEventoDto>(empty);
  const [files, setFiles] = useState<{ foto?: File }>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    eventosApi
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
  const openEdit = (item: Evento) => {
    setForm({
      titulo: item.titulo,
      descricao: item.descricao,
      data: item.data?.slice(0, 16) ?? "",
      local: item.local,
      fotoUrl: item.fotoUrl ?? "",
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
      formData.append("titulo", form.titulo);
      formData.append("descricao", form.descricao);
      formData.append("data", form.data);
      formData.append("local", form.local);
      if (files.foto) formData.append("foto", files.foto);

      modal.editing
        ? await eventosApi.update(modal.editing.id, formData)
        : await eventosApi.create(formData);
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

  const handleDelete = async (item: Evento) => {
    if (!confirm(`Excluir "${item.titulo}"?`)) return;
    await eventosApi.remove(item.id);
    load();
  };

  const set =
    (k: keyof CreateEventoDto) =>
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

  const setField = (k: keyof CreateEventoDto, value: string) =>
    setForm((prev) => ({ ...prev, [k]: value }));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-widest">
            Eventos
          </h1>
          <p className="text-sm text-muted-foreground">
            {items.length} registros
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Novo Evento
        </button>
      </div>

      {loading ? (
        <LoadingGrid count={3} />
      ) : (
        <AdminTable
          data={items}
          columns={[
            {
              key: "fotoUrl",
              label: "Foto",
              render: (_val, row) => (
                <MediaPreview url={row.fotoUrl ?? ""} label={row.titulo} />
              ),
            },
            { key: "titulo", label: "Título" },
            { key: "local", label: "Local" },
            {
              key: "data",
              label: "Data",
              render: (_val, row) =>
                new Date(row.data).toLocaleDateString("pt-BR"),
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
        title="Detalhes do Evento"
        open={!!viewing}
        onClose={() => setViewing(null)}
      >
        {viewing && (
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Foto
              </dt>
              <dd className="pt-1">
                <MediaPreview url={viewing.fotoUrl ?? ""} label={viewing.titulo} />
              </dd>
            </div>
            <ViewRow label="Título" value={viewing.titulo} />
            <ViewRow label="Local" value={viewing.local} />
            <ViewRow
              label="Data"
              value={new Date(viewing.data).toLocaleString("pt-BR")}
            />
            <ViewRow label="Descrição" value={viewing.descricao} />
          </dl>
        )}
      </AdminModal>

      {/* Modal Criar/Editar */}
      <AdminModal
        title={modal.editing ? "Editar Evento" : "Novo Evento"}
        open={modal.open}
        onClose={closeModal}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <AdminFormField
            label="Título"
            value={form.titulo}
            onChange={set("titulo")}
            required
          />
          <AdminFormField
            label="Local"
            value={form.local}
            onChange={set("local")}
            required
          />
          <AdminFormField
            label="Data e Hora"
            value={form.data}
            onChange={set("data")}
            type="datetime-local"
            required
          />
          <AdminFormField
            label="Descrição"
            value={form.descricao}
            onChange={set("descricao")}
            multiline
            required
          />
          <FileUploadField
            label="Foto do Evento"
            accept="image"
            currentUrl={form.fotoUrl ?? ""}
            hint="PNG, JPG ou WEBP"
            onFileChange={(url, file) => {
              setField("fotoUrl", url);
              setFiles((prev) => ({ ...prev, foto: file }));
            }}
            onClear={() => {
              setField("fotoUrl", "");
              setFiles((prev) => ({ ...prev, foto: undefined }));
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
