"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  AlertCircle,
  MapPin,
  Phone,
  Instagram,
  X,
  Star,
} from "lucide-react";
import { hospedagemApi } from "@/lib/api";
import type { Hospedagem } from "@/lib/api";
import { safeMediaUrl } from "@/lib/safeMediaUrl";

export function HospedagemListPage() {
  const [hospedagens, setHospedagens] = useState<Hospedagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);
  const [selecionada, setSelecionada] = useState<Hospedagem | null>(null);

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

  const imgUrl = (h: Hospedagem) =>
    safeMediaUrl(h.logoUrl) || "/images/hero-saquarema.jpeg";

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative overflow-hidden bg-primary px-4 pb-16 pt-32">
        <span
          aria-hidden
          className="absolute right-8 top-1/2 -translate-y-1/2 select-none text-[160px] opacity-10"
        >
          🏨
        </span>
        <div className="container relative z-10 mx-auto">
          <p className="mb-2 text-sm uppercase tracking-[0.3em] text-primary-foreground/60">
            Onde ficar
          </p>
          <h1 className="font-display text-5xl font-bold uppercase text-primary-foreground drop-shadow-lg md:text-6xl">
            Hospedagens
          </h1>
          <p className="mt-4 max-w-xl text-lg text-primary-foreground/80">
            Conheça os melhores locais para se hospedar em Saquarema e garanta
            uma estadia inesquecível.
          </p>
        </div>
      </section>

      {/* Lista */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="font-display text-4xl font-bold uppercase text-foreground">
          Hospedagens
        </h2>

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
          ) : hospedagens.length === 0 ? (
            <div className="col-span-full py-10 text-center">
              <span className="mb-3 block text-5xl">🏨</span>
              <p className="font-display text-2xl text-foreground">
                Nenhuma hospedagem disponível no momento.
              </p>
              <p className="mt-2 text-muted-foreground">
                Em breve novos parceiros serão adicionados.
              </p>
            </div>
          ) : (
            hospedagens.map((h, i) => (
              <motion.article
                key={h.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card"
              >
                {/* Imagem: bg-contain para não cortar */}
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
                  <button
                    onClick={() => setSelecionada(h)}
                    className="mt-4 w-fit rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
                  >
                    Ver detalhes
                  </button>
                </div>
              </motion.article>
            ))
          )}
        </div>
      </section>

      {/* Modal */}
      <AnimatePresence>
        {selecionada && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setSelecionada(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
            >
              <button
                onClick={() => setSelecionada(null)}
                className="absolute right-4 top-4 z-10 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Imagem modal: bg-contain */}
              <div
                className="h-48 w-full bg-contain bg-center bg-no-repeat bg-muted sm:h-64"
                style={{ backgroundImage: `url(${imgUrl(selecionada)})` }}
              />

              <div className="p-6 sm:p-8">
                <h3 className="mb-2 font-display text-3xl font-bold uppercase text-foreground sm:text-4xl">
                  {selecionada.nome}
                </h3>

                {selecionada.textoDiferencial && (
                  <p className="mb-5 text-sm leading-relaxed text-muted-foreground">
                    {selecionada.textoDiferencial}
                  </p>
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
                        href={`https://instagram.com/${selecionada.instagram.replace(
                          "@",
                          "",
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="transition-colors hover:text-primary hover:underline"
                      >
                        {selecionada.instagram}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
