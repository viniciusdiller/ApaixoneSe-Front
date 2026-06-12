"use client";

import { useState, useEffect, useRef } from "react";
import { Landmark, ImagePlus, Video, Plus, Pencil, Trash2, X, Save } from "lucide-react";
import { secretariaTurismoApi, turistandoApi, projetoApi } from "@/lib/api/secretaria-turismo";
import type { SecretariaTurismo, Turistando, Projeto } from "@/lib/api/types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const img = (url?: string | null) =>
  url ? (url.startsWith("http") ? url : `${API_URL}${url}`) : null;

type Tab = "institucional" | "turistando" | "projetos";

const TABS: { key: Tab; label: string; emoji: string }[] = [
  { key: "institucional", label: "Institucional", emoji: "🏛️" },
  { key: "turistando",    label: "Turistando",    emoji: "🌄" },
  { key: "projetos",      label: "Projetos",       emoji: "📌" },
];

export default function SecretariaTurismoAdminPage() {
  const [secretaria, setSecretaria] = useState<SecretariaTurismo | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("institucional");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const [modalTuristandoOpen, setModalTuristandoOpen] = useState(false);
  const [editingTuristandoId, setEditingTuristandoId] = useState<string | null>(null);
  const [turistandoForm, setTuristandoForm] = useState({ titulo: "", texto: "" });
  const [turistandoImagens, setTuristandoImagens] = useState<File[]>([]);

  const [modalProjetoOpen, setModalProjetoOpen] = useState(false);
  const [editingProjetoId, setEditingProjetoId] = useState<string | null>(null);
  const [projetoForm, setProjetoForm] = useState({ titulo: "", descricao: "" });
  const [projetoImagem, setProjetoImagem] = useState<File | null>(null);

  const [instTexto, setInstTexto] = useState("");
  const [instVideo, setInstVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);

  const videoInputRef    = useRef<HTMLInputElement>(null);
  const imagensInputRef  = useRef<HTMLInputElement>(null);
  const imagemProjetoRef = useRef<HTMLInputElement>(null);

  useEffect(() => { load(); }, []);

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
    if (!secretaria) return toast("error", "Crie primeiro o bloco institucional.");
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
    if (!confirm("Remover este Turistando?")) return;
    try {
      await turistandoApi.remove(id);
      toast("success", "Turistando removido.");
      await load();
    } catch {
      toast("error", "Erro ao remover Turistando.");
    }
  }

  // ── PROJETOS ───────────────────────────────────────────────────────────────
  function openAddProjeto() {
    setEditingProjetoId(null);
    setProjetoForm({ titulo: "", descricao: "" });
    setProjetoImagem(null);
    setModalProjetoOpen(true);
  }

  function openEditProjeto(p: Projeto) {
    setEditingProjetoId(p.id);
    setProjetoForm({ titulo: p.titulo, descricao: p.descricao });
    setProjetoImagem(null);
    setModalProjetoOpen(true);
  }

  async function handleSaveProjeto(e: React.FormEvent) {
    e.preventDefault();
    if (!secretaria) return toast("error", "Crie primeiro o bloco institucional.");
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("titulo", projetoForm.titulo);
      fd.append("descricao", projetoForm.descricao);
      if (projetoImagem) fd.append("imagem", projetoImagem);
      if (editingProjetoId) {
        await projetoApi.update(editingProjetoId, fd);
        toast("success", "Projeto atualizado!");
      } else {
        await projetoApi.add(secretaria.id, fd);
        toast("success", "Projeto adicionado!");
      }
      setModalProjetoOpen(false);
      await load();
    } catch {
      toast("error", "Erro ao salvar Projeto.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteProjeto(id: string) {
    if (!confirm("Remover este Projeto?")) return;
    try {
      await projetoApi.remove(id);
      toast("success", "Projeto removido.");
      await load();
    } catch {
      toast("error", "Erro ao remover Projeto.");
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">

      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-xl">
          <Landmark className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Secretaria de Turismo</h1>
          <p className="text-sm text-muted-foreground">Gerencie o conteúdo institucional, Turistando e Projetos.</p>
        </div>
      </div>

      {feedback && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border ${
          feedback.type === "success"
            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
            : "bg-red-50 text-red-800 border-red-200"
        }`}>
          <span>{feedback.type === "success" ? "✓" : "✕"}</span>
          {feedback.msg}
        </div>
      )}

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

      {/* ── INSTITUCIONAL ── */}
      {activeTab === "institucional" && (
        <form onSubmit={handleSaveInstitucional} className="space-y-6">
          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-base">📝</span>
              <h2 className="text-sm font-semibold">Texto institucional</h2>
            </div>
            <textarea
              value={instTexto}
              onChange={(e) => setInstTexto(e.target.value)}
              rows={7}
              required
              className="w-full border border-input rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none transition"
              placeholder="Descreva a Secretaria de Turismo..."
            />
          </div>

          <div className="bg-white border border-border rounded-2xl p-6 shadow-sm space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Video className="w-4 h-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold">Vídeo institucional</h2>
              <span className="ml-auto text-xs text-muted-foreground">MP4, MOV</span>
            </div>
            {(videoPreview ?? img(secretaria?.videoUrl)) && (
              <video
                src={videoPreview ?? img(secretaria?.videoUrl) ?? ""}
                className="w-full max-h-52 rounded-xl object-cover border border-border"
                controls
              />
            )}
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-border rounded-xl text-sm text-muted-foreground group-hover:border-primary group-hover:text-primary transition-colors">
                <ImagePlus className="w-4 h-4" />
                {instVideo ? instVideo.name : "Selecionar vídeo"}
              </div>
              <input ref={videoInputRef} type="file" accept="video/*" onChange={handleVideoChange} className="hidden" />
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              {saving ? "Salvando..." : secretaria ? "Salvar alterações" : "Criar"}
            </button>
          </div>
        </form>
      )}

      {/* ── TURISTANDO ── */}
      {activeTab === "turistando" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {secretaria?.turistandos?.length ?? 0} bloco(s) cadastrado(s)
            </p>
            <button
              onClick={openAddTuristando}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Adicionar Turistando
            </button>
          </div>

          {!secretaria?.turistandos?.length ? (
            <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl text-muted-foreground">
              <p className="text-4xl mb-3">🌄</p>
              <p className="text-sm font-medium">Nenhum bloco Turistando ainda.</p>
              <p className="text-xs mt-1">Clique em "Adicionar" para começar.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {secretaria.turistandos.map((t) => (
                <div key={t.id} className="bg-white border border-border rounded-2xl p-4 shadow-sm flex gap-4 items-start">
                  {t.imagensUrl?.[0] && (
                    <img src={img(t.imagensUrl[0]) ?? ""} alt="" className="w-16 h-16 object-cover rounded-xl border border-border shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-0.5">{t.titulo}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{t.texto}</p>
                    {t.imagensUrl?.length > 1 && (
                      <p className="text-xs text-muted-foreground mt-1">{t.imagensUrl.length} imagens</p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button onClick={() => openEditTuristando(t)} className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Editar">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteTuristando(t.id)} className="p-2 rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-red-500" title="Remover">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── PROJETOS ── */}
      {activeTab === "projetos" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {secretaria?.projetos?.length ?? 0} projeto(s) cadastrado(s)
            </p>
            <button
              onClick={openAddProjeto}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Adicionar Projeto
            </button>
          </div>

          {!secretaria?.projetos?.length ? (
            <div className="text-center py-20 border-2 border-dashed border-border rounded-2xl text-muted-foreground">
              <p className="text-4xl mb-3">📌</p>
              <p className="text-sm font-medium">Nenhum projeto cadastrado ainda.</p>
              <p className="text-xs mt-1">Clique em "Adicionar" para começar.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {secretaria.projetos.map((p) => (
                <div key={p.id} className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm group">
                  {p.imagemUrl ? (
                    <img src={img(p.imagemUrl) ?? ""} alt={p.titulo} className="w-full h-36 object-cover" />
                  ) : (
                    <div className="w-full h-36 bg-muted flex items-center justify-center text-muted-foreground">
                      <ImagePlus className="w-6 h-6" />
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-sm mb-1">{p.titulo}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2">{p.descricao}</p>
                    <div className="flex gap-2 mt-3">
                      <button onClick={() => openEditProjeto(p)} className="flex items-center gap-1.5 text-xs font-medium text-primary hover:underline">
                        <Pencil className="w-3 h-3" /> Editar
                      </button>
                      <button onClick={() => handleDeleteProjeto(p.id)} className="flex items-center gap-1.5 text-xs font-medium text-red-500 hover:underline">
                        <Trash2 className="w-3 h-3" /> Remover
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── MODAL TURISTANDO ── */}
      {modalTuristandoOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4 pb-4 sm:pb-0">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex justify-between items-center px-6 py-4 border-b border-border">
              <h2 className="text-base font-semibold">{editingTuristandoId ? "Editar Turistando" : "Novo Turistando"}</h2>
              <button onClick={() => setModalTuristandoOpen(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSaveTuristando} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Título</label>
                <input value={turistandoForm.titulo} onChange={(e) => setTuristandoForm((f) => ({ ...f, titulo: e.target.value }))} required className="w-full border border-input rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition" placeholder="Título do bloco" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Texto</label>
                <textarea value={turistandoForm.texto} onChange={(e) => setTuristandoForm((f) => ({ ...f, texto: e.target.value }))} required rows={4} className="w-full border border-input rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none transition" placeholder="Descrição do bloco" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Imagens <span className="normal-case font-normal">(até 10)</span></label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="flex items-center gap-2 px-3 py-2 border-2 border-dashed border-border rounded-xl text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                    <ImagePlus className="w-4 h-4" />
                    {turistandoImagens.length > 0 ? `${turistandoImagens.length} arquivo(s) selecionado(s)` : "Selecionar imagens"}
                  </div>
                  <input ref={imagensInputRef} type="file" accept="image/*" multiple onChange={(e) => setTuristandoImagens(Array.from(e.target.files ?? []))} className="hidden" />
                </label>
              </div>
              <div className="flex gap-3 justify-end pt-1">
                <button type="button" onClick={() => setModalTuristandoOpen(false)} className="text-sm text-muted-foreground hover:text-foreground px-4 py-2 rounded-xl hover:bg-muted transition-colors">Cancelar</button>
                <button type="submit" disabled={saving} className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors">
                  <Save className="w-4 h-4" />{saving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL PROJETO ── */}
      {modalProjetoOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 px-4 pb-4 sm:pb-0">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex justify-between items-center px-6 py-4 border-b border-border">
              <h2 className="text-base font-semibold">{editingProjetoId ? "Editar Projeto" : "Novo Projeto"}</h2>
              <button onClick={() => setModalProjetoOpen(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"><X className="w-4 h-4" /></button>
            </div>
            <form onSubmit={handleSaveProjeto} className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Título</label>
                <input value={projetoForm.titulo} onChange={(e) => setProjetoForm((f) => ({ ...f, titulo: e.target.value }))} required className="w-full border border-input rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition" placeholder="Nome do projeto" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Descrição</label>
                <textarea value={projetoForm.descricao} onChange={(e) => setProjetoForm((f) => ({ ...f, descricao: e.target.value }))} required rows={4} className="w-full border border-input rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none transition" placeholder="Descrição do projeto" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Imagem de capa</label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <div className="flex items-center gap-2 px-3 py-2 border-2 border-dashed border-border rounded-xl text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                    <ImagePlus className="w-4 h-4" />
                    {projetoImagem ? projetoImagem.name : "Selecionar imagem"}
                  </div>
                  <input ref={imagemProjetoRef} type="file" accept="image/*" onChange={(e) => setProjetoImagem(e.target.files?.[0] ?? null)} className="hidden" />
                </label>
              </div>
              <div className="flex gap-3 justify-end pt-1">
                <button type="button" onClick={() => setModalProjetoOpen(false)} className="text-sm text-muted-foreground hover:text-foreground px-4 py-2 rounded-xl hover:bg-muted transition-colors">Cancelar</button>
                <button type="submit" disabled={saving} className="flex items-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors">
                  <Save className="w-4 h-4" />{saving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
