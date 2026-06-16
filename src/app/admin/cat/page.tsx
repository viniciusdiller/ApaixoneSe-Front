"use client";

import { useEffect, useRef, useState } from "react";
import { catApi } from "@/lib/api";
import { catMovelApi } from "@/lib/api/cat-movel";
import type { Cat, CatMovel } from "@/lib/api";
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
  Save,
  MapPin,
} from "lucide-react";
import Image from "next/image";

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = "cat" | "cat-movel";

const TABS: { key: Tab; label: string; emoji: string }[] = [
  { key: "cat", label: "CAT Fixo", emoji: "🏛️" },
  { key: "cat-movel", label: "CAT Móvel", emoji: "📍" },
];

// ─── tipos internos ───────────────────────────────────────────────────────────

type ManagedImage =
  | { mode: "existing"; url: string }
  | { mode: "new"; file: File; preview: string }
  | { mode: "deleted"; url: string };

// ─── buildFormData ────────────────────────────────────────────────────────────

function buildFormData(
  texto: string,
  images: ManagedImage[],
  newVideo: File | null,
): FormData {
  const fd = new FormData();
  fd.append("texto", texto);

  const newFiles = images.filter((i) => i.mode === "new") as {
    mode: "new";
    file: File;
    preview: string;
  }[];

  newFiles.forEach(({ file }) => fd.append("imagens", file));

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
    let count = 0;
    const next: ManagedImage[] = [];

    images.forEach((img) => {
      if (img.mode === "deleted") {
        next.push(img);
        return;
      }

      if (count === visibleIdx) {
        count++;
        if (img.mode === "new") {
          URL.revokeObjectURL(img.preview);
          return;
        }
        next.push({ mode: "deleted" as const, url: img.url });
        return;
      }

      count++;
      next.push(img);
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
                <Image src={src} alt={`Imagem ${visIdx + 1}`} fill className="object-cover" />
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

// ─── CatThumb ─────────────────────────────────────────────────────────────────

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
          {cat.imagensUrl.length} imagem
          {cat.imagensUrl.length !== 1 ? "ns" : ""}
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

// ─── CatMovelThumb ────────────────────────────────────────────────────────────

function CatMovelThumb({ item }: { item: CatMovel }) {
  const src = safeMediaUrl(item.midiaUrl);

  if (!src) return <span className="text-xs text-muted-foreground">—</span>;

  if (item.midiaType === "video") {
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Video size={14} /> Vídeo
      </span>
    );
  }

  return (
    <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border border-border">
      <Image src={src} alt="thumb" fill className="object-cover" />
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function AdminCatPage() {
  const [activeTab, setActiveTab] = useState<Tab>("cat");

  // ── CAT Fixo state ──
  const [items, setItems] = useState<Cat[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ open: boolean; editing: Cat | null }>({
    open: false,
    editing: null,
  });
  const [viewing, setViewing] = useState<Cat | null>(null);
  const [texto, setTexto] = useState("");
  const [images, setImages] = useState<ManagedImage[]>([]);
  const [newVideo, setNewVideo] = useState<File | null>(null);
  const [videoCleared, setVideoCleared] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ── CAT Móvel state ──
  const [movelItems, setMovelItems] = useState<CatMovel[]>([]);
  const [movelLoading, setMovelLoading] = useState(true);
  const [movelSaving, setMovelSaving] = useState(false);
  const [movelFeedback, setMovelFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [movelModal, setMovelModal] = useState(false);
  const [movelEditingId, setMovelEditingId] = useState<string | null>(null);
  const [movelForm, setMovelForm] = useState({ titulo: "", descricao: "" });
  const [movelMidia, setMovelMidia] = useState<File | null>(null);
  const movelMidiaRef = useRef<HTMLInputElement>(null);

  // ── Loaders ──
  const loadCat = () => {
    setLoading(true);
    catApi.getAll().then(setItems).finally(() => setLoading(false));
  };

  const loadMovel = () => {
    setMovelLoading(true);
    catMovelApi.getAll().then(setMovelItems).finally(() => setMovelLoading(false));
  };

  useEffect(() => {
    loadCat();
    loadMovel();
  }, []);

  function movelToast(type: "success" | "error", msg: string) {
    setMovelFeedback({ type, msg });
    setTimeout(() => setMovelFeedback(null), 4000);
  }

  // ── CAT Fixo handlers ──
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
    setImages((item.imagensUrl ?? []).map((url) => ({ mode: "existing" as const, url })));
    setModal({ open: true, editing: item });
  };

  const closeModal = () => setModal({ open: false, editing: null });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const fd = buildFormData(texto, images, newVideo);
      modal.editing ? await catApi.update(modal.editing.id, fd) : await catApi.create(fd);
      closeModal();
      loadCat();
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
    if (!confirm("Excluir este registro CAT?")) return;
    await catApi.remove(item.id);
    loadCat();
  };

  const displayedVideoUrl = videoCleared || newVideo ? null : (modal.editing?.videoUrl ?? null);

  // ── CAT Móvel handlers ──
  function openAddMovel() {
    setMovelEditingId(null);
    setMovelForm({ titulo: "", descricao: "" });
    setMovelMidia(null);
    setMovelModal(true);
  }

  function openEditMovel(item: CatMovel) {
    setMovelEditingId(item.id);
    setMovelForm({ titulo: item.titulo, descricao: item.descricao });
    setMovelMidia(null);
    setMovelModal(true);
  }

  async function handleSaveMovel(e: React.FormEvent) {
    e.preventDefault();
    setMovelSaving(true);
    try {
      const fd = new FormData();
      fd.append("titulo", movelForm.titulo);
      fd.append("descricao", movelForm.descricao);
      if (movelMidia) fd.append("midia", movelMidia);
      if (movelEditingId) {
        await catMovelApi.update(movelEditingId, fd);
        movelToast("success", "CAT Móvel atualizado!");
      } else {
        await catMovelApi.create(fd);
        movelToast("success", "CAT Móvel adicionado!");
      }
      setMovelModal(false);
      loadMovel();
    } catch {
      movelToast("error", "Erro ao salvar CAT Móvel.");
    } finally {
      setMovelSaving(false);
    }
  }

  async function handleDeleteMovel(id: string) {
    if (!confirm("Remover este CAT Móvel?")) return;
    try {
      await catMovelApi.remove(id);
      movelToast("success", "CAT Móvel removido.");
      loadMovel();
    } catch {
      movelToast("error", "Erro ao remover CAT Móvel.");
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-xl">
          <MapPin className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">CAT</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie o CAT Fixo e os registros de CAT Móvel.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
        {TABS.map(({ key, label, emoji }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === key
                ? "bg-white shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>{emoji}</span>
            {label}
          </button>
        ))}
      </div>

      {/* ── ABA: CAT FIXO ── */}
      {activeTab === "cat" && (
        <div>
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Central de Atendimento ao Turista — {items.length} registros
            </p>
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

          {/* Modal Visualização */}
          <AdminModal title="Detalhes do Registro CAT" open={!!viewing} onClose={() => setViewing(null)}>
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
                          <div key={i} className="relative aspect-square overflow-hidden rounded-lg border border-border">
                            <Image src={src} alt={`Imagem ${i + 1}`} fill className="object-cover" />
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
                {viewing.videoUrl && (() => {
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

          {/* Modal Criar/Editar */}
          <AdminModal title={modal.editing ? "Editar CAT" : "Novo Registro CAT"} open={modal.open} onClose={closeModal}>
            <form onSubmit={handleSave} className="space-y-5">
              <AdminFormField label="Texto descritivo" value={texto} onChange={setTexto} multiline required />
              <ImageManager images={images} onChange={setImages} />
              <VideoUpload
                newFile={newVideo}
                existingUrl={displayedVideoUrl}
                onChange={(f) => { setNewVideo(f); setVideoCleared(false); }}
                onClear={() => { setNewVideo(null); setVideoCleared(true); }}
              />
              {videoCleared && !newVideo && (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-400">
                  ⚠️ O vídeo será mantido no servidor até você enviar um novo arquivo no lugar.
                </p>
              )}
              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-500 dark:bg-red-950/30">{error}</p>
              )}
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={closeModal} className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted">
                  Cancelar
                </button>
                <button type="submit" disabled={saving} className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                  {saving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </AdminModal>
        </div>
      )}

      {/* ── ABA: CAT MÓVEL ── */}
      {activeTab === "cat-movel" && (
        <div className="space-y-4">
          {movelFeedback && (
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border ${
              movelFeedback.type === "success"
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-red-50 text-red-800 border-red-200"
            }`}>
              <span>{movelFeedback.type === "success" ? "✓" : "✕"}</span>
              {movelFeedback.msg}
            </div>
          )}

          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {movelItems.length} registro(s) cadastrado(s)
            </p>
            <button
              onClick={openAddMovel}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Adicionar CAT Móvel
            </button>
          </div>

          {movelLoading ? (
            <LoadingGrid count={3} />
          ) : !movelItems.length ? (
            <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl text-muted-foreground">
              <p className="text-4xl mb-3">📍</p>
              <p className="text-sm font-medium">Nenhum CAT Móvel cadastrado ainda.</p>
              <p className="text-xs mt-1">Clique em "Adicionar" para começar.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {movelItems.map((item) => (
                <div key={item.id} className="bg-white border border-border rounded-2xl p-4 shadow-sm flex gap-4 items-start">
                  <CatMovelThumb item={item} />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-0.5">{item.titulo}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{item.descricao}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      onClick={() => openEditMovel(item)}
                      className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteMovel(item.id)}
                      className="p-2 rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-500"
                      title="Remover"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── MODAL CAT MÓVEL ── */}
      {movelModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4 pb-4 sm:pb-0">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex justify-between items-center px-6 py-4 border-b border-border">
              <h2 className="text-base font-semibold">
                {movelEditingId ? "Editar CAT Móvel" : "Novo CAT Móvel"}
              </h2>
              <button
                onClick={() => setMovelModal(false)}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleSaveMovel} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                  Título
                </label>
                <input
                  value={movelForm.titulo}
                  onChange={(e) => setMovelForm((f) => ({ ...f, titulo: e.target.value }))}
                  required
                  className="w-full border border-input rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
                  placeholder="Título do CAT Móvel"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                  Descrição
                </label>
                <textarea
                  value={movelForm.descricao}
                  onChange={(e) => setMovelForm((f) => ({ ...f, descricao: e.target.value }))}
                  required
                  rows={4}
                  className="w-full border border-input rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none transition"
                  placeholder="Descrição do CAT Móvel"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                  Mídia <span className="normal-case font-normal">(imagem ou vídeo)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="flex items-center gap-2 px-3 py-2 border-2 border-dashed border-border rounded-xl text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                    <ImagePlus className="w-4 h-4" />
                    {movelMidia ? movelMidia.name : "Selecionar imagem ou vídeo"}
                  </div>
                  <input
                    ref={movelMidiaRef}
                    type="file"
                    accept="image/*,video/*"
                    onChange={(e) => setMovelMidia(e.target.files?.[0] ?? null)}
                    className="hidden"
                  />
                </label>
                {movelMidia && (
                  <button
                    type="button"
                    onClick={() => setMovelMidia(null)}
                    className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground hover:text-red-500 transition-colors"
                  >
                    <X className="w-3 h-3" /> Remover seleção
                  </button>
                )}
              </div>
              <div className="flex gap-3 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setMovelModal(false)}
                  className="text-sm text-muted-foreground hover:text-foreground px-4 py-2 rounded-xl hover:bg-muted transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={movelSaving}
                  className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {movelSaving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
