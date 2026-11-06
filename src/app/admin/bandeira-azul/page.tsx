"use client";

import { useEffect, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Flag,
  Image as ImageIcon,
  Loader2,
  Plus,
  Save,
  Trash2,
  Type,
  Upload,
  Video as VideoIcon,
  X,
} from "lucide-react";
import { bandeiraAzulApi } from "@/lib/api";
import type { BandeiraAzulBloco, BandeiraAzulMidia } from "@/lib/api";
import { safeMediaUrl } from "@/lib/safeMediaUrl";
import { confirmAction, notify } from "@/lib/feedback";

// `uid` só existe no editor (chave React); não é enviado ao backend
type BlocoEditor = BandeiraAzulBloco & { uid: string };

const novoUid = () => Math.random().toString(36).slice(2, 10);
const MAX_MIDIA_MB = 30;
const MAX_FOTOS_BANNER = 10;

const inputCls =
  "w-full rounded-xl border border-input px-4 py-2.5 text-sm transition focus:outline-none focus:ring-2 focus:ring-primary/40";

const apiToEditor = (b: BandeiraAzulBloco): BlocoEditor => ({ ...b, uid: novoUid() });
const editorToApi = ({ uid: _uid, ...b }: BlocoEditor): BandeiraAzulBloco => {
  if (b.type === "image") return { type: b.type, content: "", bgColor: b.bgColor, images: b.images ?? [] };
  if (b.type === "video") return { type: b.type, content: "", bgColor: b.bgColor, videos: b.videos ?? [] };
  return { type: b.type, content: b.content, bgColor: b.bgColor, isBold: !!b.isBold };
};

/** Botão que envia um arquivo ao backend e devolve a URL salva. */
function UploadButton({
  accept,
  label,
  onUploaded,
}: {
  accept: string;
  label: string;
  onUploaded: (url: string) => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [enviando, setEnviando] = useState(false);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];
    e.target.value = "";
    if (!arquivo) return;
    if (arquivo.size > MAX_MIDIA_MB * 1024 * 1024) {
      return notify.error(`O arquivo excede ${MAX_MIDIA_MB}MB.`);
    }
    setEnviando(true);
    try {
      const { url } = await bandeiraAzulApi.uploadMidia(arquivo);
      onUploaded(url);
    } catch {
      notify.error("Não foi possível enviar o arquivo. Verifique o formato.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <>
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={onChange} />
      <button
        type="button"
        onClick={() => ref.current?.click()}
        disabled={enviando}
        className="inline-flex items-center gap-2 rounded-xl border border-input px-4 py-2 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-60"
      >
        {enviando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
        {label}
      </button>
    </>
  );
}

export default function AdminBandeiraAzulPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [subtitulo, setSubtitulo] = useState("");
  const [bannerImagens, setBannerImagens] = useState<string[]>([]);
  const [blocos, setBlocos] = useState<BlocoEditor[]>([]);
  const [original, setOriginal] = useState("");

  const snapshot = (t: string, s: string, b: string[], bl: BlocoEditor[]) =>
    JSON.stringify({ t, s, b, bl: bl.map(editorToApi) });
  const alterado = !loading && snapshot(titulo, subtitulo, bannerImagens, blocos) !== original;

  useEffect(() => {
    bandeiraAzulApi
      .get()
      .then((p) => {
        const bl = (p?.blocos ?? []).map(apiToEditor);
        const t = p?.titulo ?? "Praias com Bandeira Azul";
        const s = p?.subtitulo ?? "";
        const b = p?.bannerImagens ?? [];
        setTitulo(t);
        setSubtitulo(s);
        setBannerImagens(b);
        setBlocos(bl);
        setOriginal(snapshot(t, s, b, bl));
      })
      .catch(() => notify.error("Erro ao carregar a página da Bandeira Azul."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!alterado) return;
    const aviso = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", aviso);
    return () => window.removeEventListener("beforeunload", aviso);
  }, [alterado]);

  const moverFoto = (idx: number, dir: -1 | 1) =>
    setBannerImagens((prev) => {
      const alvo = idx + dir;
      if (alvo < 0 || alvo >= prev.length) return prev;
      const copia = [...prev];
      [copia[idx], copia[alvo]] = [copia[alvo], copia[idx]];
      return copia;
    });

  const atualizar = (uid: string, patch: Partial<BandeiraAzulBloco>) =>
    setBlocos((prev) => prev.map((b) => (b.uid === uid ? { ...b, ...patch } : b)));

  const adicionar = (type: BandeiraAzulBloco["type"]) =>
    setBlocos((prev) => [
      ...prev,
      {
        uid: novoUid(),
        type,
        content: "",
        bgColor: "#ffffff",
        isBold: false,
        ...(type === "image" ? { images: [] } : {}),
        ...(type === "video" ? { videos: [] } : {}),
      },
    ]);

  const mover = (idx: number, dir: -1 | 1) =>
    setBlocos((prev) => {
      const alvo = idx + dir;
      if (alvo < 0 || alvo >= prev.length) return prev;
      const copia = [...prev];
      [copia[idx], copia[alvo]] = [copia[alvo], copia[idx]];
      return copia;
    });

  async function remover(uid: string) {
    if (await confirmAction("Remover este bloco?", { confirmLabel: "Remover" })) {
      setBlocos((prev) => prev.filter((b) => b.uid !== uid));
    }
  }

  const atualizarMidia = (
    bloco: BlocoEditor,
    campo: "images" | "videos",
    fn: (lista: BandeiraAzulMidia[]) => BandeiraAzulMidia[],
  ) => atualizar(bloco.uid, { [campo]: fn(bloco[campo] ?? []) });

  async function salvar() {
    if (!titulo.trim()) return notify.error("Informe o título.");
    setSaving(true);
    try {
      await bandeiraAzulApi.save({
        titulo: titulo.trim(),
        subtitulo: subtitulo.trim() || undefined,
        bannerImagens,
        blocos: blocos.map(editorToApi).map((b) => ({
          ...b,
          // Descarta itens de mídia ainda sem URL
          images: b.images?.filter((m) => m.url).map((m) => ({ url: m.url, ...(m.link ? { link: m.link } : {}) })),
          videos: b.videos?.filter((m) => m.url).map((m) => ({ url: m.url, ...(m.link ? { link: m.link } : {}) })),
        })),
      });
      setOriginal(snapshot(titulo, subtitulo, bannerImagens, blocos));
      notify.success("Página da Bandeira Azul salva!");
    } catch {
      notify.error("Erro ao salvar. Confira os campos e as URLs informadas.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2">
            <Flag className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Bandeira Azul</h1>
            <p className="text-sm text-muted-foreground">
              Banner exibido em Praias & Lagoas e a página informativa aberta ao clicar nele.
            </p>
          </div>
        </div>
        <button
          onClick={salvar}
          disabled={saving || !alterado}
          className="flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {alterado ? "Salvar alterações" : "Salvo"}
        </button>
      </div>

      {/* Banner */}
      <section className="space-y-4 rounded-2xl border border-border bg-card p-5">
        <h2 className="font-semibold">Banner</h2>
        <div>
          <label className="mb-1 block text-sm font-medium">Título *</label>
          <input className={inputCls} maxLength={120} value={titulo} onChange={(e) => setTitulo(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Subtítulo</label>
          <input className={inputCls} maxLength={300} value={subtitulo} onChange={(e) => setSubtitulo(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">
            Fotos do carrossel do banner (até {MAX_FOTOS_BANNER})
          </label>
          <p className="mb-2 text-xs text-muted-foreground">
            As fotos passam automaticamente no banner, na ordem abaixo. A primeira também aparece no topo da página informativa.
          </p>
          {bannerImagens.length > 0 && (
            <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {bannerImagens.map((url, i) => (
                <div key={url} className="overflow-hidden rounded-xl border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={safeMediaUrl(url)} alt="" className="h-28 w-full object-cover" />
                  <div className="flex items-center justify-between bg-muted/50 px-1 py-1">
                    <span className="px-2 text-xs text-muted-foreground">{i + 1}</span>
                    <div className="flex">
                      <button type="button" onClick={() => moverFoto(i, -1)} disabled={i === 0} aria-label="Mover foto para trás" className="rounded p-1.5 hover:bg-muted disabled:opacity-30">
                        <ArrowUp className="h-3.5 w-3.5 -rotate-90" />
                      </button>
                      <button type="button" onClick={() => moverFoto(i, 1)} disabled={i === bannerImagens.length - 1} aria-label="Mover foto para frente" className="rounded p-1.5 hover:bg-muted disabled:opacity-30">
                        <ArrowDown className="h-3.5 w-3.5 -rotate-90" />
                      </button>
                      <button type="button" onClick={() => setBannerImagens((prev) => prev.filter((_, j) => j !== i))} aria-label="Remover foto" className="rounded p-1.5 text-destructive hover:bg-destructive/10">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {bannerImagens.length < MAX_FOTOS_BANNER && (
            <UploadButton
              accept="image/jpeg,image/png,image/webp"
              label="Adicionar foto"
              onUploaded={(url) => setBannerImagens((prev) => [...prev, url])}
            />
          )}
        </div>
      </section>

      {/* Construtor de blocos */}
      <section className="space-y-4">
        <h2 className="font-semibold">Conteúdo da página</h2>

        {blocos.length === 0 && (
          <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Nenhum bloco ainda. Adicione texto, imagens ou vídeos abaixo.
          </p>
        )}

        {blocos.map((bloco, idx) => (
          <div key={bloco.uid} className="space-y-3 rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-sm font-semibold">
                {bloco.type === "text" && <Type className="h-4 w-4 text-primary" />}
                {bloco.type === "image" && <ImageIcon className="h-4 w-4 text-primary" />}
                {bloco.type === "video" && <VideoIcon className="h-4 w-4 text-primary" />}
                {bloco.type === "text" ? "Texto" : bloco.type === "image" ? "Imagens" : "Vídeos"}
              </span>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => mover(idx, -1)} disabled={idx === 0} aria-label="Mover para cima" className="rounded-lg p-2 hover:bg-muted disabled:opacity-30">
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => mover(idx, 1)} disabled={idx === blocos.length - 1} aria-label="Mover para baixo" className="rounded-lg p-2 hover:bg-muted disabled:opacity-30">
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => remover(bloco.uid)} aria-label="Remover bloco" className="rounded-lg p-2 text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {bloco.type === "text" && (
              <>
                <textarea
                  rows={5}
                  maxLength={20000}
                  className={`${inputCls} resize-y ${bloco.isBold ? "font-bold" : ""}`}
                  placeholder="Escreva o texto. Quebras de linha são preservadas."
                  value={bloco.content}
                  onChange={(e) => atualizar(bloco.uid, { content: e.target.value })}
                />
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={!!bloco.isBold} onChange={(e) => atualizar(bloco.uid, { isBold: e.target.checked })} />
                    Negrito
                  </label>
                  <label className="inline-flex items-center gap-2">
                    Cor de fundo
                    <input type="color" value={bloco.bgColor ?? "#ffffff"} onChange={(e) => atualizar(bloco.uid, { bgColor: e.target.value })} className="h-8 w-10 cursor-pointer rounded border border-input" />
                  </label>
                </div>
              </>
            )}

            {bloco.type === "image" && (
              <div className="space-y-3">
                {(bloco.images ?? []).map((img, i) => (
                  <div key={i} className="flex flex-col gap-2 rounded-xl border border-border p-3 sm:flex-row sm:items-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={safeMediaUrl(img.url)} alt="" className="h-20 w-28 rounded-lg object-cover" />
                    <input
                      className={inputCls}
                      placeholder="Link ao clicar na imagem (opcional, https://...)"
                      value={img.link ?? ""}
                      onChange={(e) => atualizarMidia(bloco, "images", (l) => l.map((m, j) => (j === i ? { ...m, link: e.target.value } : m)))}
                    />
                    <button type="button" onClick={() => atualizarMidia(bloco, "images", (l) => l.filter((_, j) => j !== i))} aria-label="Remover imagem" className="rounded-lg p-2 text-destructive hover:bg-destructive/10">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <UploadButton accept="image/jpeg,image/png,image/webp" label="Adicionar imagem" onUploaded={(url) => atualizarMidia(bloco, "images", (l) => [...l, { url }])} />
              </div>
            )}

            {bloco.type === "video" && (
              <div className="space-y-3">
                {(bloco.videos ?? []).map((v, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-xl border border-border p-3">
                    <input
                      className={inputCls}
                      placeholder="Link do YouTube ou do arquivo de vídeo"
                      value={v.url}
                      onChange={(e) => atualizarMidia(bloco, "videos", (l) => l.map((m, j) => (j === i ? { ...m, url: e.target.value } : m)))}
                    />
                    <button type="button" onClick={() => atualizarMidia(bloco, "videos", (l) => l.filter((_, j) => j !== i))} aria-label="Remover vídeo" className="rounded-lg p-2 text-destructive hover:bg-destructive/10">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => atualizarMidia(bloco, "videos", (l) => [...l, { url: "" }])} className="inline-flex items-center gap-2 rounded-xl border border-input px-4 py-2 text-sm font-medium hover:bg-muted">
                    <Plus className="h-4 w-4" />
                    Colar link
                  </button>
                  <UploadButton accept="video/mp4,video/webm,video/ogg" label={`Enviar vídeo (até ${MAX_MIDIA_MB}MB)`} onUploaded={(url) => atualizarMidia(bloco, "videos", (l) => [...l, { url }])} />
                </div>
              </div>
            )}
          </div>
        ))}

        <div className="flex flex-wrap gap-2">
          {([["text", "Texto", Type], ["image", "Imagens", ImageIcon], ["video", "Vídeos", VideoIcon]] as const).map(([tipo, rotulo, Icone]) => (
            <button key={tipo} type="button" onClick={() => adicionar(tipo)} className="inline-flex items-center gap-2 rounded-xl border border-input px-4 py-2 text-sm font-medium hover:bg-muted">
              <Icone className="h-4 w-4" />
              {rotulo}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
