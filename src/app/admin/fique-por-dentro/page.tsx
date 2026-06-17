"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  GalleryHorizontal,
  Loader2,
  Pencil,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  UploadCloud,
  X,
  ArrowLeftRight,
} from "lucide-react";
import { fiquePorDentroApi } from "@/lib/api/fique-por-dentro";
import type { FiquePorDentro } from "@/lib/api/types";
import { safeMediaUrl } from "@/lib/safeMediaUrl";
import { AdminModal } from "@/components/admin/AdminModal";
import { LoadingGrid } from "@/components/ui/LoadingGrid";

type ModalMode = "create" | "edit";

interface FormState {
  ordem: string;
  file: File | null;
}

const EMPTY_FORM: FormState = { ordem: "", file: null };

// ─── Upload de imagem simples ────────────────────────────────────────────────
function SingleImageUpload({
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
  const inputRef = useRef<HTMLInputElement>(null);
  const previewSrc = file ? URL.createObjectURL(file) : safeMediaUrl(existingUrl);

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Imagem
      </label>
      {previewSrc ? (
        <div className="relative overflow-hidden rounded-xl border border-border">
          <div className="relative aspect-[4/3] w-full">
            <Image src={previewSrc} alt="Preview" fill className="object-cover" />
          </div>
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs text-white hover:bg-red-600 transition-colors"
          >
            <X size={12} />
            {file ? "Cancelar" : "Trocar imagem"}
          </button>
          {file && (
            <span className="absolute bottom-2 left-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-primary-foreground">
              NOVA
            </span>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/30 py-10 text-sm text-muted-foreground transition hover:border-primary hover:text-primary"
        >
          <UploadCloud size={24} />
          <span>Clique para selecionar uma imagem</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onChange(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ─── Página principal ────────────────────────────────────────────────────────
export default function AdminFiquePorDentroPage() {
  const [items, setItems] = useState<FiquePorDentro[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  const [modal, setModal] = useState<{
    open: boolean;
    mode: ModalMode;
    editing: FiquePorDentro | null;
  }>({ open: false, mode: "create", editing: null });
  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  // item que ocupa a posição selecionada (diferente do que está sendo editado)
  const swapTarget =
    items.find((it) => it.ordem === form.ordem && it.id !== modal.editing?.id) ?? null;

  const load = () => {
    setLoading(true);
    fiquePorDentroApi
      .getAll()
      .then((data) =>
        setItems([...data].sort((a, b) => Number(a.ordem) - Number(b.ordem)))
      )
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  function toast(type: "success" | "error", msg: string) {
    setFeedback({ type, msg });
    setTimeout(() => setFeedback(null), 4000);
  }

  function openCreate() {
    setForm(EMPTY_FORM);
    setError("");
    setModal({ open: true, mode: "create", editing: null });
  }

  function openEdit(item: FiquePorDentro) {
    setForm({ ordem: item.ordem, file: null });
    setError("");
    setModal({ open: true, mode: "edit", editing: item });
  }

  function closeModal() {
    setModal((m) => ({ ...m, open: false }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.ordem.trim()) { setError("Selecione uma posição."); return; }
    if (modal.mode === "create" && !form.file) { setError("Selecione uma imagem."); return; }

    setSaving(true);
    try {
      if (modal.mode === "create") {
        // ── Criar ──────────────────────────────────────────────────────────
        const fd = new FormData();
        fd.append("ordem", form.ordem);
        if (form.file) fd.append("imagem", form.file);
        await fiquePorDentroApi.create(fd);
        toast("success", "Imagem adicionada com sucesso!");

      } else if (modal.editing) {
        const ordemOriginal = modal.editing.ordem;
        const ordemNova = form.ordem;

        if (swapTarget) {
          // ── Swap com 3 passos para evitar conflito de unique constraint ──
          //
          // Passo 1: move o ocupante para uma posição temporária (999)
          //          assim a posição nova fica livre
          const fdTemp = new FormData();
          fdTemp.append("ordem", "999");
          await fiquePorDentroApi.update(swapTarget.id, fdTemp);

          // Passo 2: move o item editado para a posição desejada
          const fdMain = new FormData();
          fdMain.append("ordem", ordemNova);
          if (form.file) fdMain.append("imagem", form.file);
          await fiquePorDentroApi.update(modal.editing.id, fdMain);

          // Passo 3: move o ocupante (agora em 999) para a posição original
          const fdSwap = new FormData();
          fdSwap.append("ordem", ordemOriginal);
          await fiquePorDentroApi.update(swapTarget.id, fdSwap);

          toast("success", `Posições ${ordemOriginal} e ${ordemNova} trocadas com sucesso!`);
        } else {
          // ── Edição simples (posição livre ou só troca de imagem) ──────────
          const fd = new FormData();
          fd.append("ordem", ordemNova);
          if (form.file) fd.append("imagem", form.file);
          await fiquePorDentroApi.update(modal.editing.id, fd);
          toast("success", "Imagem atualizada!");
        }
      }

      closeModal();
      load();
    } catch (err: unknown) {
      let msg = "Erro ao salvar.";
      if (err instanceof Error) {
        try {
          const p = JSON.parse(err.message);
          msg = Array.isArray(p.message) ? p.message.join(", ") : p.message ?? msg;
        } catch { msg = err.message; }
      }
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: FiquePorDentro) {
    if (!confirm(`Excluir a imagem da posição ${item.ordem}?`)) return;
    try {
      await fiquePorDentroApi.remove(item.id);
      toast("success", "Imagem removida.");
      load();
    } catch {
      toast("error", "Erro ao remover.");
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-xl">
          <GalleryHorizontal className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Fique Por Dentro</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie as imagens da seção &quot;Fique Por Dentro&quot; da home (máx. 5 imagens).
          </p>
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium border ${
          feedback.type === "success"
            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
            : "bg-red-50 text-red-800 border-red-200"
        }`}>
          <span>{feedback.type === "success" ? "✓" : "✗"}</span>
          {feedback.msg}
        </div>
      )}

      {/* Barra de ações */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {items.length}/5 imagem{items.length !== 1 ? "ns" : ""} cadastrada{items.length !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className="w-3 h-3" /> Recarregar
          </button>
          <button
            onClick={openCreate}
            disabled={items.length >= 5}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Plus className="h-4 w-4" /> Nova Imagem
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <LoadingGrid count={4} />
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 py-20 text-center">
          <p className="text-4xl mb-4">🖼️</p>
          <p className="text-base font-semibold mb-1">Nenhuma imagem cadastrada</p>
          <p className="text-sm text-muted-foreground mb-6">
            Adicione até 5 imagens para a seção &quot;Fique Por Dentro&quot;.
          </p>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> Adicionar Imagem
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {items.map((item, i) => {
            const src = safeMediaUrl(item.imagemUrl);
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="group relative aspect-[3/4] overflow-hidden rounded-2xl border-2 border-border bg-muted"
              >
                {src && (
                  <Image
                    src={src}
                    alt={`Posição ${item.ordem}`}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-xs font-bold text-white">
                  #{item.ordem}
                </span>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    onClick={() => openEdit(item)}
                    className="flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-white transition-colors"
                  >
                    <Pencil size={13} /> Editar
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="flex items-center gap-1.5 rounded-lg bg-red-500/90 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600 transition-colors"
                  >
                    <Trash2 size={13} /> Excluir
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      <AdminModal
        title={modal.mode === "create" ? "Nova Imagem" : "Editar Imagem"}
        open={modal.open}
        onClose={closeModal}
      >
        <form onSubmit={handleSave} className="space-y-5">

          {/* Campo posição */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
              Posição no carrossel *
            </label>
            <select
              value={form.ordem}
              onChange={(e) => setForm((f) => ({ ...f, ordem: e.target.value }))}
              required
              className="w-full border border-input rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition bg-background"
            >
              <option value="">Selecione uma posição…</option>
              {["1", "2", "3", "4", "5"].map((v) => {
                const ocupante = items.find(
                  (it) => it.ordem === v && it.id !== modal.editing?.id
                );
                const isAtual = modal.editing?.ordem === v;
                return (
                  <option key={v} value={v}>
                    Posição {v}
                    {isAtual ? " (atual)" : ocupante ? " ↔ trocar com esta" : " (livre)"}
                  </option>
                );
              })}
            </select>

            {/* Aviso de swap */}
            {swapTarget && (
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-300">
                <ArrowLeftRight size={13} className="shrink-0" />
                <span>
                  A posição {form.ordem} está ocupada. Ao salvar, as posições{" "}
                  <strong>{modal.editing?.ordem}</strong> e <strong>{form.ordem}</strong> serão trocadas automaticamente.
                </span>
              </div>
            )}
          </div>

          {/* Upload */}
          <SingleImageUpload
            file={form.file}
            existingUrl={modal.mode === "edit" ? modal.editing?.imagemUrl : null}
            onChange={(f) => setForm((prev) => ({ ...prev, file: f }))}
            onClear={() => setForm((prev) => ({ ...prev, file: null }))}
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
              className="rounded-md border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {saving ? (
                <><Loader2 size={14} className="animate-spin" /> Salvando...</>
              ) : swapTarget ? (
                <><ArrowLeftRight size={14} /> Trocar Posições</>
              ) : (
                <><Save size={14} /> Salvar</>
              )}
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}
