"use client";

import { motion } from "framer-motion";
import { MapPin, UtensilsCrossed } from "lucide-react";
import { safeMediaUrl } from "@/lib/safeMediaUrl";
import type { Gastronomia } from "@/lib/api/types";

interface Props {
  restaurante: Gastronomia;
  index: number;
  onVerDetalhes: (restaurante: Gastronomia) => void;
}

export function GastronomiaCard({ restaurante, index, onVerDetalhes }: Props) {
  const logoSrc = safeMediaUrl(restaurante.logoUrl);

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.07,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      {/* Banner com imagem ou fallback */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        {/* Padrão decorativo de fundo */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 100%)",
            backgroundSize: "12px 12px",
          }}
        />

        {logoSrc ? (
          <div
            className="h-full w-full bg-contain bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url(${logoSrc})` }}
            role="img"
            aria-label={`Imagem de ${restaurante.nome}`}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-display text-5xl font-bold uppercase tracking-wider text-primary/20">
              {restaurante.nome
                .split(" ")
                .slice(0, 2)
                .map((w) => w[0])
                .join("")}
            </span>
          </div>
        )}

        {/* Badge de especialidade */}
        {restaurante.especialidade && (
          <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground shadow">
            <UtensilsCrossed className="h-3 w-3" />
            {restaurante.especialidade}
          </div>
        )}
      </div>

      {/* Divisor com gradiente */}
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Conteúdo principal */}
      <div className="flex flex-1 flex-col gap-4 p-5">
        {/* Nome */}
        <h3 className="font-display text-xl font-bold uppercase leading-tight tracking-wide text-card-foreground">
          {restaurante.nome}
        </h3>

        {/* Endereço */}
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span className="text-sm text-muted-foreground">
            {restaurante.endereco}
          </span>
        </div>

        {/* Botão Ver detalhes */}
        <div className="mt-auto pt-1">
          <button
            onClick={() => onVerDetalhes(restaurante)}
            className="w-fit rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
          >
            Ver detalhes
          </button>
        </div>
      </div>
    </motion.article>
  );
}
