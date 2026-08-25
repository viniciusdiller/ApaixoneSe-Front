"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { fiquePorDentroApi } from "@/lib/api/fique-por-dentro";
import { eventosApi } from "@/lib/api/eventos";
import type { FiquePorDentro, Evento } from "@/lib/api/types";
import { safeMediaUrl } from "@/lib/safeMediaUrl";
import { formatarPeriodoEventoCurto } from "@/lib/eventoPeriodo";
import { mesSlugFromData } from "@/lib/eventos";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";

type FiqueSlide =
  | { kind: "imagem"; id: string; src: string }
  | {
      kind: "evento";
      id: string;
      src: string;
      titulo: string;
      periodo: string;
      mes: string;
    };

const NAV_BUTTON_CLASS =
  "static h-10 w-10 translate-x-0 translate-y-0 rounded-full border-white/20 bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60 hover:text-white active:scale-95";

// Efeito de profundidade: cards mais perto do centro do carrossel ficam em
// escala cheia e brilho normal; os que vão saindo pras bordas encolhem e
// escurecem — com 4 visíveis, destaca os 2 do meio; com 3, destaca o do
// meio. Contínuo (baseado na posição real medida no DOM), não fixo por
// índice, então acompanha o arrasto/scroll em vez de travar num layout só.
const SHRINK_AMOUNT = 0.2;
const DARKEN_AMOUNT = 0.7;

function SkeletonRow() {
  return (
    <div className="flex gap-4 overflow-hidden">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="aspect-[3/4] w-[70%] flex-shrink-0 animate-pulse rounded-2xl bg-muted sm:w-1/2 md:w-1/3 lg:w-1/4"
        />
      ))}
    </div>
  );
}

export function FiquePorDentroSection() {
  const [slides, setSlides] = useState<FiqueSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [api, setApi] = useState<CarouselApi>();
  const cardRefs = useRef<(HTMLDivElement | HTMLAnchorElement | null)[]>([]);

  useEffect(() => {
    Promise.allSettled([fiquePorDentroApi.getAll(), eventosApi.getDestaques()])
      .then(([imagensResult, eventosResult]) => {
        const imagens: FiquePorDentro[] =
          imagensResult.status === "fulfilled" ? imagensResult.value : [];
        const eventos: Evento[] =
          eventosResult.status === "fulfilled" ? eventosResult.value : [];

        const slidesImagem: FiqueSlide[] = [...imagens]
          .sort((a, b) => Number(a.ordem) - Number(b.ordem))
          .map(
            (img): FiqueSlide => ({
              kind: "imagem",
              id: img.id,
              src: safeMediaUrl(img.imagemUrl) ?? "",
            }),
          )
          .filter((s) => s.src);

        const slidesEvento: FiqueSlide[] = eventos
          .slice(0, 4)
          .map(
            (ev): FiqueSlide => ({
              kind: "evento",
              id: ev.id,
              src: safeMediaUrl(ev.fotoUrl ?? "") ?? "",
              titulo: ev.titulo,
              periodo: formatarPeriodoEventoCurto(ev.data, ev.dataFim),
              mes: mesSlugFromData(ev.data),
            }),
          )
          .filter((s) => s.src);

        setSlides([...slidesImagem, ...slidesEvento]);
      })
      .finally(() => setLoading(false));
  }, []);

  // Autoplay a cada 5s — para assim que a pessoa interage manualmente
  // (arrastar/clicar seta), pra não puxar o carrossel de volta no meio
  // de um gesto do usuário.
  useEffect(() => {
    if (!api || slides.length <= 1) return;

    let intervalId: ReturnType<typeof setInterval> | undefined;

    const play = () => {
      intervalId = setInterval(() => api.scrollNext(), 5000);
    };
    const stop = () => {
      if (intervalId) clearInterval(intervalId);
    };

    play();
    api.on("pointerDown", stop);

    return () => {
      stop();
      api.off("pointerDown", stop);
    };
  }, [api, slides.length]);

  // Escala cada card conforme a distância do centro do carrossel — recalcula
  // a cada frame de scroll/arrasto pra acompanhar o movimento de verdade.
  useEffect(() => {
    if (!api) return;
    const container = api.rootNode();

    const updateScale = () => {
      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.left + containerRect.width / 2;

      cardRefs.current.forEach((node) => {
        if (!node) return;
        const rect = node.getBoundingClientRect();
        const cardCenter = rect.left + rect.width / 2;
        const distance = Math.abs(cardCenter - containerCenter);
        const maxDistance = containerRect.width / 2 + rect.width / 2;
        const t = Math.min(distance / maxDistance, 1);
        node.style.transform = `scale(${1 - t * SHRINK_AMOUNT})`;
        node.style.filter = `brightness(${1 - t * DARKEN_AMOUNT})`;
      });
    };

    updateScale();
    api.on("scroll", updateScale);
    api.on("reInit", updateScale);
    api.on("resize", updateScale);

    return () => {
      api.off("scroll", updateScale);
      api.off("reInit", updateScale);
      api.off("resize", updateScale);
    };
  }, [api, slides.length]);

  if (!loading && slides.length === 0) return null;

  return (
    <section className="bg-background py-12 px-4 overflow-hidden">
      <div className="container mx-auto">
        {/* Cabeçalho */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h2 className="font-display text-4xl font-bold uppercase text-foreground md:text-5xl">
            Fique Por Dentro
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Novidades, destaques e o que está acontecendo em Saquarema
          </p>
        </motion.div>

        {loading ? (
          <SkeletonRow />
        ) : (
          <Carousel
            opts={{ align: "center", loop: slides.length > 1 }}
            setApi={setApi}
            className="w-full"
          >
            <CarouselContent className="-ml-4">
              {slides.map((slide, i) => {
                const cardContent = (
                  <>
                    <Image
                      src={slide.src}
                      alt={
                        slide.kind === "evento"
                          ? slide.titulo
                          : "Fique Por Dentro"
                      }
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 70vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    {slide.kind === "evento" && (
                      <>
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-4">
                          <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                            {slide.periodo}
                          </p>
                          <p className="font-display text-lg font-bold uppercase leading-tight text-white">
                            {slide.titulo}
                          </p>
                        </div>
                      </>
                    )}
                  </>
                );
                const cardClassName =
                  "group relative block aspect-[3/4] w-full overflow-hidden rounded-2xl border border-border shadow-lg";
                const setRef = (el: HTMLDivElement | HTMLAnchorElement | null) => {
                  cardRefs.current[i] = el;
                };

                return (
                  <CarouselItem
                    key={slide.id}
                    className="basis-[70%] pl-4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
                  >
                    {slide.kind === "evento" ? (
                      <Link
                        href={`/eventos/${slide.mes}?evento=${slide.id}`}
                        ref={setRef}
                        className={cardClassName}
                      >
                        {cardContent}
                      </Link>
                    ) : (
                      <div ref={setRef} className={cardClassName}>
                        {cardContent}
                      </div>
                    )}
                  </CarouselItem>
                );
              })}
            </CarouselContent>

            {slides.length > 1 && (
              <div className="mt-6 flex items-center justify-center gap-3">
                <CarouselPrevious className={NAV_BUTTON_CLASS} />
                <CarouselNext className={NAV_BUTTON_CLASS} />
              </div>
            )}
          </Carousel>
        )}
      </div>
    </section>
  );
}
