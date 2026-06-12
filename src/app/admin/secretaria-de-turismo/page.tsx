"use client";

import { useState, useEffect, useRef } from "react";
import { secretariaTurismoApi, turistandoApi, projetoApi } from "@/lib/api/secretaria-turismo";
import type { SecretariaTurismo, Turistando, Projeto } from "@/lib/api/types";

// ─── helpers ────────────────────────────────────────────────────────────
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const img = (url?: string | null) =>
  url ? (url.startsWith("http") ? url : `${API_URL}${url}`) : null;

type Tab = "institucional" | "turistando" | "projetos";

// ─── componente principal ────────────────────────────────────────────────
export default function SecretariaTurismoAdminPage() {
  const [secretaria, setSecretaria] = useState<SecretariaTurismo | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("institucional");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // — modal turistando
  const [modalTuristandoOpen, setModalTuristandoOpen] = useState(false);
  const [editingTuristandoId, setEditingTuristandoId] = useState<string | null>(null);
  const [turistandoForm, setTuristandoForm] = useState({ titulo: "", texto: "" });
  const [turistandoImagens, setTuristandoImagens] = useState<File[]>([]);

  // — modal projeto
  const [modalProjetoOpen, setModalProjetoOpen] = useState(false);
  const [editingProjetoId, setEditingProjetoId] = useState<string | null>(null);
  const [projetoForm, setProjetoForm] = useState({ titulo: "", descricao: "" });
  const [projetoImagem, setProjetoImagem] = useState<File | null>(null);

  // — institucional form
  const [instTexto, setInstTexto] = useState("");
  const [instVideo, setInstVideo] = useState<File | null>(null);

  // refs
  const videoInputRef = useRef<HTMLInputElement>(null);
  const imagensInputRef = useRef<HTMLInputElement>(null);
  const imagemProjetoRef = useRef<HTMLInputElement>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const data = await secretariaTurismoApi.getAll();
      const first = data[0] ?? null;
      setSecretaria(first);
      if (first) setInstTexto(first.texto ?? "");
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

  // ====== INSTITUCIONAL ======
  async function handleSaveInstitucional(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("texto", instTexto);
      if (instVideo) fd.append("video", instVideo);

      let updated: SecretariaTurismo;
      if (secretaria) {
        updated = await secretariaTurismoApi.update(secretaria.id, fd);
      } else {
        updated = await secretariaTurismoApi.create(fd);
      }
      setSecretaria(updated);
      setInstVideo(null);
      if (videoInputRef.current) videoInputRef.current.value = "";
      toast("success", "Dados institucionais salvos com sucesso!");
    } catch {
      toast("error", "Erro ao salvar dados institucionais.");
    } finally {
      setSaving(false);
    }
  }

  // ====== TURISTANDO ======
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

  // ====== PROJETOS ======
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
        <p className="text-gray-500 animate-pulse">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Secretaria de Turismo</h1>
        <p className="text-sm text-gray-500 mt-1">Gerencie o conteúdo institucional, blocos Turistando e Projetos.</p>
      </div>

      {/* feedback toast */}
      {feedback && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${
            feedback.type === "success"
              ? "bg-green-100 text-green-800 border border-green-200"
              : "bg-red-100 text-red-800 border border-red-200"
          }`}
        >
          {feedback.msg}
        </div>
      )}

      {/* tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {(["institucional", "turistando", "projetos"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {tab === "institucional" ? "Institucional" : tab === "turistando" ? "Turistando" : "Projetos"}
          </button>
        ))}
      </div>

      {/* ─── TAB: INSTITUCIONAL ─── */}
      {activeTab === "institucional" && (
        <form onSubmit={handleSaveInstitucional} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Texto institucional</label>
            <textarea
              value={instTexto}
              onChange={(e) => setInstTexto(e.target.value)}
              rows={6}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Descreva a Secretaria de Turismo..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Vídeo institucional (MP4, MOV)</label>
            {secretaria?.videoUrl && (
              <video
                src={img(secretaria.videoUrl) ?? ""}
                className="mb-2 rounded-lg max-h-48 w-full object-cover"
                controls
              />
            )}
            <input
              ref={videoInputRef}
              type="file"
              accept="video/*"
              onChange={(e) => setInstVideo(e.target.files?.[0] ?? null)}
              className="text-sm text-gray-600"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-6 py-2 rounded-lg transition-colors"
          >
            {saving ? "Salvando..." : secretaria ? "Atualizar" : "Criar"}
          </button>
        </form>
      )}

      {/* ─── TAB: TURISTANDO ─── */}
      {activeTab === "turistando" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">{secretaria?.turistando?.length ?? 0} bloco(s) cadastrado(s)</p>
            <button
              onClick={openAddTuristando}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              + Adicionar Turistando
            </button>
          </div>

          {!secretaria?.turistando?.length ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">🌄</p>
              <p className="text-sm">Nenhum bloco Turistando ainda.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {secretaria.turistando.map((t) => (
                <div key={t.id} className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-800 text-sm mb-1">{t.titulo}</h3>
                      <p className="text-xs text-gray-500 line-clamp-2">{t.texto}</p>
                      {t.imagensUrl?.length > 0 && (
                        <div className="flex gap-2 mt-2 flex-wrap">
                          {t.imagensUrl.slice(0, 4).map((u, i) => (
                            <img
                              key={i}
                              src={img(u) ?? ""}
                              alt=""
                              className="w-12 h-12 object-cover rounded-md border border-gray-100"
                            />
                          ))}
                          {t.imagensUrl.length > 4 && (
                            <span className="text-xs text-gray-400 self-center">+{t.imagensUrl.length - 4}</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => openEditTuristando(t)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteTuristando(t.id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB: PROJETOS ─── */}
      {activeTab === "projetos" && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-500">{secretaria?.projetos?.length ?? 0} projeto(s) cadastrado(s)</p>
            <button
              onClick={openAddProjeto}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              + Adicionar Projeto
            </button>
          </div>

          {!secretaria?.projetos?.length ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">📌</p>
              <p className="text-sm">Nenhum projeto cadastrado ainda.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {secretaria.projetos.map((p) => (
                <div key={p.id} className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                  {p.imagemUrl && (
                    <img
                      src={img(p.imagemUrl) ?? ""}
                      alt={p.titulo}
                      className="w-full h-32 object-cover"
                    />
                  )}
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-800 text-sm mb-1">{p.titulo}</h3>
                    <p className="text-xs text-gray-500 line-clamp-2">{p.descricao}</p>
                    <div className="flex gap-3 mt-3">
                      <button
                        onClick={() => openEditProjeto(p)}
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteProjeto(p.id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Remover
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── MODAL: TURISTANDO ─── */}
      {modalTuristandoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-semibold text-gray-800">
                {editingTuristandoId ? "Editar Turistando" : "Novo Turistando"}
              </h2>
              <button onClick={() => setModalTuristandoOpen(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveTuristando} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  value={turistandoForm.titulo}
                  onChange={(e) => setTuristandoForm((f) => ({ ...f, titulo: e.target.value }))}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Título do bloco"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Texto</label>
                <textarea
                  value={turistandoForm.texto}
                  onChange={(e) => setTuristandoForm((f) => ({ ...f, texto: e.target.value }))}
                  required
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Descrição do bloco Turistando"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imagens (até 10)
                </label>
                <input
                  ref={imagensInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => setTuristandoImagens(Array.from(e.target.files ?? []))}
                  className="text-sm text-gray-600"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setModalTuristandoOpen(false)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
                >
                  {saving ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── MODAL: PROJETO ─── */}
      {modalProjetoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-base font-semibold text-gray-800">
                {editingProjetoId ? "Editar Projeto" : "Novo Projeto"}
              </h2>
              <button onClick={() => setModalProjetoOpen(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>
            <form onSubmit={handleSaveProjeto} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                <input
                  value={projetoForm.titulo}
                  onChange={(e) => setProjetoForm((f) => ({ ...f, titulo: e.target.value }))}
                  required
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome do projeto"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <textarea
                  value={projetoForm.descricao}
                  onChange={(e) => setProjetoForm((f) => ({ ...f, descricao: e.target.value }))}
                  required
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Descrição do projeto ou curso"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Imagem de capa</label>
                <input
                  ref={imagemProjetoRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProjetoImagem(e.target.files?.[0] ?? null)}
                  className="text-sm text-gray-600"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setModalProjetoOpen(false)}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
                >
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
