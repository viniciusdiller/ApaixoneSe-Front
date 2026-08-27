"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  MapPin,
  Phone,
  Instagram,
  X,
  Star,
  Tag,
  Globe,
  ArrowLeft,
} from "lucide-react";
import { hospedagemApi } from "@/lib/api";
import type { Hospedagem } from "@/lib/api";
import { safeMediaUrl } from "@/lib/safeMediaUrl";
import Link from "next/link";
import { CadasturSection } from "@/components/CadasturSection";
import { BusinessPartnerCta } from "@/components/business-partner-cta";
import { trackClick } from "@/lib/trackClick";

function parseTags(raw: string[] | null | undefined): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw as string[];
  try {
    return JSON.parse(raw as unknown as string) as string[];
  } catch {
    return [];
  }
}

function buildSiteHref(site?: string | null): string | null {
  if (!site) return null;
  return site.startsWith("http") ? site : `https://${site}`;
}

export function HospedagemListPage() {
  const [hospedagens, setHospedagens] = useState<Hospedagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);
  const [selecionada, setSelecionada] = useState<Hospedagem | null>(null);
  const [clickedCard, setClickedCard] = useState<string | null>(null);
  // Agora suporta múltiplas tags ativas simultaneamente
  const [tagsAtivas, setTagsAtivas] = useState<Set<string>>(new Set());

  useEffect(() => {
    hospedagemApi
      .getAll()
      .then((data) =>
        setHospedagens(data.filter((h) => h.status === "APROVADO")),
      )
      .catch(() => setErro(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    document.body.style.overflow = selecionada ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selecionada]);

  const todasAsTags = useMemo(() => {
    const set = new Set<string>();
    hospedagens.forEach((h) => parseTags(h.tags).forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [hospedagens]);

  // Filtra hospedagens: mostra aquelas que possuem TODAS as tags ativas (interseção)
  const hospedagensFiltradas = useMemo(() => {
    if (tagsAtivas.size === 0) return hospedagens;
    return hospedagens.filter((h) => {
      const tags = parseTags(h.tags);
      return Array.from(tagsAtivas).every((t) => tags.includes(t));
    });
  }, [hospedagens, tagsAtivas]);

  function toggleTag(tag: string) {
    setTagsAtivas((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) {
        next.delete(tag);
      } else {
        next.add(tag);
      }
      return next;
    });
  }

  function limparFiltros() {
    setTagsAtivas(new Set());
  }

  const imgUrl = (h: Hospedagem) =>
    safeMediaUrl(h.logoUrl) || "/images/hero-saquarema.jpeg";

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Refatorado para ter Imagem de Fundo e Overlay Escuro */}
      <section
        className="relative bg-cover bg-[center_40%] px-4 pb-12 pt-32"
        style={{ backgroundImage: "url('/images/header/hospedagens.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/50" />

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={clickedCard ? { opacity: 0, y: -20 } : { opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="container relative z-10 mx-auto"
        >
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/20 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para página inicial
          </Link>
          <h1 className="font-display text-5xl font-bold uppercase text-white md:text-6xl">
            Hospedagens
          </h1>
          <p className="mt-4 max-w-xl text-white/80">
            Conheça os melhores locais para se hospedar em Saquarema e garanta
            uma estadia inesquecível.
          </p>
        </motion.div>
      </section>

      {/* Lista */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="font-display text-4xl font-bold uppercase text-foreground">
          Hospedagens
        </h2>

        {/* Filtro por Tags — múltipla seleção */}
        {!loading && !erro && todasAsTags.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
              <Tag className="h-4 w-4" />
              Filtrar por tag:
            </span>

            {/* Botão Todas — limpa seleção */}
            <button
              onClick={limparFiltros}
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                tagsAtivas.size === 0
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
              }`}
            >
              Todas
            </button>

            {todasAsTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  tagsAtivas.has(tag)
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                }`}
              >
                {tag}
              </button>
            ))}

            {/* Contador + botão de limpar quando há tags ativas */}
            {tagsAtivas.size > 0 && (
              <button
                onClick={limparFiltros}
                className="inline-flex items-center gap-1 rounded-full bg-destructive/10 border border-destructive/20 px-3 py-1 text-xs font-medium text-destructive transition-colors hover:bg-destructive/20"
              >
                <X className="h-3 w-3" />
                Limpar ({tagsAtivas.size})
              </button>
            )}
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {loading ? (
            <p className="col-span-full text-center text-muted-foreground">
              Carregando hospedagens...
            </p>
          ) : erro ? (
            <div className="col-span-full rounded-xl border border-border bg-card p-8 text-center shadow-sm">
              <AlertCircle className="mx-auto mb-4 h-10 w-10 text-destructive/60" />
              <p className="font-display text-2xl font-bold text-foreground">
                Ops! Tivemos um imprevisto.
              </p>
              <p className="mt-2 text-muted-foreground">
                Não conseguimos carregar as hospedagens. Tente novamente mais
                tarde.
              </p>
            </div>
          ) : hospedagensFiltradas.length === 0 ? (
            <div className="col-span-full py-10 text-center">
              <span className="mb-3 block text-5xl">🏨</span>
              <p className="font-display text-2xl text-foreground">
                {tagsAtivas.size > 0
                  ? `Nenhuma hospedagem encontrada para as tags selecionadas.`
                  : "Nenhuma hospedagem disponível no momento."}
              </p>
              <p className="mt-2 text-muted-foreground">
                {tagsAtivas.size > 0
                  ? "Tente remover alguma tag ou limpar o filtro."
                  : "Em breve novos parceiros serão adicionados."}
              </p>
            </div>
          ) : (
            hospedagensFiltradas.map((h, i) => {
              const tags = parseTags(h.tags);
              const siteHref = buildSiteHref(h.site);
              return (
                <motion.article
                  key={h.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card"
                >
                  <div
                    className="relative h-52 shrink-0 bg-contain bg-center bg-no-repeat bg-muted"
                    style={{ backgroundImage: `url(${imgUrl(h)})` }}
                  >
                    <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground shadow">
                      <Star className="h-3 w-3 fill-current" />
                      Cadastur
                    </div>
                  </div>

                  <div className="flex grow flex-col p-5">
                    <h3 className="font-display text-2xl font-bold uppercase">
                      {h.nome}
                    </h3>
                    <p className="mt-2 grow text-sm text-muted-foreground line-clamp-2">
                      {h.textoDiferencial}
                    </p>

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
                          {h.site!.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                        </a>
                      </div>
                    )}

                    {tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap items-center gap-1.5">
                        <Tag className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                        {tags.map((tag) => (
                          <button
                            key={tag}
                            onClick={() => toggleTag(tag)}
                            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors ${
                              tagsAtivas.has(tag)
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                            }`}
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => {
                        trackClick("hospedagens", h.id);
                        setSelecionada(h);
                      }}
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

      <BusinessPartnerCta categoria="Hospedagem" />

      <section className="container mx-auto px-4 pb-14 pt-2">
        <CadasturSection />
      </section>

      {/* Modal */}

      <AnimatePresence>
        {selecionada &&
          (() => {
            const tags = parseTags(selecionada.tags);
            const siteHref = buildSiteHref(selecionada.site);
            return (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
                onClick={() => setSelecionada(null)}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
                >
                  <button
                    onClick={() => setSelecionada(null)}
                    className="absolute right-4 top-4 z-10 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <div className="overflow-y-auto">
                    <div
                      className="h-48 w-full bg-contain bg-center bg-no-repeat bg-muted sm:h-64"
                      style={{ backgroundImage: `url(${imgUrl(selecionada)})` }}
                    />

                    <div className="p-6 sm:p-8">
                      <h3 className="mb-2 font-display text-3xl font-bold uppercase text-foreground sm:text-4xl">
                        {selecionada.nome}
                      </h3>

                      {selecionada.textoDiferencial && (
                        <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                          {selecionada.textoDiferencial}
                        </p>
                      )}

                      {tags.length > 0 && (
                        <div className="mb-5 flex flex-wrap items-center gap-1.5">
                          <Tag className="h-3.5 w-3.5 shrink-0 text-muted-foreground/60" />
                          {tags.map((tag) => (
                            <span
                              key={tag}
                              className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="space-y-4 text-muted-foreground">
                        <div className="flex items-start gap-3">
                          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                          <p>{selecionada.endereco}</p>
                        </div>

                        <div className="flex items-center gap-3">
                          <Phone className="h-5 w-5 shrink-0 text-primary" />
                          <a
                            href={`tel:${selecionada.telefone.replace(/\D/g, "")}`}
                            className="transition-colors hover:text-primary hover:underline"
                          >
                            {selecionada.telefone}
                          </a>
                        </div>

                        {selecionada.instagram && (
                          <div className="flex items-center gap-3">
                            <Instagram className="h-5 w-5 shrink-0 text-primary" />
                            <a
                              href={`https://instagram.com/${selecionada.instagram.replace("@", "")}`}
                              target="_blank"
                              rel="noreferrer"
                              className="transition-colors hover:text-primary hover:underline"
                            >
                              {selecionada.instagram}
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
                              {selecionada.site!.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                            </a>
                          </div>
                        )}
                      </div>
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
