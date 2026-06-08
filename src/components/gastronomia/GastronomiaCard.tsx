"use client";

import { motion } from "framer-motion";
import { MapPin, UtensilsCrossed, CheckCircle2, Circle } from "lucide-react";
import { safeMediaUrl } from "@/lib/safeMediaUrl";
import type { Gastronomia } from "@/lib/api/types";

interface Props {
  restaurante: Gastronomia;
  index: number;
  onVerDetalhes: (restaurante: Gastronomia) => void;
  /** Se true, o usuário já fez check-in neste restaurante */
  visitado?: boolean;
  /** Callback para fazer toggle do check-in. Undefined = usuário não logado */
  onToggleCheckin?: (id: string) => void;
}

export function GastronomiaCard({
  restaurante,
  index,
  onVerDetalhes,
  visitado = false,
  onToggleCheckin,
}: Props) {
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
      {/* Badge de visitado no canto superior esquerdo */}
      {visitado && (
        <div className="absolute left-3 top-3 z-10 flex items-center gap-1 rounded-full bg-green-500 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow">
          <CheckCircle2 className="h-3 w-3" />
          Visitei!
        </div>
      )}

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

        {/* Ações */}
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <button
            onClick={() => onVerDetalhes(restaurante)}
            className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/90"
          >
            Ver detalhes
          </button>

          {/* Botão de check-in — só aparece se o usuário estiver logado */}
          {onToggleCheckin && (
            <button
              onClick={() => onToggleCheckin(restaurante.id)}
              aria-label={visitado ? "Remover check-in" : "Marcar como visitado"}
              title={visitado ? "Remover check-in" : "Já fui aqui!"}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold transition-all duration-200 ${
                visitado
                  ? "border-green-500 bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-950/30 dark:text-green-400"
                  : "border-border bg-background text-muted-foreground hover:border-green-400 hover:text-green-600"
              }`}
            >
              {visitado ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <Circle className="h-3.5 w-3.5" />
              )}
              {visitado ? "Visitei" : "Já fui"}
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
}
