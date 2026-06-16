"use client";

import { useEffect, useRef, useState } from "react";
import { fiquePorDentroApi } from "@/lib/api/fique-por-dentro";
import type { FiquePorDentro } from "@/lib/api/fique-por-dentro";
import { LoadingGrid } from "@/components/ui/LoadingGrid";
import { safeMediaUrl } from "@/lib/safeMediaUrl";
import { Trash2, UploadCloud, CheckCircle2 } from "lucide-react";
import Image from "next/image";

// As 5 posições fixas da galeria
const ORDENS = ["1", "2", "3", "4", "5"] as const;
type Ordem = (typeof ORDENS)[number];

// ─── SlotCard ─────────────────────────────────────────────────────────────────
// Representa cada uma das 5 posições. Se vazio: botão de upload.
// Se preenchido: exibe a imagem + botão de deletar.

function SlotCard({
  ordem,
  item,
  onUpload,
  onDelete,
}: {
  ordem: Ordem;
  item: FiquePorDentro | undefined;
  onUpload: (ordem: Ordem, file: File) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setLoading(true);
    try {
      await onUpload(ordem, file);
    } catch (err: unknown) {
      let msg = "Erro ao enviar imagem.";
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
      setLoading(false);
      // Reseta o input para permitir re-upload do mesmo arquivo
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDelete = async () => {
    if (!item) return;
    if (!confirm(`Remover imagem da posição ${ordem}?`)) return;
    setLoading(true);
    try {
      await onDelete(item.id);
    } finally {
      setLoading(false);
    }
  };

  const src = item ? safeMediaUrl(item.imagemUrl) : null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Posição {ordem}
        </span>
        {item && (
          <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
            <CheckCircle2 size={12} /> Preenchida
          </span>
        )}
      </div>

      <div
        className={`relative aspect-video w-full overflow-hidden rounded-xl border-2 transition ${
          item
            ? "border-border bg-black"
            : "border-dashed border-border bg-muted/30"
        } ${loading ? "opacity-60" : ""}`}
      >
        {src ? (
          <>
            <Image src={src} alt={`Posição ${ordem}`} fill className="object-cover" />
            <button
              type="button"
              onClick={handleDelete}
              disabled={loading}
              title="Remover imagem"
              className="absolute right-2 top-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs text-white transition hover:bg-red-600 disabled:opacity-50"
            >
              <Trash2 size={12} /> Remover
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            className="flex h-full w-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground transition hover:text-primary disabled:opacity-50"
          >
            <UploadCloud size={24} />
            <span>{loading ? "Enviando..." : "Clique para enviar"}</span>
          </button>
        )}

        {/* Botão de substituição quando já existe imagem */}
        {src && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={loading}
            title="Substituir imagem"
            className="absolute bottom-2 right-2 flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs text-white transition hover:bg-primary disabled:opacity-50"
          >
            <UploadCloud size={12} /> Substituir
          </button>
        )}
      </div>

      {error && (
        <p className="rounded bg-red-50 px-2 py-1 text-xs text-red-500 dark:bg-red-950/30">
          {error}
        </p>
      )}

      {/* Input oculto — aceita apenas imagens */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function AdminFiquePorDentroPage() {
  const [items, setItems] = useState<FiquePorDentro[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    fiquePorDentroApi
      .getAll()
      .then(setItems)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  // Mapeia ordem → item para lookup rápido
  const byOrdem = Object.fromEntries(items.map((i) => [i.ordem, i])) as Record<
    Ordem,
    FiquePorDentro | undefined
  >;

  const handleUpload = async (ordem: Ordem, file: File) => {
    const fd = new FormData();
    fd.append("ordem", ordem);
    fd.append("imagem", file);
    await fiquePorDentroApi.create(fd);
    load();
  };

  const handleDelete = async (id: string) => {
    await fiquePorDentroApi.remove(id);
    load();
  };

  const filled = items.length;

  return (
    <div>
      {/* Cabeçalho */}
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold uppercase tracking-widest">
          Fique Por Dentro
        </h1>
        <p className="text-sm text-muted-foreground">
          Galeria de até 5 imagens —{" "}
          <span
            className={filled === 5 ? "text-green-600 dark:text-green-400" : ""}
          >
            {filled}/5 preenchidas
          </span>
        </p>
      </div>

      {loading ? (
        <LoadingGrid count={5} />
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {ORDENS.map((ordem) => (
            <SlotCard
              key={ordem}
              ordem={ordem}
              item={byOrdem[ordem]}
              onUpload={handleUpload}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Regras de negócio */}
      <div className="mt-8 rounded-xl border border-border bg-muted/30 p-4 text-xs text-muted-foreground">
        <p className="font-semibold">Regras da galeria:</p>
        <ul className="mt-1 list-disc pl-4 space-y-0.5">
          <li>Máximo de 5 imagens, cada uma em uma posição fixa (1 a 5).</li>
          <li>Posições já preenchidas retornarão erro 409 se você tentar enviar novamente — use "Substituir" para trocar.</li>
          <li>A substituição funciona em dois passos: remover a atual e enviar a nova.</li>
          <li>Imagens são convertidas para WebP automaticamente pelo servidor.</li>
        </ul>
      </div>
    </div>
  );
}
