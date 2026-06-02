"use client";

import Image from "next/image";
import { Phone, MapPin, Instagram, Star } from "lucide-react";
import { motion } from "framer-motion";
import { safeMediaUrl } from "@/lib/safeMediaUrl";
import type { Hospedagem } from "@/lib/api";

interface Props {
  hospedagem: Hospedagem;
  index: number;
}

export function HospedagemCard({ hospedagem, index }: Props) {
  const logoSrc = safeMediaUrl(hospedagem.logoUrl);

  const telefoneFormatado = hospedagem.telefone;
  const telefoneHref = `tel:${hospedagem.telefone.replace(/\D/g, "")}`;

  const instagramHandle = hospedagem.instagram
    ? hospedagem.instagram.replace(/^@/, "")
    : null;
  const instagramHref = instagramHandle
    ? `https://instagram.com/${instagramHandle}`
    : null;

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
      {/* Banner superior com logo centralizado */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        {/* Padr\u00e3o decorativo de fundo */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 50%)",
            backgroundSize: "12px 12px",
          }}
        />

        {logoSrc ? (
          <Image
            src={logoSrc}
            alt={`Logo ${hospedagem.nome}`}
            fill
            className="object-contain p-8 transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          /* Fallback: iniciais do nome */
          <div className="flex h-full items-center justify-center">
            <span className="font-display text-5xl font-bold uppercase tracking-wider text-primary/20">
              {hospedagem.nome
                .split(" ")
                .slice(0, 2)
                .map((w) => w[0])
                .join("")}
            </span>
          </div>
        )}

        {/* Badge de destaque */}
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground shadow">
          <Star className="h-3 w-3 fill-current" />
          Cadastur
        </div>
      </div>

      {/* Divisor com gradiente */}
      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      {/* Conte\u00fado principal */}
      <div className="flex flex-1 flex-col gap-4 p-5">
        {/* Nome */}
        <h3 className="font-display text-xl font-bold uppercase leading-tight tracking-wide text-card-foreground">
          {hospedagem.nome}
        </h3>

        {/* Endere\u00e7o */}
        <div className="flex items-start gap-2">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span className="text-sm text-muted-foreground">
            {hospedagem.endereco}
          </span>
        </div>

        {/* Diferencial */}
        <div className="rounded-xl border border-border/60 bg-muted/40 px-4 py-3">
          <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {hospedagem.textoDiferencial}
          </p>
        </div>

        {/* A\u00e7\u00f5es — sempre no rodap\u00e9 do card */}
        <div className="mt-auto flex flex-wrap gap-2 pt-1">
          {/* Telefone — sempre presente */}
          <a
            href={telefoneHref}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md active:scale-[0.98]"
          >
            <Phone className="h-4 w-4" />
            {telefoneFormatado}
          </a>

          {/* Instagram — s\u00f3 aparece se n\u00e3o for null */}
          {instagramHref && instagramHandle && (
            <a
              href={instagramHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Instagram de ${hospedagem.nome}`}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary active:scale-[0.98]"
            >
              <Instagram className="h-4 w-4" />@{instagramHandle}
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}
