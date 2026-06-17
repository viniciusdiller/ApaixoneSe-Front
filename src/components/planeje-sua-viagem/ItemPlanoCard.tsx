"use client";

import { useState } from "react";
import { Clock, Trash2, UtensilsCrossed, BedDouble, CalendarDays, Bike, HandHelpingIcon } from "lucide-react";
import { motion } from "framer-motion";
import type { ItemPlanoViagem } from "@/lib/api/types";
import { itemPlanoViagemApi } from "@/lib/api/plano-viagem";

interface Props {
  item: ItemPlanoViagem;
  index: number;
  onDeleted: (id: string) => void;
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function resolveItemInfo(item: ItemPlanoViagem): {
  icon: React.ElementType;
  label: string;
  sublabel?: string;
} {
  if (item.gastronomia)
    return {
      icon: UtensilsCrossed,
      label: item.gastronomia.nome,
      sublabel: item.gastronomia.endereco,
    };
  if (item.hospedagem)
    return {
      icon: BedDouble,
      label: item.hospedagem.nome,
      sublabel: item.hospedagem.endereco,
    };
  if (item.evento)
    return {
      icon: CalendarDays,
      label: item.evento.titulo,
      sublabel: item.evento.local,
    };
  if (item.atividade)
    return {
      icon: Bike,
      label: item.atividade.titulo,
      sublabel: item.atividade.local,
    };
  if (item.servicoTurista)
    return {
      icon: HandHelpingIcon,
      label: item.servicoTurista.nome,
      sublabel: item.servicoTurista.tipo,
    };
  return { icon: Clock, label: "Item sem categoria" };
}

export function ItemPlanoCard({ item, index, onDeleted }: Props) {
  const [deletando, setDeletando] = useState(false);
  const { icon: Icon, label, sublabel } = resolveItemInfo(item);

  async function handleDelete() {
    if (!confirm(`Remover "${label}" do plano?`)) return;
    setDeletando(true);
    try {
      await itemPlanoViagemApi.remove(item.id);
      onDeleted(item.id);
    } catch {
      alert("Erro ao remover item. Tente novamente.");
    } finally {
      setDeletando(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      className="group flex items-start gap-3 rounded-xl border border-border bg-background px-4 py-3 transition-shadow hover:shadow-sm"
    >
      {/* Ícone da categoria */}
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>

      {/* Conteúdo */}
      <div className="flex flex-1 flex-col gap-0.5 min-w-0">
        <span className="truncate text-sm font-semibold text-foreground">
          {label}
        </span>
        {sublabel && (
          <span className="truncate text-xs text-muted-foreground">
            {sublabel}
          </span>
        )}
        <div className="mt-1 flex items-center gap-1.5">
          <Clock className="h-3 w-3 text-muted-foreground/60" />
          <span className="text-xs text-muted-foreground">
            {formatDateTime(item.dataHoraAgendada)}
          </span>
        </div>
        {item.anotacao && (
          <p className="mt-1.5 rounded-lg bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
            {item.anotacao}
          </p>
        )}
      </div>

      {/* Botão remover */}
      <button
        onClick={handleDelete}
        disabled={deletando}
        aria-label="Remover item"
        className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground opacity-0 transition-all group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  );
}
