"use client";

import { useEffect, useRef, useState } from "react";
import { catApi } from "@/lib/api";
import { catMovelApi } from "@/lib/api/cat-movel";
import type { Cat, CatMovel } from "@/lib/api";
import { catMovelMidia } from "@/lib/catMovelMidia";
import { AdminFormField } from "@/components/admin/AdminFormField";
import { safeMediaUrl } from "@/lib/safeMediaUrl";
import {
  Plus,
  Pencil,
  Video,
  X,
  UploadCloud,
  Play,
  Trash2,
  ImagePlus,
  Save,
  MapPin,
  RefreshCw,
  GripVertical,
} from "lucide-react";
import Image from "next/image";

// ─── Tabs ───────────────────────────────────────────────────────────────────
type Tab = "cat" | "cat-movel";
const TABS: { key: Tab; label: string; emoji: string }[] = [
  { key: "cat", label: "CAT Fixo", emoji: "🏛️" },
  { key: "cat-movel", label: "CAT Móvel", emoji: "📍" },
];

// ─── tipos internos ──────────────────────────────────────────────────────────
type ManagedImage =
  | { mode: "existing"; url: string }
  | { mode: "new"; file: File; preview: string }
  | { mode: "deleted"; url: string };

// ─── ordem final das imagens (existentes mantidas + marcador para novas) ────
// Preserva a ordem em que o usuário organizou as imagens no ImageManager.
function buildOrdem(images: ManagedImage[]): string[] {
  return images
    .filter((i) => i.mode !== "deleted")
    .map((i) => (i.mode === "existing" ? i.url : "__new__"));
}

// ─── buildFormData (CAT Fixo) ────────────────────────────────────────────────
function buildFormData(texto: string, images: ManagedImage[], newVideo: File | null): FormData {
  const fd = new FormData();
  fd.append("texto", texto);
  const newFiles = images.filter((i) => i.mode === "new") as { mode: "new"; file: File; preview: string }[];
  newFiles.forEach(({ file }) => fd.append("imagens", file));
  if (newVideo) fd.append("video", newVideo);
  fd.append("ordem", JSON.stringify(buildOrdem(images)));
  return fd;
}

// ─── ImageManager ────────────────────────────────────────────────────────────
// Reordenação via Pointer Events (não HTML5 Drag and Drop) — DnD nativo não
// dispara em telas de toque, então arrastar pra reordenar simplesmente não
// funcionava no mobile. Pointer Events cobrem mouse/toque/caneta com o mesmo
// código, então o comportamento no desktop fica idêntico ao anterior.
function ImageManager({ images, onChange }: { images: ManagedImage[]; onChange: (images: ManagedImage[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragIdx = useRef<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);

  const visible = images
    .map((img, idx) => ({ img, idx }))
    .filter(({ img }) => img.mode !== "deleted");
  const total = visible.length;

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    const added: ManagedImage[] = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .map((f) => ({ mode: "new" as const, file: f, preview: URL.createObjectURL(f) }));
    onChange([...images, ...added]);
  };

  const remove = (idx: number) => {
    const img = images[idx];
    if (img.mode === "new") {
      URL.revokeObjectURL(img.preview);
      onChange(images.filter((_, i) => i !== idx));
      return;
    }
    if (img.mode === "existing") {
      onChange(images.map((im, i) => (i === idx ? { mode: "deleted" as const, url: img.url } : im)));
    }
  };

  const move = (fromIdx: number, toIdx: number) => {
    if (fromIdx === toIdx) return;
    const next = [...images];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    onChange(next);
  };

  const handlePointerDown = (idx: number) => (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    dragIdx.current = idx;
    setDraggingIdx(idx);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragIdx.current === null) return;
    const el = document.elementFromPoint(e.clientX, e.clientY);
    const cell = el?.closest<HTMLElement>("[data-img-idx]");
    if (!cell) return;
    const idx = Number(cell.dataset.imgIdx);
    if (!Number.isNaN(idx) && idx !== overIdx) setOverIdx(idx);
  };

  const finishDrag = () => {
    if (dragIdx.current !== null && overIdx !== null) move(dragIdx.current, overIdx);
    dragIdx.current = null;
    setOverIdx(null);
    setDraggingIdx(null);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Imagens ({total} / 10)</label>
        {total < 10 && (
          <button type="button" onClick={() => inputRef.current?.click()} className="flex items-center gap-1 rounded-md border border-primary/40 bg-primary/5 px-2.5 py-1 text-xs text-primary transition hover:bg-primary/10">
            <ImagePlus size={13} /> Adicionar imagem
          </button>
        )}
      </div>
      {total === 0 ? (
        <button type="button" onClick={() => inputRef.current?.click()} className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 py-8 text-sm text-muted-foreground transition hover:border-primary hover:text-primary">
          <UploadCloud size={24} />
          <span>Clique para adicionar imagens</span>
        </button>
      ) : (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {visible.map(({ img, idx }, visPos) => {
            const src = img.mode === "existing" ? safeMediaUrl(img.url) : img.mode === "new" ? img.preview : null;
            return src ? (
              <div
                key={idx}
                data-img-idx={idx}
                onPointerDown={handlePointerDown(idx)}
                onPointerMove={handlePointerMove}
                onPointerUp={finishDrag}
                onPointerCancel={finishDrag}
                style={{ touchAction: "none" }}
                className={`group relative aspect-square cursor-grab select-none overflow-hidden rounded-xl border-2 active:cursor-grabbing ${
                  overIdx === idx && draggingIdx !== null ? "border-primary ring-2 ring-primary/40" : img.mode === "new" ? "border-primary/60 ring-1 ring-primary/30" : "border-border"
                }`}
              >
                <Image src={src} alt={`Imagem ${visPos + 1}`} fill className="pointer-events-none object-cover" />
                {img.mode === "new" && <span className="absolute left-1 top-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold text-primary-foreground">NOVA</span>}
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  onPointerDown={(e) => e.stopPropagation()}
                  title="Remover imagem"
                  className="absolute right-1 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-100 transition-opacity hover:bg-red-600 sm:opacity-0 sm:group-hover:opacity-100"
                >
                  <Trash2 size={12} />
                </button>
                <span className="absolute bottom-1 left-1 flex items-center gap-1 rounded-full bg-black/50 px-1.5 py-0.5 text-[10px] text-white">
                  <GripVertical size={10} className="opacity-70" />{visPos + 1}
                </span>
              </div>
            ) : null;
          })}
          {total < 10 && (
            <button type="button" onClick={() => inputRef.current?.click()} className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/30 text-muted-foreground transition hover:border-primary hover:text-primary">
              <Plus size={20} />
            </button>
          )}
        </div>
      )}
      {total > 1 && <p className="text-xs text-muted-foreground">Arraste as imagens para reordenar.</p>}
      <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => addFiles(e.target.files)} />
    </div>
  );
}

// ─── VideoUpload (CAT Fixo) ──────────────────────────────────────────────────
function VideoUpload({ newFile, existingUrl, onChange, onClear }: { newFile: File | null; existingUrl?: string | null; onChange: (f: File) => void; onClear: () => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const preview = newFile ? URL.createObjectURL(newFile) : safeMediaUrl(existingUrl);
  const hasExisting = !!existingUrl && !newFile;
  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">Vídeo (opcional) — MP4, MOV, WEBM</label>
      {preview ? (
        <div className="relative overflow-hidden rounded-xl border border-border bg-black">
          <video src={preview} controls className="max-h-48 w-full" />
          <button type="button" onClick={onClear} className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs text-white hover:bg-red-600">
            <X size={12} />{hasExisting ? "Remover vídeo atual" : "Cancelar seleção"}
          </button>
          {newFile && <span className="absolute bottom-2 left-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">NOVO</span>}
        </div>
      ) : (
        <button type="button" onClick={() => ref.current?.click()} className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 py-6 text-sm text-muted-foreground transition hover:border-primary hover:text-primary">
          <Play size={24} />
          <span>{existingUrl ? "Vídeo removido — clique para enviar um novo" : "Clique para selecionar um vídeo"}</span>
        </button>
      )}
      <input ref={ref} type="file" accept="video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onChange(f); }} />
    </div>
  );
}

// ─── Página principal ────────────────────────────────────────────────────────
export default function AdminCatPage() {
  const [activeTab, setActiveTab] = useState<Tab>("cat");

  // CAT Fixo (singleton)
  const [cat, setCat] = useState<Cat | null>(null);
  const [loading, setLoading] = useState(true);
  const [texto, setTexto] = useState("");
  const [images, setImages] = useState<ManagedImage[]>([]);
  const [newVideo, setNewVideo] = useState<File | null>(null);
  const [videoCleared, setVideoCleared] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // CAT Móvel (singleton)
  const [movel, setMovel] = useState<CatMovel | null>(null);
  const [movelLoading, setMovelLoading] = useState(true);
  const [movelSaving, setMovelSaving] = useState(false);
  const [movelFeedback, setMovelFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [movelModal, setMovelModal] = useState(false);
  const [movelForm, setMovelForm] = useState({ titulo: "", descricao: "" });
  const [movelImagem, setMovelImagem] = useState<File | null>(null);
  const [movelVideo, setMovelVideo] = useState<File | null>(null);
  const [movelGaleria, setMovelGaleria] = useState<ManagedImage[]>([]);
  const movelImagemRef = useRef<HTMLInputElement>(null);
  const movelVideoRef = useRef<HTMLInputElement>(null);

  // Popula o formulário inline a partir do registro carregado (ou zera, se ainda não existe).
  const preencherForm = (data: Cat | null) => {
    setCat(data);
    setTexto(data?.texto ?? "");
    setImages((data?.imagensUrl ?? []).map((url) => ({ mode: "existing" as const, url })));
    setNewVideo(null);
    setVideoCleared(false);
  };
  const loadCat = () => {
    setLoading(true);
    catApi
      .get()
      .then(preencherForm)
      .catch(() => preencherForm(null))
      .finally(() => setLoading(false));
  };
  const loadMovel = () => {
    setMovelLoading(true);
    catMovelApi.get().then(setMovel).catch(() => setMovel(null)).finally(() => setMovelLoading(false));
  };

  useEffect(() => { loadCat(); loadMovel(); }, []);

  function movelToast(type: "success" | "error", msg: string) {
    setMovelFeedback({ type, msg });
    setTimeout(() => setMovelFeedback(null), 4000);
  }

  // CAT Fixo handlers
  function catToast(type: "success" | "error", msg: string) {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 4000);
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault(); setFeedback(null); setSaving(true);
    try {
      const fd = buildFormData(texto, images, newVideo);
      if (cat) {
        await catApi.update(fd);
        catToast("success", "Informações do CAT atualizadas com sucesso!");
      } else {
        await catApi.create(fd);
        catToast("success", "CAT configurado com sucesso!");
      }
      loadCat();
    } catch (err: unknown) {
      let msg = "Erro ao salvar.";
      if (err instanceof Error) { try { const p = JSON.parse(err.message); msg = Array.isArray(p.message) ? p.message.join(", ") : p.message ?? msg; } catch { msg = err.message; } }
      catToast("error", msg);
    } finally { setSaving(false); }
  };

  const displayedVideoUrl = videoCleared || newVideo ? null : (cat?.videoUrl ?? null);

  // CAT Móvel handlers
  function openMovelModal() {
    setMovelForm({ titulo: movel?.titulo ?? "", descricao: movel?.descricao ?? "" });
    setMovelImagem(null); setMovelVideo(null);
    setMovelGaleria((movel?.imagensUrl ?? []).map((url) => ({ mode: "existing" as const, url })));
    setMovelModal(true);
  }

  async function handleSaveMovel(e: React.FormEvent) {
    e.preventDefault(); setMovelSaving(true);
    try {
      const fd = new FormData();
      fd.append("titulo", movelForm.titulo);
      fd.append("descricao", movelForm.descricao);
      if (movelImagem) fd.append("imagem", movelImagem);
      if (movelVideo) fd.append("video", movelVideo);
      movelGaleria
        .filter((i): i is { mode: "new"; file: File; preview: string } => i.mode === "new")
        .forEach(({ file }) => fd.append("imagens", file));
      fd.append("ordem", JSON.stringify(buildOrdem(movelGaleria)));

      if (movel) {
        await catMovelApi.update(fd);
        movelToast("success", "CAT Móvel atualizado com sucesso!");
      } else {
        await catMovelApi.create(fd);
        movelToast("success", "CAT Móvel configurado com sucesso!");
      }
      setMovelModal(false); loadMovel();
    } catch (err: unknown) {
      let msg = "Erro ao salvar CAT Móvel.";
      if (err instanceof Error) { try { const p = JSON.parse(err.message); msg = Array.isArray(p.message) ? p.message.join(", ") : p.message ?? msg; } catch { msg = err.message; } }
      movelToast("error", msg);
    } finally { setMovelSaving(false); }
  }

  // Deriva mídia do CAT Móvel
  const movelMidia = movel ? catMovelMidia(movel) : { url: null, type: null };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-xl"><MapPin className="w-6 h-6 text-primary" /></div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">CAT</h1>
          <p className="text-sm text-muted-foreground">Gerencie o CAT Fixo e o CAT Móvel.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
        {TABS.map(({ key, label, emoji }) => (
          <button key={key} onClick={() => setActiveTab(key)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === key ? "bg-white shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
            <span>{emoji}</span>{label}
          </button>
        ))}
      </div>

      {/* ── ABA: CAT FIXO (singleton — edição inline, sem modal) ── */}
      {activeTab === "cat" && (
        <div className="space-y-4">
          {feedback && (
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border ${
              feedback.type === "success" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-red-50 text-red-800 border-red-200"
            }`}>
              <span>{feedback.type === "success" ? "✓" : "✕"}</span>{feedback.msg}
            </div>
          )}

          {loading ? (
            <div className="animate-pulse rounded-2xl border border-border bg-white p-6 space-y-5">
              <div className="h-4 w-40 rounded bg-muted" />
              <div className="h-28 w-full rounded bg-muted" />
              <div className="h-24 w-full rounded bg-muted" />
            </div>
          ) : (
            <div className="rounded-2xl border border-border bg-white shadow-sm p-6">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-foreground">Informações do CAT</h2>
                <p className="text-sm text-muted-foreground">
                  {cat
                    ? "Edite o conteúdo exibido na página pública do CAT."
                    : "Configure o conteúdo da página pública do CAT."}
                </p>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                <AdminFormField label="Texto descritivo" value={texto} onChange={(value) => setTexto(value.slice(0, 5000))} maxLength={5000} multiline required />
                <ImageManager images={images} onChange={setImages} />
                <VideoUpload newFile={newVideo} existingUrl={displayedVideoUrl} onChange={(f) => { setNewVideo(f); setVideoCleared(false); }} onClear={() => { setNewVideo(null); setVideoCleared(true); }} />
                {videoCleared && !newVideo && (
                  <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-800/50 dark:bg-amber-950/30 dark:text-amber-400">⚠️ O vídeo será mantido no servidor até você enviar um novo arquivo no lugar.</p>
                )}

                <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border pt-4">
                  {cat && (
                    <button type="button" onClick={loadCat} disabled={saving} className="flex items-center gap-1.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted disabled:opacity-50">
                      <RefreshCw className="h-3.5 w-3.5" /> Descartar alterações
                    </button>
                  )}
                  <button type="submit" disabled={saving} className="flex items-center gap-2 rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50">
                    <Save className="h-4 w-4" />
                    {saving ? "Salvando..." : cat ? "Salvar alterações" : "Configurar CAT"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ── ABA: CAT MÓVEL ── */}
      {activeTab === "cat-movel" && (
        <div className="space-y-4">
          {movelFeedback && (
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border ${
              movelFeedback.type === "success" ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-red-50 text-red-800 border-red-200"
            }`}>
              <span>{movelFeedback.type === "success" ? "✓" : "✕"}</span>{movelFeedback.msg}
            </div>
          )}

          {movelLoading && <div className="animate-pulse"><div className="h-40 rounded-2xl bg-muted" /></div>}

          {!movelLoading && !movel && (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 py-20 text-center">
              <p className="text-4xl mb-4">📍</p>
              <p className="text-base font-semibold text-foreground mb-1">CAT Móvel ainda não configurado</p>
              <p className="text-sm text-muted-foreground mb-6">Clique abaixo para configurar o CAT Móvel pela primeira vez.</p>
              <button onClick={openMovelModal} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-sm">
                <Plus className="w-4 h-4" /> Configurar CAT Móvel
              </button>
            </div>
          )}

          {!movelLoading && movel && (
            <div className="rounded-2xl border border-border bg-white shadow-sm overflow-hidden">
              {movelMidia.url && (() => {
                const src = safeMediaUrl(movelMidia.url);
                return src ? (
                  <div className="relative aspect-[16/9] w-full bg-muted">
                    {movelMidia.type === "video"
                      ? <video src={src} controls className="w-full h-full object-cover" />
                      : <Image src={src} alt={movel.titulo} fill className="object-cover" />}
                  </div>
                ) : null;
              })()}
              <div className="p-6 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-foreground mb-1">{movel.titulo}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{movel.descricao}</p>
                  {movelMidia.type && (
                    <div className="mt-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                        {movelMidia.type === "video" ? <Video size={11} /> : <ImagePlus size={11} />}
                        {movelMidia.type === "video" ? "Vídeo" : "Imagem"}
                      </span>
                    </div>
                  )}
                </div>
                <button onClick={openMovelModal} className="shrink-0 flex items-center gap-2 border border-border hover:bg-muted px-3 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                  <Pencil className="w-4 h-4" /> Editar
                </button>
              </div>
            </div>
          )}

          {!movelLoading && (
            <button onClick={loadMovel} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <RefreshCw className="w-3 h-3" /> Recarregar
            </button>
          )}
        </div>
      )}

      {/* ── MODAL CAT MÓVEL ── */}
      {movelModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4 pb-4 sm:pb-0">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b border-border sticky top-0 bg-white z-10">
              <h2 className="text-base font-semibold">{movel ? "Editar CAT Móvel" : "Configurar CAT Móvel"}</h2>
              <button onClick={() => setMovelModal(false)} aria-label="Fechar" className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSaveMovel} className="px-6 py-5 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Título *</label>
                <input value={movelForm.titulo} onChange={(e) => setMovelForm((f) => ({ ...f, titulo: e.target.value.slice(0, 150) }))} maxLength={150} required className="w-full border border-input rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition" placeholder="Título do CAT Móvel" />
                <div className="mt-1 flex justify-end text-[10px] text-muted-foreground"><span>{movelForm.titulo.length}/150</span></div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Descrição *</label>
                <textarea value={movelForm.descricao} onChange={(e) => setMovelForm((f) => ({ ...f, descricao: e.target.value.slice(0, 5000) }))} maxLength={5000} required rows={4} className="w-full border border-input rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none transition" placeholder="Descrição do CAT Móvel" />
                <div className="mt-1 flex justify-end text-[10px] text-muted-foreground"><span>{movelForm.descricao.length}/5000</span></div>
              </div>

              {/* Imagem */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                  Imagem <span className="normal-case font-normal text-muted-foreground/70">(substitui a atual)</span>
                </label>
                {movelImagem ? (
                  <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2.5">
                    <ImagePlus className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm text-primary truncate flex-1">{movelImagem.name}</span>
                    <button type="button" onClick={() => setMovelImagem(null)} className="text-muted-foreground hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <button type="button" onClick={() => movelImagemRef.current?.click()} className="flex w-full items-center gap-2 rounded-xl border-2 border-dashed border-border px-3 py-3 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                    <ImagePlus className="w-4 h-4" />
                    {movelMidia.type === "image" ? "Trocar imagem atual" : "Selecionar imagem"}
                  </button>
                )}
                <input ref={movelImagemRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setMovelImagem(f); setMovelVideo(null); } }} />
              </div>

              {/* Vídeo */}
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                  Vídeo <span className="normal-case font-normal text-muted-foreground/70">(substitui o atual)</span>
                </label>
                {movelVideo ? (
                  <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2.5">
                    <Play className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-sm text-primary truncate flex-1">{movelVideo.name}</span>
                    <button type="button" onClick={() => setMovelVideo(null)} className="text-muted-foreground hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <button type="button" onClick={() => movelVideoRef.current?.click()} className="flex w-full items-center gap-2 rounded-xl border-2 border-dashed border-border px-3 py-3 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                    <Play className="w-4 h-4" />
                    {movelMidia.type === "video" ? "Trocar vídeo atual" : "Selecionar vídeo"}
                  </button>
                )}
                <input ref={movelVideoRef} type="file" accept="video/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setMovelVideo(f); setMovelImagem(null); } }} />
                <p className="mt-1.5 text-xs text-muted-foreground">ℹ️ Selecione imagem <strong>ou</strong> vídeo. Enviar um substitui o outro.</p>
              </div>

              {/* Galeria (carrossel exibido ao lado da mídia principal) */}
              <div>
                <ImageManager images={movelGaleria} onChange={setMovelGaleria} />
                <p className="mt-1.5 text-xs text-muted-foreground">ℹ️ Exibida em carrossel ao lado da mídia principal na página pública.</p>
              </div>

              <div className="flex gap-3 justify-end pt-1">
                <button type="button" onClick={() => setMovelModal(false)} className="text-sm text-muted-foreground hover:text-foreground px-4 py-2 rounded-xl hover:bg-muted transition-colors">Cancelar</button>
                <button type="submit" disabled={movelSaving} className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors">
                  <Save className="w-4 h-4" />{movelSaving ? "Salvando..." : movel ? "Atualizar" : "Configurar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
