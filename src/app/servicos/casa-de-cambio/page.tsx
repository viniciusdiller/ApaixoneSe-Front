"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { casaDeCambioApi } from "@/lib/api";
import type { CasaDeCambio } from "@/lib/api";
import { ArrowLeft, Phone, MapPin, Instagram, Globe, AlertCircle, ZoomIn, X } from "lucide-react";
import { safeMediaUrl } from "@/lib/safeMediaUrl";

export default function CasaDeCambioPage() {
  const [items, setItems] = useState<CasaDeCambio[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);
  const [zoomSrc, setZoomSrc] = useState<string | null>(null);

  useEffect(() => {
    casaDeCambioApi
      .getAll()
      .then((data) => setItems(data))
      .catch(() => setErro(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative bg-cover bg-center bg-no-repeat px-4 pb-12 pt-32"
        style={{ backgroundImage: "url('/images/header/casa-de-cambio.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <span
          aria-hidden
          className="absolute right-8 top-1/2 -translate-y-1/2 select-none text-[160px] opacity-10"
        >
          💱
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
            Serviços para Turista
          </p>
          <h1 className="font-display text-5xl font-bold uppercase text-primary-foreground drop-shadow-lg md:text-6xl">
            Casa de Câmbio
          </h1>
          <p className="mt-4 max-w-xl text-lg text-primary-foreground/80">
            Troque sua moeda com segurança em casas de câmbio credenciadas em Saquarema.
          </p>
        </div>
      </section>

      {/* Lista */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="font-display text-4xl font-bold uppercase text-foreground">
          Casas de Câmbio
        </h2>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {loading ? (
            <p className="col-span-full text-center text-muted-foreground">
              Carregando casas de câmbio...
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
          ) : items.length === 0 ? (
            <div className="col-span-full py-10 text-center">
              <span className="mb-3 block text-5xl">💱</span>
              <p className="font-display text-2xl text-foreground">
                Nenhuma casa de câmbio disponível no momento.
              </p>
              <p className="mt-2 text-muted-foreground">
                Em breve novos parceiros serão adicionados.
              </p>
            </div>
          ) : (
            items.map((item) => {
              const logo = safeMediaUrl(item.logoUrl);
              return (
                <article
                  key={item.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card"
                >
                  <div className="flex grow flex-col p-5">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h3 className="min-w-0 flex-1 font-display text-2xl font-bold uppercase">
                        {item.nome}
                      </h3>

                      {logo && (
                        <button
                          type="button"
                          onClick={() => setZoomSrc(logo)}
                          aria-label={`Ver logo de ${item.nome}`}
                          className="group relative shrink-0 overflow-hidden rounded-full border border-border focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={logo}
                            alt={item.nome}
                            className="h-14 w-14 object-cover"
                          />
                          <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/40">
                            <ZoomIn className="h-4 w-4 text-white opacity-0 transition group-hover:opacity-100" />
                          </span>
                        </button>
                      )}
                    </div>

                    {item.moedas && (
                      <p className="mt-1 text-xs text-muted-foreground">💱 {item.moedas}</p>
                    )}

                    <p className="mt-2 grow text-sm text-muted-foreground line-clamp-2">
                      {item.descricao || item.endereco || `Telefone: ${item.telefone}`}
                    </p>

                    <div className="mt-3 flex flex-col gap-1.5 pt-3 border-t border-border">
                      {item.endereco && (
                        <span className="flex items-center gap-2 text-xs text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 shrink-0" /> {item.endereco}
                        </span>
                      )}
                      {item.telefone && (
                        <a
                          href={`tel:${item.telefone}`}
                          className="flex items-center gap-2 text-xs text-primary hover:underline"
                        >
                          <Phone className="h-3.5 w-3.5 shrink-0" /> {item.telefone}
                        </a>
                      )}
                      {item.instagram && (
                        <a
                          href={`https://instagram.com/${item.instagram.replace("@", "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Instagram className="h-3.5 w-3.5 shrink-0" /> {item.instagram}
                        </a>
                      )}
                      {item.site && (
                        <a
                          href={item.site.startsWith("http") ? item.site : `https://${item.site}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-primary transition-colors"
                        >
                          <Globe className="h-3.5 w-3.5 shrink-0" /> {item.site.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </section>

      {zoomSrc && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setZoomSrc(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Logo em destaque"
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setZoomSrc(null)}
              className="absolute -right-3 -top-3 z-10 rounded-full bg-white p-1.5 text-gray-800 shadow-lg hover:bg-gray-100 transition"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={zoomSrc}
              alt="Logo em destaque"
              className="max-h-[85vh] max-w-[85vw] rounded-lg object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
