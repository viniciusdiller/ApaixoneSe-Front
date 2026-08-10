"use client";

import { confirmAction, notify } from "@/lib/feedback";

import { useState, useEffect, useRef } from "react";
import {
  Landmark,
  ImagePlus,
  Video,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  GripVertical,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  secretariaTurismoApi,
  turistandoApi,
} from "@/lib/api/secretaria-turismo";
import type { SecretariaTurismo, Turistando } from "@/lib/api/types";

const ITEMS_PER_PAGE = 4; // deve ser igual ao da página pública

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const img = (url?: string | null) =>
  url ? (url.startsWith("http") ? url : `${API_URL}${url}`) : null;

type Tab = "institucional" | "projetos";

const TABS: { key: Tab; label: string; emoji: string }[] = [
  { key: "institucional", label: "Institucional", emoji: "🏛️" },
  { key: "projetos", label: "Projetos", emoji: "📌" },
];

export default function SecretariaTurismoAdminPage() {
  const [secretaria, setSecretaria] = useState<SecretariaTurismo | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("institucional");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  // ── Turistando list (local copy for optimistic drag-and-drop) ───────────────
  const [turistandoList, setTuristandoList] = useState<Turistando[]>([]);
  const [reordering, setReordering] = useState(false);
  const dragIndexRef = useRef<number | null>(null);

  // ── Paginação do admin (mesma constante da página pública) ──────────────────
  const [adminPage, setAdminPage] = useState(1);
  const totalAdminPages = Math.ceil(turistandoList.length / ITEMS_PER_PAGE);
  // Itens exibidos na página atual — drag-and-drop opera sobre esses índices
  const pageStart = (adminPage - 1) * ITEMS_PER_PAGE;
  const pageEnd = pageStart + ITEMS_PER_PAGE;
  const visibleItems = turistandoList.slice(pageStart, pageEnd);

  const [modalTuristandoOpen, setModalTuristandoOpen] = useState(false);
  const [editingTuristandoId, setEditingTuristandoId] = useState<string | null>(
    null,
  );
  const [turistandoForm, setTuristandoForm] = useState({
    titulo: "",
    texto: "",
  });
  const [turistandoImagens, setTuristandoImagens] = useState<File[]>([]);

  const [instTexto, setInstTexto] = useState("");
  const [instVideo, setInstVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const imagensInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    load();
  }, []);

  // Sync local list whenever secretaria changes
  useEffect(() => {
    if (secretaria?.turistandos) {
      const sorted = [...secretaria.turistandos].sort(
        (a, b) => ((a as any).ordem ?? 0) - ((b as any).ordem ?? 0),
      );
      setTuristandoList(sorted);
      // Se a página atual ficou além do total, volta para a última
      setAdminPage((p) => {
        const maxPage = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
        return Math.min(p, maxPage);
      });
    } else {
      setTuristandoList([]);
      setAdminPage(1);
    }
  }, [secretaria]);

  async function load() {
    setLoading(true);
    try {
      const data = await secretariaTurismoApi.getAll();
      const first = data[0] ?? null;
      setSecretaria(first);
      if (first) setInstTexto(first.textoExplicativo ?? "");
    } catch {
      toast("error", "Erro ao carregar dados da Secretaria.");
    } finally {
      setLoading(false);
    }
  }

  function toast(type: "success" | "error", msg: string) {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 4000);
  }

  // ── INSTITUCIONAL ──────────────────────────────────────────────────────────
  async function handleSaveInstitucional(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("textoExplicativo", instTexto);
      if (instVideo) fd.append("video", instVideo);
      let updated: SecretariaTurismo;
      if (secretaria) {
        updated = await secretariaTurismoApi.update(secretaria.id, fd);
      } else {
        updated = await secretariaTurismoApi.create(fd);
      }
      setSecretaria(updated);
      setInstVideo(null);
      setVideoPreview(null);
      if (videoInputRef.current) videoInputRef.current.value = "";
      toast("success", "Dados institucionais salvos com sucesso!");
    } catch {
      toast("error", "Erro ao salvar dados institucionais.");
    } finally {
      setSaving(false);
    }
  }

  function handleVideoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    setInstVideo(file);
    setVideoPreview(file ? URL.createObjectURL(file) : null);
  }

  // ── TURISTANDO ─────────────────────────────────────────────────────────────
  function openAddTuristando() {
    setEditingTuristandoId(null);
    setTuristandoForm({ titulo: "", texto: "" });
    setTuristandoImagens([]);
    setModalTuristandoOpen(true);
  }

  function openEditTuristando(t: Turistando) {
    setEditingTuristandoId(t.id);
    setTuristandoForm({ titulo: t.titulo, texto: t.texto });
    setTuristandoImagens([]);
    setModalTuristandoOpen(true);
  }

  async function handleSaveTuristando(e: React.FormEvent) {
    e.preventDefault();
    if (!secretaria)
      return toast("error", "Crie primeiro o bloco institucional.");
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("titulo", turistandoForm.titulo);
      fd.append("texto", turistandoForm.texto);
      turistandoImagens.forEach((f) => fd.append("imagens", f));
      if (editingTuristandoId) {
        await turistandoApi.update(editingTuristandoId, fd);
        toast("success", "Turistando atualizado!");
      } else {
        await turistandoApi.add(secretaria.id, fd);
        toast("success", "Turistando adicionado!");
      }
      setModalTuristandoOpen(false);
      await load();
    } catch {
      toast("error", "Erro ao salvar Turistando.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteTuristando(id: string) {
    if (!(await confirmAction("Remover este Turistando?"))) return;
    try {
      await turistandoApi.remove(id);
      toast("success", "Turistando removido.");
      await load();
    } catch {
      toast("error", "Erro ao remover Turistando.");
    }
  }

  // ── DRAG-AND-DROP (opera nos índices globais da lista, não nos locais da página) ──
  function handleDragStart(globalIndex: number) {
    dragIndexRef.current = globalIndex;
  }

  function handleDragOver(e: React.DragEvent, globalIndex: number) {
    e.preventDefault();
    const from = dragIndexRef.current;
    if (from === null || from === globalIndex) return;

    setTuristandoList((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(globalIndex, 0, moved);
      dragIndexRef.current = globalIndex;
      return next;
    });
  }

  function handleDragEnd() {
    dragIndexRef.current = null;
    persistReorder();
  }

  async function persistReorder() {
    setReordering(true);
    try {
      const items = turistandoList.map((t, i) => ({ id: t.id, ordem: i + 1 }));
      await turistandoApi.reorder(items);
      toast("success", "Ordem salva com sucesso!");
    } catch {
      toast("error", "Erro ao salvar a ordem. Recarregando...");
      await load();
    } finally {
      setReordering(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-primary/10 p-2">
          <Landmark className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Secretaria Municipal de Esporte, Lazer e Turismo
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie o conteúdo institucional, Turistando e Projetos.
          </p>
        </div>
      </div>

      {feedback && (
        <div
          className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium ${
            feedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-red-200 bg-red-50 text-red-800"
          }`}
        >
          <span>{feedback.type === "success" ? "✓" : "✕"}</span>
          {feedback.msg}
        </div>
      )}

      <div className="flex w-fit gap-1 rounded-xl bg-muted p-1">
        {TABS.map(({ key, label, emoji }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key as Tab)}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
              activeTab === key
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span>{emoji}</span>
            {label}
          </button>
        ))}
      </div>

      {/* ── INSTITUCIONAL ── */}
      {activeTab === "institucional" && (
        <form onSubmit={handleSaveInstitucional} className="space-y-6">
          <div className="space-y-3 rounded-2xl border border-border bg-white p-6 shadow-sm">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-base">📝</span>
              <h2 className="text-sm font-semibold">
                Texto Sobre a Secretaria
              </h2>
            </div>
            <textarea
              value={instTexto}
              onChange={(e) => setInstTexto(e.target.value)}
              rows={7}
              required
              className="w-full resize-none rounded-xl border border-input px-4 py-3 text-sm transition focus:outline-none focus:ring-2 focus:ring-primary/40"
              placeholder="Descreva a Secretaria de Esporte, Lazer e Turismo..."
            />
          </div>

          <div className="space-y-3 rounded-2xl border border-border bg-white p-6 shadow-sm">
            <div className="mb-1 flex items-center gap-2">
              <Video className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Vídeo institucional</h2>
              <span className="ml-auto text-xs text-muted-foreground">
                MP4, MOV
              </span>
            </div>
            {(videoPreview ?? img(secretaria?.videoUrl)) && (
              <video
                src={videoPreview ?? img(secretaria?.videoUrl) ?? ""}
                className="max-h-52 w-full rounded-xl border border-border object-cover"
                controls
              />
            )}
            <label className="flex cursor-pointer items-center gap-3 group">
              <div className="flex items-center gap-2 rounded-xl border-2 border-dashed border-border px-4 py-2 text-sm text-muted-foreground transition-colors group-hover:border-primary group-hover:text-primary">
                <ImagePlus className="h-4 w-4" />
                {instVideo ? instVideo.name : "Selecionar vídeo"}
              </div>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoChange}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              {saving
                ? "Salvando..."
                : secretaria
                  ? "Salvar alterações"
                  : "Criar"}
            </button>
          </div>
        </form>
      )}

      {/* ── TURISTANDO (Projetos) ── */}
      {activeTab === "projetos" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {turistandoList.length} bloco(s) cadastrado(s)
              {reordering && (
                <span className="ml-2 animate-pulse text-xs text-primary">
                  Salvando ordem…
                </span>
              )}
            </p>
            <button
              onClick={openAddTuristando}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Adicionar Projeto
            </button>
          </div>

          {turistandoList.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-border py-20 text-center text-muted-foreground">
              <p className="mb-3 text-4xl">🌄</p>
              <p className="text-sm font-medium">
                Nenhum bloco Turistando ainda.
              </p>
              <p className="mt-1 text-xs">
                Clique em &ldquo;Adicionar&rdquo; para começar.
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <GripVertical className="h-3 w-3" />
                Arraste os blocos para reordenar. A ordem é salva
                automaticamente.
              </p>

              {/* Lista paginada */}
              {visibleItems.map((t, localIndex) => {
                const globalIndex = pageStart + localIndex;
                return (
                  <div
                    key={t.id}
                    draggable
                    onDragStart={() => handleDragStart(globalIndex)}
                    onDragOver={(e) => handleDragOver(e, globalIndex)}
                    onDragEnd={handleDragEnd}
                    className="flex cursor-grab select-none items-start gap-4 rounded-2xl border border-border bg-white p-4 shadow-sm transition-all active:cursor-grabbing active:scale-[0.98] active:opacity-50"
                  >
                    {/* Indicador de posição global */}
                    <div className="flex shrink-0 flex-col items-center gap-1 self-stretch pr-1 text-muted-foreground/40 transition-colors hover:text-muted-foreground">
                      <span className="text-[10px] font-semibold tabular-nums">
                        {globalIndex + 1}
                      </span>
                      <GripVertical className="h-4 w-4" />
                    </div>

                    {t.imagensUrl?.[0] && (
                      <img
                        src={img(t.imagensUrl[0]) ?? ""}
                        alt=""
                        className="h-16 w-16 shrink-0 rounded-xl border border-border object-cover"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="mb-0.5 text-sm font-semibold">
                        {t.titulo}
                      </h3>
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {t.texto}
                      </p>
                      {t.imagensUrl?.length > 1 && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {t.imagensUrl.length} imagens
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 gap-1">
                      <button
                        onClick={() => openEditTuristando(t)}
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        title="Editar"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteTuristando(t.id)}
                        className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500"
                        title="Remover"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Controles de paginação do admin */}
              {totalAdminPages > 1 && (
                <div className="mt-2 flex items-center justify-between border-t border-border pt-4">
                  <button
                    onClick={() => setAdminPage((p) => Math.max(1, p - 1))}
                    disabled={adminPage === 1}
                    className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                    Anterior
                  </button>

                  <span className="text-xs text-muted-foreground">
                    Página {adminPage} de {totalAdminPages}
                    <span className="ml-1 text-muted-foreground/60">
                      ({turistandoList.length} projetos)
                    </span>
                  </span>

                  <button
                    onClick={() =>
                      setAdminPage((p) => Math.min(totalAdminPages, p + 1))
                    }
                    disabled={adminPage === totalAdminPages}
                    className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
                  >
                    Próxima
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── MODAL TURISTANDO ── */}
      {modalTuristandoOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-4 pb-4 sm:items-center sm:pb-0">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <h2 className="text-base font-semibold">
                {editingTuristandoId ? "Editar Projeto" : "Novo Projeto"}
              </h2>
              <button
                onClick={() => setModalTuristandoOpen(false)}
                className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <form
              onSubmit={handleSaveTuristando}
              className="space-y-4 px-6 py-5"
            >
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Título
                </label>
                <input
                  value={turistandoForm.titulo}
                  onChange={(e) =>
                    setTuristandoForm((f) => ({ ...f, titulo: e.target.value }))
                  }
                  required
                  className="w-full rounded-xl border border-input px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="Título do bloco"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Texto
                </label>
                <textarea
                  value={turistandoForm.texto}
                  onChange={(e) =>
                    setTuristandoForm((f) => ({ ...f, texto: e.target.value }))
                  }
                  required
                  rows={4}
                  className="w-full resize-none rounded-xl border border-input px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-primary/40"
                  placeholder="Descrição do bloco"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Imagens{" "}
                  <span className="normal-case font-normal">(até 10)</span>
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <div className="flex items-center gap-2 rounded-xl border-2 border-dashed border-border px-3 py-2 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                    <ImagePlus className="h-4 w-4" />
                    {turistandoImagens.length > 0
                      ? `${turistandoImagens.length} arquivo(s) selecionado(s)`
                      : "Selecionar imagens"}
                  </div>
                  <input
                    ref={imagensInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) =>
                      setTuristandoImagens(Array.from(e.target.files ?? []))
                    }
                    className="hidden"
                  />
                </label>
              </div>
              <div className="flex justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setModalTuristandoOpen(false)}
                  className="rounded-xl px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
                >
                  <Save className="h-4 w-4" />
                  {saving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
