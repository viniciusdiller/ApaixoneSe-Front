"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, AlertCircle, MapPin, Phone, Instagram, X, Route, Globe, Filter } from "lucide-react";
import { servicoTuristaApi } from "@/lib/api";
import type { ServicoTurista, TipoServicoTurista } from "@/lib/api";
import { safeMediaUrl } from "@/lib/safeMediaUrl";
import { ROTEIROS } from "@/lib/roteiros";

interface Props {
  tipo: TipoServicoTurista;
  titulo: string;
  subtitulo: string;
  descricao: string;
  emoji: string;
  labelSingular: string;
  labelPlural: string;
  imagemFallback: string;
}

function buildSiteHref(site?: string | null): string | null {
  if (!site) return null;
  return site.startsWith("http") ? site : `https://${site}`;
}

export function ServicoTuristaListPage({
  tipo,
  titulo,
  subtitulo,
  descricao,
  emoji,
  labelSingular,
  labelPlural,
  imagemFallback,
}: Props) {
  const [servicos, setServicos] = useState<ServicoTurista[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);
  const [selecionado, setSelecionado] = useState<ServicoTurista | null>(null);
  const [roteiroAtivo, setRoteiroAtivo] = useState<string | null>(null);

  useEffect(() => {
    servicoTuristaApi
      .getAll()
      .then((data) =>
        setServicos(
          data.filter((s) => s.status === "APROVADO" && s.tipo === tipo)
        )
      )
      .catch(() => setErro(true))
      .finally(() => setLoading(false));
  }, [tipo]);

  useEffect(() => {
    document.body.style.overflow = selecionado ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [selecionado]);

  const imgUrl = (s: ServicoTurista) =>
    safeMediaUrl(s.logoUrl ?? s.fotoUrl) || imagemFallback;

  const getRoteiroLabel = (s: ServicoTurista) =>
    s.roteiro ? ROTEIROS.find((r) => r.enum === s.roteiro)?.label ?? null : null;

  const getRoteiroSlug = (s: ServicoTurista) =>
    s.roteiro ? ROTEIROS.find((r) => r.enum === s.roteiro)?.slug ?? null : null;

  // Coleta apenas os roteiros presentes nesta lista de serviços
  const roteirosDisponiveis = useMemo(() => {
    const enums = new Set(servicos.map((s) => s.roteiro).filter(Boolean));
    return ROTEIROS.filter((r) => enums.has(r.enum));
  }, [servicos]);

  // Filtra serviços pelo roteiro ativo
  const servicosFiltrados = useMemo(() => {
    if (!roteiroAtivo) return servicos;
    return servicos.filter((s) => s.roteiro === roteiroAtivo);
  }, [servicos, roteiroAtivo]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary px-4 pb-16 pt-32">
        <span
          aria-hidden
          className="absolute right-8 top-1/2 -translate-y-1/2 select-none text-[160px] opacity-10"
        >
          {emoji}
        </span>
        <div className="container relative z-10 mx-auto">
          <Link
            href="/servicos"
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-2 text-sm text-primary-foreground/80 transition-colors hover:bg-primary-foreground/20 hover:text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para Serviços
          </Link>
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-primary-foreground/60">
            {subtitulo}
          </p>
          <h1 className="font-display text-5xl font-bold uppercase text-primary-foreground drop-shadow-lg md:text-6xl">
            {titulo}
          </h1>
          <p className="mt-4 max-w-xl text-lg text-primary-foreground/80">
            {descricao}
          </p>
        </div>
      </section>

      {/* Lista */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="font-display text-4xl font-bold uppercase text-foreground">
          {titulo}
        </h2>

        {/* Filtro por tipo de Roteiro */}
        {!loading && !erro && roteirosDisponiveis.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <Filter className="h-4 w-4" />
              Filtrar por roteiro:
            </span>
            <button
              onClick={() => setRoteiroAtivo(null)}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                roteiroAtivo === null
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background text-muted-foreground border-border hover:border-primary hover:text-primary"
              }`}
            >
              Todos
            </button>
            {roteirosDisponiveis.map((roteiro) => (
              <button
                key={roteiro.enum}
                onClick={() =>
                  setRoteiroAtivo(
                    roteiroAtivo === roteiro.enum ? null : roteiro.enum
                  )
                }
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  roteiroAtivo === roteiro.enum
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-accent/20 text-accent-foreground border-accent/30 hover:bg-accent/40"
                }`}
              >
                <Route className="h-3 w-3" />
                {roteiro.label}
              </button>
            ))}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {loading ? (
            <p className="col-span-full text-center text-muted-foreground">
              Carregando {labelPlural}...
            </p>
          ) : erro ? (
            <div className="col-span-full rounded-xl border border-border bg-card p-8 text-center shadow-sm">
              <AlertCircle className="mx-auto mb-4 h-10 w-10 text-destructive/60" />
              <p className="font-display text-2xl font-bold text-foreground">
                Ops! Tivemos um imprevisto.
              </p>
              <p className="mt-2 text-muted-foreground">
                Não conseguimos carregar os dados. Tente novamente mais tarde.
              </p>
            </div>
          ) : servicosFiltrados.length === 0 ? (
            <div className="col-span-full py-10 text-center">
              <span className="mb-3 block text-5xl">{emoji}</span>
              <p className="font-display text-2xl text-foreground">
                {roteiroAtivo
                  ? `Nenhum ${labelSingular} encontrado para este roteiro.`
                  : `Nenhum ${labelSingular} disponível no momento.`}
              </p>
              <p className="mt-2 text-muted-foreground">
                {roteiroAtivo
                  ? "Tente selecionar outro roteiro ou veja todos."
                  : "Em breve novos parceiros serão adicionados."}
              </p>
            </div>
          ) : (
            servicosFiltrados.map((servico, i) => {
              const siteHref = buildSiteHref(servico.site);
              return (
                <motion.article
                  key={servico.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card"
                >
                  <div
                    className="h-52 shrink-0 bg-contain bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${imgUrl(servico)})` }}
                  />
                  <div className="flex grow flex-col p-5">
                    <h3 className="font-display text-2xl font-bold uppercase">
                      {servico.nome}
                    </h3>
                    <p className="mt-2 grow text-sm text-muted-foreground line-clamp-2">
                      {servico.descricao ||
                        servico.endereco ||
                        `Telefone: ${servico.telefone}`}
                    </p>

                    {/* Roteiro vinculado */}
                    {getRoteiroLabel(servico) && (
                      <div className="mt-3 flex items-center gap-1.5">
                        <Route className="h-3.5 w-3.5 shrink-0 text-primary" />
                        <span className="text-xs text-muted-foreground">
                          Roteiro:{" "}
                          <span className="font-semibold text-foreground">
                            {getRoteiroLabel(servico)}
                          </span>
                        </span>
                      </div>
                    )}

                    {/* Site no card */}
                    {siteHref && (
                      <div className="mt-3 flex items-center gap-2">
                        <Globe className="h-4 w-4 shrink-0 text-primary" />
                        <a
                          href={siteHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary hover:underline truncate"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {servico.site!.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                        </a>
                      </div>
                    )}

                    <button
                      onClick={() => setSelecionado(servico)}
                      className="mt-4 w-fit rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
                    >
                      Ver detalhes
                    </button>
                  </div>
                </motion.article>
              );
            })
          )}
        </div>
      </section>

      {/* Modal */}
      <AnimatePresence>
        {selecionado && (() => {
          const siteHref = buildSiteHref(selecionado.site);
          return (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
              onClick={() => setSelecionado(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
              >
                <button
                  onClick={() => setSelecionado(null)}
                  className="absolute right-4 top-4 z-10 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60"
                >
                  <X className="h-5 w-5" />
                </button>

                <div
                  className="h-48 w-full bg-contain bg-center bg-no-repeat bg-muted sm:h-64"
                  style={{ backgroundImage: `url(${imgUrl(selecionado)})` }}
                />

                <div className="p-6 sm:p-8">
                  <h3 className="mb-1 font-display text-3xl font-bold uppercase text-foreground sm:text-4xl">
                    {selecionado.nome}
                  </h3>

                  {/* Badges: roteiro + idiomas */}
                  <div className="mb-4 flex flex-wrap gap-2">
                    {getRoteiroLabel(selecionado) && (
                      <Link
                        href={`/roteiros/${getRoteiroSlug(selecionado)}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold text-accent-foreground transition-colors hover:bg-accent/40"
                      >
                        <Route className="h-3 w-3" />
                        Roteiro {getRoteiroLabel(selecionado)}
                      </Link>
                    )}
                    {selecionado.idiomas && (
                      <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        Idiomas: {selecionado.idiomas}
                      </span>
                    )}
                  </div>

                  {selecionado.descricao && (
                    <p className="mb-4 text-sm text-muted-foreground">
                      {selecionado.descricao}
                    </p>
                  )}

                  <div className="mt-4 space-y-4 text-muted-foreground">
                    {selecionado.endereco && (
                      <div className="flex items-start gap-3">
                        <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                        <p>{selecionado.endereco}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 shrink-0 text-primary" />
                      <p>{selecionado.telefone || "Telefone não informado"}</p>
                    </div>

                    {selecionado.instagram && (
                      <div className="flex items-center gap-3">
                        <Instagram className="h-5 w-5 shrink-0 text-primary" />
                        <a
                          href={`https://instagram.com/${
                            selecionado.instagram.replace("@", "")
                          }`}
                          target="_blank"
                          rel="noreferrer"
                          className="transition-colors hover:text-primary hover:underline"
                        >
                          {selecionado.instagram}
                        </a>
                      </div>
                    )}

                    {siteHref && (
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 shrink-0 text-primary" />
                        <a
                          href={siteHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="transition-colors hover:text-primary hover:underline truncate"
                        >
                          {selecionado.site!.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
