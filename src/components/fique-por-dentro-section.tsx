"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fiquePorDentroApi } from "@/lib/api/fique-por-dentro";
import type { FiquePorDentro } from "@/lib/api/types";
import { safeMediaUrl } from "@/lib/safeMediaUrl";

// Direção da transição
type Dir = 1 | -1;

const variants = {
  enter: (dir: Dir) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: Dir) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
};

function SkeletonBanner() {
  return (
    <div className="w-full aspect-[21/9] md:aspect-[3/1] animate-pulse bg-muted rounded-2xl" />
  );
}

export function FiquePorDentroSection() {
  const [items, setItems] = useState<FiquePorDentro[]>([]);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState<Dir>(1);

  useEffect(() => {
    fiquePorDentroApi
      .getAll()
      .then((data) =>
        setItems([...data].sort((a, b) => Number(a.ordem) - Number(b.ordem)))
      )
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const go = useCallback(
    (next: number, direction: Dir) => {
      setDir(direction);
      setIndex((next + items.length) % items.length);
    },
    [items.length]
  );

  const prev = () => go(index - 1, -1);
  const next = () => go(index + 1, 1);

  // Autoplay a cada 5 s
  useEffect(() => {
    if (items.length <= 1) return;
    const id = setInterval(() => go(index + 1, 1), 5000);
    return () => clearInterval(id);
  }, [index, items.length, go]);

  if (!loading && items.length === 0) return null;

  const current = items[index];
  const src = current ? safeMediaUrl(current.imagemUrl) : null;

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

        {/* Banner */}
        <div className="relative w-full overflow-hidden rounded-2xl border border-border shadow-lg">
          {/* Proporção: 21:9 mobile → 3:1 desktop */}
          <div className="aspect-[21/9] md:aspect-[3/1] w-full relative bg-muted">

            {loading ? (
              <SkeletonBanner />
            ) : src ? (
              <AnimatePresence initial={false} custom={dir} mode="popLayout">
                <motion.div
                  key={current.id}
                  custom={dir}
                  variants={variants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
                  className="absolute inset-0"
                >
                  <Image
                    src={src}
                    alt={`Fique Por Dentro — imagem ${current.ordem}`}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 100vw"
                  />
                  {/* Gradiente sutil nas bordas laterais para dar profundidade */}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-black/10 pointer-events-none" />
                </motion.div>
              </AnimatePresence>
            ) : null}

            {/* Seta esquerda */}
            {items.length > 1 && (
              <>
                <button
                  onClick={prev}
                  aria-label="Imagem anterior"
                  className="absolute left-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm border border-white/20 transition hover:bg-black/60 active:scale-95"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                {/* Seta direita */}
                <button
                  onClick={next}
                  aria-label="Próxima imagem"
                  className="absolute right-3 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm border border-white/20 transition hover:bg-black/60 active:scale-95"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          {/* Dots */}
          {items.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => go(i, i > index ? 1 : -1)}
                  aria-label={`Ir para imagem ${i + 1}`}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === index
                      ? "w-6 bg-white"
                      : "w-2 bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
