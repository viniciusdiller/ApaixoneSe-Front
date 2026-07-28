"use client";

import { useEffect, useState, useMemo } from "react";
import { atividadesApi } from "@/lib/api";
import type { Atividade, CreateAtividadeDto, TipoRoteiro } from "@/lib/api";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminFormField } from "@/components/admin/AdminFormField";
import { FileUploadField } from "@/components/admin/FileUploadField";
import { MediaPreview } from "@/components/admin/MediaPreview";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { LoadingGrid } from "@/components/ui/LoadingGrid";
import { Plus, Eye, Pencil, Search, X } from "lucide-react";

const PAGE_SIZE = 10;

const ROTEIROS: { value: TipoRoteiro; label: string }[] = [
  { value: "A_PE", label: "A Pé" },
  { value: "ESPORTE_E_AVENTURA", label: "Esporte e Aventura" },
  { value: "DE_PRAIAS", label: "De Praias" },
  { value: "CULTURAL", label: "Cultural" },
  { value: "RELIGIOSO", label: "Religioso" },
  { value: "RURAL", label: "Rural" },
  { value: "ECOLOGICO", label: "Ecológico" },
];

const empty: CreateAtividadeDto = {
  titulo: "",
  descricao: "",
  local: "",
  roteiro: "A_PE",
  logoUrl: "",
};

export default function AdminAtividadesPage() {
  const [items, setItems] = useState<Atividade[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState<{
    open: boolean;
    editing: Atividade | null;
  }>({ open: false, editing: null });
  const [viewing, setViewing] = useState<Atividade | null>(null);
  const [form, setForm] = useState<CreateAtividadeDto>(empty);
  const [files, setFiles] = useState<{ logo?: File }>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    atividadesApi
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
        (i.descricao ?? "").toLowerCase().includes(q) ||
        ROTEIROS.find((r) => r.value === i.roteiro)
          ?.label.toLowerCase()
          .includes(q),
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
  const openEdit = (item: Atividade) => {
    setForm({
      titulo: item.titulo,
      descricao: item.descricao,
      local: item.local,
      roteiro: item.roteiro,
      latitude: item.latitude ?? undefined,
      longitude: item.longitude ?? undefined,
      logoUrl: item.logoUrl ?? "",
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
      const latitude = form.latitude
        ? parseFloat(String(form.latitude).replace(",", "."))
        : undefined;
      const longitude = form.longitude
        ? parseFloat(String(form.longitude).replace(",", "."))
        : undefined;

      const formData = new FormData();
      formData.append("titulo", form.titulo);
      formData.append("descricao", form.descricao);
      formData.append("local", form.local);
      formData.append("roteiro", form.roteiro);
      if (latitude !== undefined) formData.append("latitude", String(latitude));
      if (longitude !== undefined)
        formData.append("longitude", String(longitude));
      if (files.logo) formData.append("logo", files.logo);

      modal.editing
        ? await atividadesApi.update(modal.editing.id, formData)
        : await atividadesApi.create(formData);
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

  const handleDelete = async (item: Atividade) => {
    if (!confirm(`Excluir "${item.titulo}"?`)) return;
    await atividadesApi.remove(item.id);
    load();
  };

  const set =
    (k: keyof CreateAtividadeDto) =>
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

  const setField = (k: keyof CreateAtividadeDto, value: string) =>
    setForm((prev) => ({ ...prev, [k]: value }));

  const handlePasteLatitude = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pastedData = e.clipboardData.getData("text");
    if (pastedData.includes(",")) {
      e.preventDefault();
      const [latStr, lngStr] = pastedData.split(",").map((c) => c.trim());
      const parsedLat = latStr ? parseFloat(latStr.replace(",", ".")) : undefined;
      const parsedLng = lngStr ? parseFloat(lngStr.replace(",", ".")) : undefined;
      setForm((prev) => ({
        ...prev,
        latitude: parsedLat && !isNaN(parsedLat) ? parsedLat : undefined,
        longitude: parsedLng && !isNaN(parsedLng) ? parsedLng : undefined,
      }));
    }
  };

  const roteiroLabel = (v: TipoRoteiro) =>
    ROTEIROS.find((r) => r.value === v)?.label ?? v;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-widest">
            Atividades
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
          <Plus className="h-4 w-4" /> Nova Atividade
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
          placeholder="Pesquisar por título, local, roteiro ou descrição…"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full rounded-xl border border-border bg-card py-2 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        {search && (
          <button
            type="button"
            onClick={() => handleSearchChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground transition hover:text-foreground"
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
                key: "logoUrl",
                label: "Logo",
                render: (_val, row) => (
                  <MediaPreview url={row.logoUrl ?? ""} label={row.titulo} />
                ),
              },
              { key: "titulo", label: "Título" },
              { key: "local", label: "Local" },
              {
                key: "roteiro",
                label: "Roteiro",
                render: (_val, row) => roteiroLabel(row.roteiro),
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

          <AdminPagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}

      {/* Modal Visualização */}
      <AdminModal
        title="Detalhes da Atividade"
        open={!!viewing}
        onClose={() => setViewing(null)}
      >
        {viewing && (
          <dl className="space-y-3 text-sm">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Logo
              </dt>
              <dd className="pt-1">
                <MediaPreview url={viewing.logoUrl ?? ""} label={viewing.titulo} />
              </dd>
            </div>
            <ViewRow label="Título" value={viewing.titulo} />
            <ViewRow label="Local" value={viewing.local} />
            <ViewRow label="Roteiro" value={roteiroLabel(viewing.roteiro)} />
            <ViewRow label="Descrição" value={viewing.descricao} />
            {viewing.latitude != null && (
              <ViewRow label="Latitude" value={String(viewing.latitude)} />
            )}
            {viewing.longitude != null && (
              <ViewRow label="Longitude" value={String(viewing.longitude)} />
            )}
          </dl>
        )}
      </AdminModal>

      {/* Modal Criar/Editar */}
      <AdminModal
        title={modal.editing ? "Editar Atividade" : "Nova Atividade"}
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
            label="Descrição"
            value={form.descricao}
            onChange={set("descricao")}
            multiline
            required
          />
          <div className="space-y-1">
            <label className="text-sm font-medium">Roteiro *</label>
            <select
              value={form.roteiro}
              onChange={set("roteiro")}
              required
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
            >
              {ROTEIROS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <AdminFormField
              label="Latitude (opcional)"
              value={String(form.latitude ?? "")}
              onChange={set("latitude")}
              onPaste={handlePasteLatitude}
              type="text"
            />
            <AdminFormField
              label="Longitude (opcional)"
              value={String(form.longitude ?? "")}
              onChange={set("longitude")}
              type="text"
              step="any"
            />
          </div>
          <FileUploadField
            label="Logo da Atividade"
            accept="image"
            currentUrl={form.logoUrl ?? ""}
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
