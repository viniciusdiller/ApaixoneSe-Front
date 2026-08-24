"use client";

import Image from "next/image";
import {
  Phone,
  MapPin,
  Instagram,
  Languages,
  Route,
  Globe,
  Tag,
} from "lucide-react";
import { motion } from "framer-motion";
import { safeMediaUrl } from "@/lib/safeMediaUrl";
import type { ServicoTurista, TipoServicoTurista } from "@/lib/api";
import { ROTEIROS } from "@/lib/roteiros";
import { MODALIDADE_LABELS } from "@/lib/api/servico-turista";

const TIPO_LABEL: Record<TipoServicoTurista, string> = {
  GUIA_TURISMO: "Guia de Turismo",
  AGENCIA_TURISMO: "Agência de Turismo",
  ESPORTE_LAZER: "Esportes & Lazer",
  LOCADORA_VEICULOS: "Locadora de Veículos",
};

interface Props {
  servico: ServicoTurista;
  index: number;
}

export function ServicoTuristaCard({ servico, index }: Props) {
  const logoSrc = safeMediaUrl(servico.logoUrl);
  const fotoSrc = safeMediaUrl(servico.fotoUrl);
  const imageSrc = logoSrc || fotoSrc;

  const telefoneHref = `tel:${servico.telefone.replace(/\D/g, "")}`;

  const instagramHandle = servico.instagram
    ? servico.instagram.replace(/^@/, "")
    : null;
  const instagramHref = instagramHandle
    ? `https://instagram.com/${instagramHandle}`
    : null;

  const podeExibirRoteiro =
    servico.tipo === "GUIA_TURISMO" || servico.tipo === "AGENCIA_TURISMO";
  const roteiroLabels =
    podeExibirRoteiro && Array.isArray(servico.roteiros)
      ? servico.roteiros
          .map((r) => ROTEIROS.find((rt) => rt.enum === r)?.label)
          .filter((label): label is string => Boolean(label))
      : [];

  const siteUrl = (servico as ServicoTurista & { site?: string }).site;
  const siteHref = siteUrl
    ? siteUrl.startsWith("http")
      ? siteUrl
      : `https://${siteUrl}`
    : null;
  const siteLabel = siteUrl
    ? siteUrl.replace(/^https?:\/\//, "").replace(/\/$/, "")
    : null;

  const modalidades =
    servico.tipo === "ESPORTE_LAZER" && Array.isArray(servico.modalidades)
      ? servico.modalidades
      : [];

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
      {/* Banner superior com logo/foto */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/10 via-primary/5 to-transparent">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 50%)",
            backgroundSize: "12px 12px",
          }}
        />

        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={`Logo ${servico.nome}`}
            fill
            className="object-contain p-8 transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="font-display text-5xl font-bold uppercase tracking-wider text-primary/20">
              {servico.nome
                .split(" ")
                .slice(0, 2)
                .map((w) => w[0])
                .join("")}
            </span>
          </div>
        )}

        {/* Badge tipo */}
        <div className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-primary-foreground shadow">
          {TIPO_LABEL[servico.tipo]}
        </div>

        {/* Badge(s) roteiro */}
        {roteiroLabels.length > 0 && (
          <div className="absolute right-3 top-3 flex flex-col items-end gap-1">
            {roteiroLabels.map((label) => (
              <div
                key={label}
                className="flex items-center gap-1 rounded-full bg-accent px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-accent-foreground shadow"
              >
                <Route className="h-3 w-3" />
                {label}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="flex flex-1 flex-col gap-4 p-5">
        <h3 className="font-display text-xl font-bold uppercase leading-tight tracking-wide text-card-foreground">
          {servico.nome}
        </h3>

        {servico.endereco && (
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span className="text-sm text-muted-foreground">
              {servico.endereco}
            </span>
          </div>
        )}

        {siteHref && siteLabel && (
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 shrink-0 text-primary" />
            <a
              href={siteHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline truncate"
            >
              {siteLabel}
            </a>
          </div>
        )}

        {servico.idiomas && (
          <div className="flex items-start gap-2">
            <Languages className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span className="text-sm text-muted-foreground">
              {servico.idiomas}
            </span>
          </div>
        )}

        {/* Roteiros vinculados — também no corpo do card */}
        {roteiroLabels.length > 0 && (
          <div className="flex items-start gap-2">
            <Route className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span className="text-sm text-muted-foreground">
              Roteiros:{" "}
              <span className="font-medium text-foreground">
                {roteiroLabels.join(", ")}
              </span>
            </span>
          </div>
        )}

        {modalidades.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <Tag className="h-4 w-4 shrink-0 text-primary" />
            {modalidades.map((m) => (
              <span
                key={m}
                className="rounded-full bg-accent px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent-foreground"
              >
                {MODALIDADE_LABELS[m as keyof typeof MODALIDADE_LABELS] ?? m}
              </span>
            ))}
          </div>
        )}

        {servico.descricao && (
          <div className="rounded-xl border border-border/60 bg-muted/40 px-4 py-3">
            <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
              {servico.descricao}
            </p>
          </div>
        )}

        <div className="mt-auto flex flex-wrap gap-2 pt-1">
          <a
            href={telefoneHref}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 hover:shadow-md active:scale-[0.98]"
          >
            <Phone className="h-4 w-4" />
            {servico.telefone}
          </a>

          {instagramHref && instagramHandle && (
            <a
              href={instagramHref}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Instagram de ${servico.nome}`}
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
