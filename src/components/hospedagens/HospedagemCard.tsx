"use client";

import Image from "next/image";
import { Phone, MapPin, Instagram } from "lucide-react";
import { motion } from "framer-motion";
import { safeMediaUrl } from "@/lib/safeMediaUrl";
import type { Hospedagem } from "@/lib/api";

interface Props {
  hospedagem: Hospedagem;
  index: number;
}

export function HospedagemCard({ hospedagem, index }: Props) {
  const logoSrc = safeMediaUrl(hospedagem.logoUrl);
  const telefoneHref = `tel:${hospedagem.telefone.replace(/\D/g, "")}`;
  const instagramHref = hospedagem.instagram
    ? `https://instagram.com/${hospedagem.instagram.replace(/^@/, "")}`
    : null;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      {/* Logo / topo do card */}
      <div className="relative flex h-40 items-center justify-center overflow-hidden bg-muted">
        {logoSrc ? (
          <Image
            src={logoSrc}
            alt={`Logo ${hospedagem.nome}`}
            fill
            className="object-contain p-6 transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <span className="text-5xl text-muted-foreground/40">🏨</span>
        )}
      </div>

      {/* Conteúdo */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <h3 className="font-display text-xl font-bold uppercase leading-tight text-card-foreground">
          {hospedagem.nome}
        </h3>

        {/* Diferencial */}
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {hospedagem.textoDiferencial}
        </p>

        {/* Endereço */}
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>{hospedagem.endereco}</span>
        </div>

        {/* Ações */}
        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          {/* Telefone — sempre presente */}
          <a
            href={telefoneHref}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            <Phone className="h-3.5 w-3.5" />
            {hospedagem.telefone}
          </a>

          {/* Instagram — opcional */}
          {instagramHref && (
            <a
              href={instagramHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              <Instagram className="h-3.5 w-3.5" />
              {hospedagem.instagram?.startsWith("@")
                ? hospedagem.instagram
                : `@${hospedagem.instagram}`}
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}
