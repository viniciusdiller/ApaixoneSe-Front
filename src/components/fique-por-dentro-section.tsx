"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { fiquePorDentroApi } from "@/lib/api/fique-por-dentro";
import type { FiquePorDentro } from "@/lib/api/types";
import { safeMediaUrl } from "@/lib/safeMediaUrl";

function SkeletonCard() {
  return (
    <div className="animate-pulse flex-shrink-0 w-64 h-80 rounded-2xl bg-muted" />
  );
}

export function FiquePorDentroSection() {
  const [items, setItems] = useState<FiquePorDentro[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fiquePorDentroApi
      .getAll()
      .then((data) =>
        setItems([...data].sort((a, b) => Number(a.ordem) - Number(b.ordem)))
      )
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const scroll = (dir: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  };

  // Não renderiza a seção se não houver itens (e não estiver carregando)
  if (!loading && items.length === 0) return null;

  return (
    <section className="bg-background px-4 py-16 overflow-hidden">
      <div className="container mx-auto">
        {/* Cabeçalho */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-center font-display text-4xl font-bold uppercase text-foreground md:text-5xl">
            Fique Por Dentro
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-muted-foreground">
            Novidades, destaques e o que está acontecendo em Saquarema
          </p>
        </motion.div>

        {/* Carrossel */}
        <div className="relative">
          {/* Botão esquerda */}
          <button
            onClick={() => scroll("left")}
            aria-label="Rolar para esquerda"
            className="absolute left-0 top-1/2 z-10 -translate-y-1/2 -translate-x-2 flex h-10 w-10 items-center justify-center rounded-full bg-background/90 shadow-md border border-border text-foreground transition hover:bg-muted md:-translate-x-5"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          {/* Faixa rolável */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory px-2"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))
            ) : (
              items.map((item, i) => {
                const src = safeMediaUrl(item.imagemUrl);
                if (!src) return null;
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.07 }}
                    className="group relative flex-shrink-0 w-64 h-80 rounded-2xl overflow-hidden border border-border snap-start cursor-pointer"
                  >
                    <Image
                      src={src}
                      alt={`Fique Por Dentro ${item.ordem}`}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="256px"
                    />
                    {/* Gradiente sutil no hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {/* Linha accent no hover */}
                    <div className="absolute bottom-0 left-0 h-1 w-0 bg-accent transition-all duration-500 group-hover:w-full" />
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Botão direita */}
          <button
            onClick={() => scroll("right")}
            aria-label="Rolar para direita"
            className="absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-2 flex h-10 w-10 items-center justify-center rounded-full bg-background/90 shadow-md border border-border text-foreground transition hover:bg-muted md:translate-x-5"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}
