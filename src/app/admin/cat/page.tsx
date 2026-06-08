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
 * mode "existing": imagem já salva no servidor (não re-enviada)
 * mode "new":      arquivo recém selecionado
 * mode "deleted":  existia no servidor, foi removida pelo admin
 *                  (frontend guarda para não exibir —
 *                   o backend não tem endpoint de delete unitário,
 *                   então a exclusão efetiva ocorre quando o admin
 *                   salvar e o backend sobrescrever com as novas imagens)
 */
type ManagedImage =
  | { mode: "existing"; url: string }
  | { mode: "new"; file: File; preview: string }
  | { mode: "deleted"; url: string };

// ─── buildFormData ──────────────────────────────────────────────────────────────

/**
 * Monta o FormData com base no que o backend aceita:
 *   texto   → sempre enviado
 *   imagens → SOMENTE quando há arquivos novos OU houve exclusões
 *             (nesse caso enviamos todos os arquivos novos; as existentes
 *              não deletadas ficarão no banco porque o backend não as toca
 *              quando imagensUrl vier vazio)
 *   video   → SOMENTE quando o admin selecionou um novo arquivo
 *             (não enviar = manter o vídeo existente)
 *
 * NOTA sobre exclusão de imagens:
 *   O backend atual NÃO tem endpoint de exclusão unitária de imagem.
 *   Quando o admin "exclui" uma imagem existente e envia novas, o backend
 *   sobrescreve imagensUrl com as novas. Imagens existentes que não foram
 *   excluídas pelo admin continuam no banco (não são reenviadas — o
 *   backend só substitui quando recebe novos arquivos).
 *   Para exclusão unitária real, será necessário um endpoint dedicado no back.
 */
function buildFormData(
  texto: string,
  images: ManagedImage[],
  newVideo: File | null,
): FormData {
  const fd = new FormData();
  fd.append("texto", texto);

  // Apenas arquivos novos (não re-enviamos os existentes)
  const newFiles = images.filter((i) => i.mode === "new") as {
    mode: "new";
    file: File;
    preview: string;
  }[];

  newFiles.forEach(({ file }) => fd.append("imagens", file));

  // Vídeo: só envia se o admin selecionou um novo arquivo
  if (newVideo) fd.append("video", newVideo);

  return fd;
}

// ─── ImageManager ─────────────────────────────────────────────────────────────

function ImageManager({
  images,
  onChange,
}: {
  images: ManagedImage[];
  onChange: (images: ManagedImage[]) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const visible = images.filter((i) => i.mode !== "deleted");
  const total = visible.length;

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const added: ManagedImage[] = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => ({
        mode: "new" as const,
        file: f,
        preview: URL.createObjectURL(f),
      }));
    onChange([...images, ...added]);
  };

  const remove = (visibleIdx: number) => {
    // Mapeia índice visível para índice real no array
    let count = 0;
    const next = images.map((img) => {
      if (img.mode === "deleted") return img;
      if (count === visibleIdx) {
        count++;
        if (img.mode === "new") {
          URL.revokeObjectURL(img.preview);
          return { ...img, mode: "deleted" as const };
        }
        return { ...img, mode: "deleted" as const };
      }
      count++;
      return img;
    });
    onChange(next);
  };

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
          {visible.map((img, visIdx) => {
            const src =
              img.mode === "existing"
                ? safeMediaUrl(img.url)
                : img.mode === "new"
                ? img.preview
                : null;
            return src ? (
              <div
                key={visIdx}
                className={`group relative aspect-square overflow-hidden rounded-xl border-2 ${
                  img.mode === "new"
                    ? "border-primary/60 ring-1 ring-primary/30"
                    : "border-border"
                }`}
              >
                <Image
                  src={src}
                  alt={`Imagem ${visIdx + 1}`}
                  fill
                  className="object-cover"
                />

                {img.mode === "new" && (
                  <span className="absolute left-1 top-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">
                    NOVA
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => remove(visIdx)}
                  title="Remover imagem"
                  className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                >
                  <Trash2 size={11} />
                </button>

                <span className="absolute bottom-1 left-1 rounded-full bg-black/50 px-1.5 py-0.5 text-[10px] text-white">
                  {visIdx + 1}
                </span>
              </div>
            ) : null;
          })}

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
  newFile,
  existingUrl,
  onChange,
  onClear,
}: {
  newFile: File | null;
  existingUrl?: string | null;
  onChange: (f: File) => void;
  onClear: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  // Mostra: novo arquivo > existente no servidor > nada
  const preview = newFile
    ? URL.createObjectURL(newFile)
    : safeMediaUrl(existingUrl);
  const hasExisting = !!existingUrl && !newFile;

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
            <X size={12} />
            {hasExisting ? "Remover vídeo atual" : "Cancelar seleção"}
          </button>
          {newFile && (
            <span className="absolute bottom-2 left-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
              NOVO
            </span>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 py-6 text-sm text-muted-foreground transition hover:border-primary hover:text-primary"
        >
          <Play size={24} />
          <span>
            {existingUrl
              ? "Vídeo removido — clique para enviar um novo"
              : "Clique para selecionar um vídeo"}
          </span>
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
  // newVideo: arquivo de vídeo recém selecionado
  const [newVideo, setNewVideo] = useState<File | null>(null);
  // videoCleared: admin pediu para remover o vídeo existente (sem enviar novo)
  const [videoCleared, setVideoCleared] = useState(false);
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
    setNewVideo(null);
    setVideoCleared(false);
    setError("");
  };

  const openCreate = () => {
    resetForm();
    setModal({ open: true, editing: null });
  };

  const openEdit = (item: Cat) => {
    resetForm();
    setTexto(item.texto);
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
      const fd = buildFormData(texto, images, newVideo);
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

  // URL do vídeo a exibir no player:
  // - se admin selecionou novo arquivo: não mostra o antigo (será substituído)
  // - se admin limpou sem novo: não mostra nada (será substituído após novo upload)
  // - caso contrário: mostra o vídeo existente
  const displayedVideoUrl =
    videoCleared || newVideo ? null : (modal.editing?.videoUrl ?? null);

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
            newFile={newVideo}
            existingUrl={displayedVideoUrl}
            onChange={(f) => {
              setNewVideo(f);
              setVideoCleared(false);
            }}
            onClear={() => {
              setNewVideo(null);
              setVideoCleared(true);
            }}
          />

          {/* Aviso quando o admin limpou o vídeo sem enviar um novo */}
          {videoCleared && !newVideo && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-400">
              ⚠️ O vídeo será mantido no servidor até você enviar um novo arquivo no lugar.
              O backend atual não suporta remoção de vídeo sem substituição.
            </p>
          )}

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
