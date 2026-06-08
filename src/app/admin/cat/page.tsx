"use client";

import { useEffect, useRef, useState } from "react";
import { catApi } from "@/lib/api";
import type { Cat } from "@/lib/api";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminModal } from "@/components/admin/AdminModal";
import { AdminFormField } from "@/components/admin/AdminFormField";
import { LoadingGrid } from "@/components/ui/LoadingGrid";
import { safeMediaUrl } from "@/lib/safeMediaUrl";
import {
  Plus,
  Eye,
  Pencil,
  Video,
  X,
  UploadCloud,
  Play,
  Trash2,
  ImagePlus,
} from "lucide-react";
import Image from "next/image";

// ─── tipos internos ───────────────────────────────────────────────────────────

/**
 * Representa uma imagem no gerenciador:
 * - mode "existing": já está no servidor; url = URL salva
 * - mode "new":      recém selecionada pelo usuário; file = File local; preview = ObjectURL
 */
type ManagedImage =
  | { mode: "existing"; url: string }
  | { mode: "new"; file: File; preview: string };

// ─── helpers ─────────────────────────────────────────────────────────────────

/**
 * Monta o FormData para criar/atualizar um CAT.
 *
 * Estratégia:
 *  - "texto"             → sempre enviado
 *  - "imagens"           → apenas os arquivos NOVOS (File)
 *  - "imagensMantidasUrls" → JSON.stringify das URLs existentes que devem ser MANTIDAS
 *    O backend deve receber essa lista e deletar do storage as que não estiverem nela.
 *    Se o campo não existir no backend ainda, as imagens existentes serão sobrescritas;
 *    nesse caso a lógica de "manter" fica no front por enquanto.
 *  - "video"             → File novo (se selecionado)
 *  - "removerVideo"      → "true" (se o admin pediu para remover)
 */
function buildFormData(
  texto: string,
  images: ManagedImage[],
  video: File | null,
  removeVideo: boolean,
): FormData {
  const fd = new FormData();
  fd.append("texto", texto);

  const keptUrls: string[] = [];
  const newFiles: File[] = [];

  images.forEach((img) => {
    if (img.mode === "existing") keptUrls.push(img.url);
    else newFiles.push(img.file);
  });

  // URLs existentes mantidas
  fd.append("imagensMantidasUrls", JSON.stringify(keptUrls));

  // Arquivos novos
  newFiles.forEach((f) => fd.append("imagens", f));

  if (video) fd.append("video", video);
  if (removeVideo) fd.append("removerVideo", "true");

  return fd;
}

// ─── ImageManager ─────────────────────────────────────────────────────────────

/**
 * Gerenciador granular de imagens:
 * - Exibe as imagens existentes com botão de excluir individual
 * - Permite adicionar novas imagens (sem remover as existentes)
 * - Exibe preview das novas antes de salvar
 */
function ImageManager({
  images,
  onChange,
}: {
  images: ManagedImage[];
  onChange: (images: ManagedImage[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const valid: ManagedImage[] = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => ({ mode: "new" as const, file: f, preview: URL.createObjectURL(f) }));
    onChange([...images, ...valid]);
  };

  const remove = (idx: number) => {
    const next = [...images];
    // revogar object URL se for novo para não vazar memória
    const item = next[idx];
    if (item.mode === "new") URL.revokeObjectURL(item.preview);
    next.splice(idx, 1);
    onChange(next);
  };

  const total = images.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Imagens ({total} / 10)
        </label>
        {total < 10 && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-1 rounded-md border border-primary/40 bg-primary/5 px-2.5 py-1 text-xs text-primary transition hover:bg-primary/10"
          >
            <ImagePlus size={13} /> Adicionar imagem
          </button>
        )}
      </div>

      {total === 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 py-8 text-sm text-muted-foreground transition hover:border-primary hover:text-primary"
        >
          <UploadCloud size={24} />
          <span>Clique para adicionar imagens</span>
        </button>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {images.map((img, idx) => {
            const src = img.mode === "existing" ? safeMediaUrl(img.url) : img.preview;
            return src ? (
              <div
                key={idx}
                className={`group relative aspect-square overflow-hidden rounded-xl border-2 ${
                  img.mode === "new"
                    ? "border-primary/60 ring-1 ring-primary/30"
                    : "border-border"
                }`}
              >
                <Image src={src} alt={`Imagem ${idx + 1}`} fill className="object-cover" />

                {/* Badge NEW */}
                {img.mode === "new" && (
                  <span className="absolute left-1 top-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                    NOVA
                  </span>
                )}

                {/* Botão excluir */}
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  title="Remover imagem"
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                >
                  <Trash2 size={11} />
                </button>

                {/* Índice */}
                <span className="absolute bottom-1 left-1 rounded-full bg-black/50 px-1.5 py-0.5 text-[10px] text-white">
                  {idx + 1}
                </span>
              </div>
            ) : null;
          })}

          {/* Célula de adicionar (se < 10) */}
          {total < 10 && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 text-muted-foreground transition hover:border-primary hover:text-primary"
            >
              <Plus size={20} />
            </button>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
      />
    </div>
  );
}

// ─── VideoUpload ──────────────────────────────────────────────────────────────

function VideoUpload({
  file,
  existingUrl,
  onChange,
  onClear,
}: {
  file: File | null;
  existingUrl?: string | null;
  onChange: (f: File) => void;
  onClear: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const preview = file ? URL.createObjectURL(file) : safeMediaUrl(existingUrl);

  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Vídeo (opcional) — MP4, MOV, WEBM
      </label>

      {preview ? (
        <div className="relative overflow-hidden rounded-xl border border-border bg-black">
          <video src={preview} controls className="max-h-48 w-full" />
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs text-white hover:bg-red-600"
          >
            <X size={12} /> Remover
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 py-6 text-sm text-muted-foreground transition hover:border-primary hover:text-primary"
        >
          <Play size={24} />
          <span>Clique para selecionar um vídeo</span>
        </button>
      )}

      <input
        ref={ref}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onChange(f);
        }}
      />
    </div>
  );
}

// ─── CatThumb ────────────────────────────────────────────────────────────────

function CatThumb({ cat }: { cat: Cat }) {
  const first = cat.imagensUrl?.[0];
  const src = safeMediaUrl(first);

  if (src) {
    return (
      <div className="flex items-center gap-2">
        <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border border-border">
          <Image src={src} alt="thumb" fill className="object-cover" />
        </div>
        <span className="text-xs text-muted-foreground">
          {cat.imagensUrl.length} imagem{cat.imagensUrl.length !== 1 ? "ns" : ""}
          {cat.videoUrl && " + vídeo"}
        </span>
      </div>
    );
  }

  if (cat.videoUrl) {
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Video size={14} /> Vídeo
      </span>
    );
  }

  return <span className="text-xs text-muted-foreground">—</span>;
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function AdminCategoriasPage() {
  const [items, setItems] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing: Cat | null }>({
    open: false,
    editing: null,
  });
  const [viewing, setViewing] = useState<Cat | null>(null);

  // form state
  const [texto, setTexto] = useState("");
  const [images, setImages] = useState<ManagedImage[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [clearVideo, setClearVideo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = () => {
    setLoading(true);
    catApi
      .getAll()
      .then(setItems)
      .finally(() => setLoading(false));
  };
  useEffect(load, []);

  const resetForm = () => {
    setTexto("");
    setImages([]);
    setVideo(null);
    setClearVideo(false);
    setError("");
  };

  const openCreate = () => {
    resetForm();
    setModal({ open: true, editing: null });
  };

  const openEdit = (item: Cat) => {
    resetForm();
    setTexto(item.texto);
    // Pré-popular as imagens existentes
    setImages(
      (item.imagensUrl ?? []).map((url) => ({ mode: "existing" as const, url }))
    );
    setModal({ open: true, editing: item });
  };

  const closeModal = () => setModal({ open: false, editing: null });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const fd = buildFormData(texto, images, clearVideo ? null : video, clearVideo);

      modal.editing
        ? await catApi.update(modal.editing.id, fd)
        : await catApi.create(fd);

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

  const handleDelete = async (item: Cat) => {
    if (!confirm(`Excluir este registro CAT?`)) return;
    await catApi.remove(item.id);
    load();
  };

  const existingVideoUrl = modal.editing?.videoUrl ?? null;
  const displayedVideoUrl = clearVideo ? null : video ? null : existingVideoUrl;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-widest">CAT</h1>
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
                <span className="line-clamp-2 max-w-sm text-sm">{row.texto}</span>
              ),
            },
            {
              key: "imagensUrl",
              label: "Mídia",
              render: (_val, row) => <CatThumb cat={row} />,
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
        title="Detalhes do Registro CAT"
        open={!!viewing}
        onClose={() => setViewing(null)}
      >
        {viewing && (
          <div className="space-y-6 text-sm">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Texto</span>
              <p className="whitespace-pre-wrap text-foreground">{viewing.texto}</p>
            </div>

            {viewing.imagensUrl?.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Imagens ({viewing.imagensUrl.length})
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {viewing.imagensUrl.map((url, i) => {
                    const src = safeMediaUrl(url);
                    return src ? (
                      <div
                        key={i}
                        className="relative aspect-square overflow-hidden rounded-lg border border-border"
                      >
                        <Image src={src} alt={`Imagem ${i + 1}`} fill className="object-cover" />
                      </div>
                    ) : null;
                  })}
                </div>
              </div>
            )}

            {viewing.videoUrl &&
              (() => {
                const src = safeMediaUrl(viewing.videoUrl);
                return src ? (
                  <div className="flex flex-col gap-2">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Vídeo</span>
                    <video src={src} controls className="w-full rounded-xl border border-border bg-black" />
                  </div>
                ) : null;
              })()}
          </div>
        )}
      </AdminModal>

      {/* ── Modal Criar / Editar ── */}
      <AdminModal
        title={modal.editing ? "Editar CAT" : "Novo Registro CAT"}
        open={modal.open}
        onClose={closeModal}
      >
        <form onSubmit={handleSave} className="space-y-5">
          <AdminFormField
            label="Texto descritivo"
            value={texto}
            onChange={(e) => setTexto(typeof e === "string" ? e : e.target.value)}
            multiline
            required
          />

          <ImageManager images={images} onChange={setImages} />

          <VideoUpload
            file={video}
            existingUrl={displayedVideoUrl}
            onChange={(f) => { setVideo(f); setClearVideo(false); }}
            onClear={() => { setVideo(null); setClearVideo(true); }}
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
