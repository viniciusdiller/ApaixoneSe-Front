"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  MapPin,
  Phone,
  Instagram,
  X,
  UtensilsCrossed,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import { gastronomiaApi } from "@/lib/api/gastronomia";
import type { Gastronomia } from "@/lib/api/types";
import { safeMediaUrl } from "@/lib/safeMediaUrl";
import { trackClick } from "@/lib/trackClick";
import { pratosTipicos } from "@/lib/data";
import { GastronomiaCard } from "./GastronomiaCard";
import { useVisitas } from "@/hooks/useVisitas";
import Link from "next/link";
import { CadasturSection } from "@/components/CadasturSection";
import { BusinessPartnerCta } from "@/components/business-partner-cta";

export function GastronomiaListPage() {
  const [restaurantes, setRestaurantes] = useState<Gastronomia[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(false);
  const [selecionado, setSelecionado] = useState<Gastronomia | null>(null);
  const [clickedCard, setClickedCard] = useState<string | null>(null);

  const [isMounted, setIsMounted] = useState(false);

  const { gastronomiasVisitadas, isLogado, toggleGastronomia } = useVisitas();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    gastronomiaApi
      .getAll()
      .then((data) =>
        setRestaurantes(data.filter((r) => r.status === "APROVADO")),
      )
      .catch(() => setErro(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    document.body.style.overflow = selecionado ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selecionado]);

  const imgUrl = (r: Gastronomia) =>
    safeMediaUrl(r.logoUrl) || "/images/gastronomia.jpg";

  const handleVerDetalhes = (restaurante: Gastronomia) => {
    trackClick("gastronomia", restaurante.id);
    setSelecionado(restaurante);
  };

  const isVisitadoModal = selecionado
    ? gastronomiasVisitadas.has(selecionado.id)
    : false;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Refatorado para o padrão com Imagem de Fundo */}
      <section
        className="relative bg-cover bg-[top_50%] px-4 pb-12 pt-32"
        style={{ backgroundImage: "url('/images/header/gastronomia.jpg')" }}
      >
        {/* Overlay para escurecer a imagem e dar destaque ao texto */}
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
            Gastronomia
          </h1>
          <p className="mt-4 max-w-xl text-white/80">
            Descubra os melhores restaurantes e os sabores autênticos de
            Saquarema.
          </p>
        </motion.div>
      </section>

      {/* Lista de restaurantes */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-4xl font-bold uppercase text-foreground">
            Restaurantes
          </h2>
          {isMounted && isLogado && (
            <p className="text-sm text-muted-foreground">
              ✓ Marque os restaurantes que você já visitou!
            </p>
          )}
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {loading ? (
            <p className="col-span-full text-center text-muted-foreground">
              Preparando o cardápio com os melhores restaurantes...
            </p>
          ) : erro ? (
            <div className="col-span-full rounded-xl border border-border bg-card p-8 text-center shadow-sm">
              <AlertCircle className="mx-auto mb-4 h-10 w-10 text-destructive/60" />
              <p className="font-display text-2xl font-bold text-foreground">
                Ops! Tivemos um imprevisto.
              </p>
              <p className="mt-2 text-muted-foreground">
                Não conseguimos carregar os restaurantes. Tente novamente mais
                tarde.
              </p>
            </div>
          ) : restaurantes.length === 0 ? (
            <div className="col-span-full py-10 text-center">
              <span className="mb-3 block text-5xl">🍽️</span>
              <p className="font-display text-2xl text-foreground">
                Novos sabores chegando em breve!
              </p>
              <p className="mt-2 text-muted-foreground">
                Estamos a selecionar os melhores estabelecimentos de Saquarema
                para você.
              </p>
            </div>
          ) : (
            restaurantes.map((restaurante, i) => (
              <GastronomiaCard
                key={restaurante.id}
                restaurante={restaurante}
                index={i}
                onVerDetalhes={handleVerDetalhes}
                visitado={gastronomiasVisitadas.has(restaurante.id)}
                onToggleCheckin={
                  isMounted && isLogado ? toggleGastronomia : undefined
                }
              />
            ))
          )}
        </div>
      </section>

      {/* Seção Pratos Típicos */}
      <section className="bg-muted px-4 py-14">
        <div className="container mx-auto">
          <h2 className="font-display text-4xl font-bold uppercase text-primary">
            Pratos Típicos
          </h2>
          <ul className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            {pratosTipicos.map((prato) => (
              <li
                key={prato.nome}
                className="rounded-xl border border-border bg-card p-6"
              >
                <h3 className="font-display text-xl uppercase text-primary">
                  {prato.nome}
                </h3>
                <p className="mt-2 text-muted-foreground">{prato.descricao}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <BusinessPartnerCta categoria="Gastronomia" />

      <section className="container mx-auto px-4 pb-14 pt-2">
        <CadasturSection />
      </section>

      {/* Modal */}
      <AnimatePresence>
        {selecionado && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setSelecionado(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
            >
              <button
                onClick={() => setSelecionado(null)}
                className="absolute right-4 top-4 z-10 rounded-full bg-black/40 p-2 text-white transition hover:bg-black/60"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="overflow-y-auto">
                <div
                  className="h-48 w-full bg-contain bg-center bg-no-repeat bg-muted sm:h-64"
                  style={{ backgroundImage: `url(${imgUrl(selecionado)})` }}
                />

                <div className="p-6 sm:p-8">
                  <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                    <h3 className="font-display text-3xl font-bold uppercase text-foreground sm:text-4xl">
                      {selecionado.nome}
                    </h3>

                    {isMounted && isLogado && (
                      <button
                        onClick={() => toggleGastronomia(selecionado.id)}
                        className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                          isVisitadoModal
                            ? "border-green-500 bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950/30 dark:text-green-400"
                            : "border-border bg-background text-muted-foreground hover:border-green-400 hover:text-green-600"
                        }`}
                      >
                        {isVisitadoModal ? (
                          <>
                            <CheckCircle2 className="h-4 w-4" /> Visitei este
                            lugar!
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="h-4 w-4 opacity-40" /> Já
                            fui aqui!
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {selecionado.especialidade && (
                    <span className="mb-5 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      <UtensilsCrossed className="mr-1 inline h-3 w-3" />
                      {selecionado.especialidade}
                    </span>
                  )}

                  <div className="mt-4 space-y-4 text-muted-foreground">
                    <div className="flex items-start gap-3">
                      <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <p>{selecionado.endereco}</p>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 shrink-0 text-primary" />
                      <a
                        href={`tel:${(selecionado.telefone ?? "").replace(/\D/g, "")}`}
                        className="transition-colors hover:text-primary hover:underline"
                      >
                        {selecionado.telefone || "Telefone não informado"}
                      </a>
                    </div>

                    {selecionado.instagram && (
                      <div className="flex items-center gap-3">
                        <Instagram className="h-5 w-5 shrink-0 text-primary" />
                        <a
                          href={`https://instagram.com/${selecionado.instagram.replace(
                            "@",
                            "",
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="transition-colors hover:text-primary hover:underline"
                        >
                          {selecionado.instagram}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
