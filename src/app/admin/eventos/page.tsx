"use client";

import { confirmAction } from "@/lib/feedback";

import { useEffect, useState, useMemo } from "react";
import { eventosApi } from "@/lib/api";
import type { Evento, CreateEventoDto } from "@/lib/api";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminFormField } from "@/components/admin/AdminFormField";
import { AdminDateField } from "@/components/admin/AdminDateField";
import { FileUploadField } from "@/components/admin/FileUploadField";
import { MediaPreview } from "@/components/admin/MediaPreview";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { LoadingGrid } from "@/components/ui/LoadingGrid";
import { Plus, Eye, Pencil, Search, X } from "lucide-react";
import {
  formatarPeriodoEvento,
  formatarPeriodoEventoCurto,
} from "@/lib/eventoPeriodo";

const PAGE_SIZE = 10;

const empty: CreateEventoDto = {
  titulo: "",
  descricao: "",
  data: "",
  dataFim: "",
  local: "",
  endereco: "",
  fotoUrl: "",
};

/** Converte um valor "YYYY-MM-DD" para ISO 8601 em UTC (sem horário) */
function fromDateValue(value: string): string {
  return `${value}T00:00:00.000Z`;
}

/** Converte um ISO 8601 vindo da API para "YYYY-MM-DD" (descarta horário) */
function toDateValue(iso?: string | null): string {
  return iso ? iso.slice(0, 10) : "";
}

export default function AdminEventosPage() {
  const [items, setItems] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<{ open: boolean; editing: Evento | null }>(
    { open: false, editing: null },
  );
  const [viewing, setViewing] = useState<Evento | null>(null);
  // form.data / form.dataFim armazenam o valor no formato de <input type="datetime-local">
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

  // ── filtro + paginação ──
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.titulo.toLowerCase().includes(q) ||
        i.local.toLowerCase().includes(q) ||
        (i.endereco ?? "").toLowerCase().includes(q) ||
        (i.descricao ?? "").toLowerCase().includes(q),
    );
  }, [items, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, page]);

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
      data: toDateValue(item.data),
      dataFim: toDateValue(item.dataFim),
      local: item.local,
      endereco: item.endereco ?? "",
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

    if (!form.data) {
      setError("Selecione a data de início.");
      return;
    }
    if (form.dataFim && form.dataFim < form.data) {
      setError("A data final do evento não pode ser anterior à data de início.");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("titulo", form.titulo);
      formData.append("descricao", form.descricao);
      formData.append("data", fromDateValue(form.data));
      if (form.dataFim) {
        formData.append("dataFim", fromDateValue(form.dataFim));
      }
      formData.append("local", form.local);
      if (form.endereco) formData.append("endereco", form.endereco);
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
    if (!(await confirmAction(`Excluir "${item.titulo}"?`))) return;
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
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-widest sm:text-3xl">
            Eventos
          </h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length === items.length
              ? `${items.length} registros`
              : `${filtered.length} de ${items.length} registros`}
            {totalPages > 1 && ` — página ${page} de ${totalPages}`}
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" /> Novo Evento
        </button>
      </div>

      {/* barra de pesquisa */}
      <div className="relative mb-4">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
        <input
          type="search"
          placeholder="Pesquisar por título, local, endereço ou descrição…"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {search && (
          <button
            type="button"
            onClick={() => handleSearchChange("")}
            className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded text-muted-foreground transition hover:text-foreground"
            aria-label="Limpar pesquisa"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {loading ? (
        <LoadingGrid count={3} />
      ) : (
        <>
          <AdminTable
            data={paged}
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
                  formatarPeriodoEventoCurto(row.data, row.dataFim),
              },
            ]}
            extraActions={(row) => (
              <>
                <button
                  onClick={() => setViewing(row)}
                  title="Ver detalhes"
                  aria-label="Ver detalhes"
                  className="flex h-9 w-9 items-center justify-center rounded text-muted-foreground transition hover:bg-surface-offset hover:text-primary"
                >
                  <Eye size={16} />
                </button>
                <button
                  onClick={() => openEdit(row)}
                  title="Editar"
                  aria-label="Editar"
                  className="flex h-9 w-9 items-center justify-center rounded text-muted-foreground transition hover:bg-surface-offset hover:text-primary"
                >
                  <Pencil size={16} />
                </button>
              </>
            )}
            onDelete={handleDelete}
          />

          <AdminPagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
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
            <ViewRow label="Endereço" value={viewing.endereco} />
            <ViewRow
              label="Data"
              value={formatarPeriodoEvento(viewing.data, viewing.dataFim)}
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
            label="Endereço"
            value={form.endereco}
            onChange={set("endereco")}
            placeholder="Rua Principal, 123 - Centro, Saquarema - RJ"
          />
          <AdminDateField
            label="Data de início"
            value={form.data}
            onChange={(v) => setField("data", v)}
            required
          />
          <AdminDateField
            label="Data de fim (opcional)"
            value={form.dataFim ?? ""}
            onChange={(v) => setField("dataFim", v)}
            minDate={form.data || undefined}
          />
          {!form.dataFim && modal.editing?.dataFim && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
              Limitação atual da API: limpar a data de fim aqui não remove o
              período já salvo — o backend ainda não tem um sinal explícito de
              &ldquo;remover período&rdquo; no PUT parcial. O evento continuará
              sendo tratado como um período até isso ser resolvido no backend.
            </p>
          )}
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
