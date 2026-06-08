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
  Images,
  Video,
  X,
  UploadCloud,
  Play,
} from "lucide-react";
import Image from "next/image";

// ─── helpers ──────────────────────────────────────────────────────────────

function buildFormData(
  texto: string,
  imagens: File[],
  video: File | null,
): FormData {
  const fd = new FormData();
  fd.append("texto", texto);
  imagens.forEach((f) => fd.append("imagens", f));
  if (video) fd.append("video", video);
  return fd;
}

// ─── sub-componentes ──────────────────────────────────────────────────────

/** Área de drop para múltiplas imagens */
function ImagensUpload({
  files,
  existingUrls,
  onChange,
}: {
  files: File[];
  existingUrls: string[];
  onChange: (files: File[]) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    const valid = Array.from(incoming).filter((f) =>
      f.type.startsWith("image/"),
    );
    onChange([...files, ...valid]);
  };

  const remove = (idx: number) => {
    const next = [...files];
    next.splice(idx, 1);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Imagens (máx. 10) — PNG, JPG, WEBP
      </label>

      {/* Imagens já salvas no servidor */}
      {existingUrls.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {existingUrls.map((url, i) => {
            const src = safeMediaUrl(url);
            return src ? (
              <div
                key={i}
                className="relative h-20 w-20 overflow-hidden rounded-lg border border-border"
              >
                <Image
                  src={src}
                  alt={`Imagem ${i + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ) : null;
          })}
          <p className="w-full text-xs text-muted-foreground">
            Imagens acima já estão salvas. Para substituí-las, selecione novas
            abaixo.
          </p>
        </div>
      )}

      {/* Preview das novas imagens selecionadas */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((file, idx) => (
            <div
              key={idx}
              className="relative h-20 w-20 overflow-hidden rounded-lg border border-border"
            >
              <Image
                src={URL.createObjectURL(file)}
                alt={file.name}
                fill
                className="object-cover"
              />
              <button
                type="button"
                onClick={() => remove(idx)}
                className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-white hover:bg-red-600"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 py-6 text-sm text-muted-foreground transition hover:border-primary hover:text-primary"
      >
        <UploadCloud size={24} />
        <span>Clique ou arraste imagens aqui</span>
      </button>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
      />
    </div>
  );
}

/** Campo de upload para vídeo único */
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

/** Thumbnail compacto para a tabela */
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

// ─── página principal ─────────────────────────────────────────────────────

export default function AdminCategoriasPage() {
  const [items, setItems] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing: Cat | null }>({
    open: false,
    editing: null,
  });
  const [viewing, setViewing] = useState<Cat | null>(null);
  const [texto, setTexto] = useState("");
  const [imagens, setImagens] = useState<File[]>([]);
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
    setImagens([]);
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
    setModal({ open: true, editing: item });
  };

  const closeModal = () => setModal({ open: false, editing: null });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const fd = buildFormData(texto, imagens, clearVideo ? null : video);
      if (clearVideo) fd.append("removerVideo", "true");

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

  const existingVideo = modal.editing?.videoUrl ?? null;
  const displayedVideo = clearVideo ? null : video ? null : existingVideo;

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
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Texto
              </span>
              <p className="whitespace-pre-wrap text-foreground">{viewing.texto}</p>
            </div>

            {viewing.imagensUrl?.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  <Images size={14} /> Imagens ({viewing.imagensUrl.length})
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {viewing.imagensUrl.map((url, i) => {
                    const src = safeMediaUrl(url);
                    return src ? (
                      <div
                        key={i}
                        className="relative aspect-square overflow-hidden rounded-lg border border-border"
                      >
                        <Image
                          src={src}
                          alt={`Imagem ${i + 1}`}
                          fill
                          className="object-cover"
                        />
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
                    <span className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      <Video size={14} /> Vídeo
                    </span>
                    <video
                      src={src}
                      controls
                      className="w-full rounded-xl border border-border bg-black"
                    />
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
            onChange={(e) =>
              setTexto(typeof e === "string" ? e : e.target.value)
            }
            multiline
            required
          />

          <ImagensUpload
            files={imagens}
            existingUrls={modal.editing?.imagensUrl ?? []}
            onChange={setImagens}
          />

          <VideoUpload
            file={video}
            existingUrl={displayedVideo}
            onChange={(f) => {
              setVideo(f);
              setClearVideo(false);
            }}
            onClear={() => {
              setVideo(null);
              setClearVideo(true);
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
