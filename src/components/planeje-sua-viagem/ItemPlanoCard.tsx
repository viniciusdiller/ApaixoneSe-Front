"use client";

import { useState } from "react";
import {
  Utensils,
  BedDouble,
  CalendarDays,
  Bike,
  Compass,
  Trash2,
  Loader2,
  Clock,
  StickyNote,
  Info,
} from "lucide-react";
import { motion } from "framer-motion";
import { itemPlanoViagemApi } from "@/lib/api/plano-viagem";
import type { ItemPlanoViagem } from "@/lib/api/types";

interface Props {
  item: ItemPlanoViagem;
  index: number;
  onDeleted: (id: string) => void;
}

function getCategoria(item: ItemPlanoViagem) {
  if (item.gastronomia)
    return {
      icon: <Utensils className="h-4 w-4" />,
      label: "Restaurante",
      nome: item.gastronomia.nome,
      detalhe: item.gastronomia.endereco,
      color:
        "text-orange-600 bg-orange-50 dark:bg-orange-900/20 dark:text-orange-400",
    };
  if (item.hospedagem)
    return {
      icon: <BedDouble className="h-4 w-4" />,
      label: "Hospedagem",
      nome: item.hospedagem.nome,
      detalhe: item.hospedagem.endereco,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400",
    };
  if (item.evento)
    return {
      icon: <CalendarDays className="h-4 w-4" />,
      label: "Evento",
      nome: item.evento.titulo,
      detalhe: item.evento.local,
      color:
        "text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400",
    };
  if (item.atividade)
    return {
      icon: <Bike className="h-4 w-4" />,
      label: "Atividade",
      nome: item.atividade.titulo,
      detalhe: item.atividade.local,
      color:
        "text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400",
    };
  if (item.servicoTurista)
    return {
      icon: <Compass className="h-4 w-4" />,
      label: "Serviço",
      nome: item.servicoTurista.nome,
      detalhe: item.servicoTurista.tipo.replace(/_/g, " "),
      color: "text-teal-600 bg-teal-50 dark:bg-teal-900/20 dark:text-teal-400",
    };
  return {
    icon: <Info className="h-4 w-4" />,
    label: "Item",
    nome: "Item sem detalhes",
    detalhe: undefined,
    color: "text-muted-foreground bg-muted",
  };
}

function formatDataHora(iso: string) {
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export function ItemPlanoCard({ item, index, onDeleted }: Props) {
  const [deletando, setDeletando] = useState(false);
  const [confirmar, setConfirmar] = useState(false);
  const cat = getCategoria(item);

  async function handleDelete() {
    if (!confirmar) {
      setConfirmar(true);
      return;
    }
    setDeletando(true);
    try {
      await itemPlanoViagemApi.remove(item.id);
      onDeleted(item.id);
    } catch {
      setDeletando(false);
      setConfirmar(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 8 }}
      transition={{ duration: 0.2, delay: index * 0.04 }}
      className="group flex items-start gap-3 rounded-xl border border-border bg-background p-3.5 transition-shadow hover:shadow-sm"
    >
      {/* Ícone de categoria */}
      <div
        className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${cat.color}`}
      >
        {cat.icon}
      </div>

      {/* Conteúdo */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2 py-0.5 text-xs font-semibold ${cat.color}`}
          >
            {cat.label}
          </span>
          {/* Aviso: não é reserva */}
          <span className="rounded-full border border-amber-400/40 bg-amber-50 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
            Apenas planejado — sem reserva
          </span>
        </div>

        <p className="truncate text-sm font-semibold text-foreground">
          {cat.nome}
        </p>

        {cat.detalhe && (
          <p className="truncate text-xs text-muted-foreground">
            {cat.detalhe}
          </p>
        )}

        <div className="mt-1 flex flex-col items-start gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatDataHora(item.dataHoraAgendada)}
          </span>
          {item.anotacao && (
            <span className="flex items-start gap-1">
              <StickyNote className="h-3.5 w-3.5" />
              <span className="">{item.anotacao}</span>
            </span>
          )}
        </div>
      </div>

      {/* Botão deletar */}
      <button
        type="button"
        onClick={handleDelete}
        disabled={deletando}
        className={`shrink-0 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${
          confirmar
            ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
            : "text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
        }`}
        title={confirmar ? "Clique para confirmar a exclusão" : "Remover item"}
      >
        {deletando ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : confirmar ? (
          "Confirmar"
        ) : (
          <Trash2 className="h-3.5 w-3.5" />
        )}
      </button>
    </motion.div>
  );
}
