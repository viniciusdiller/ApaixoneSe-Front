"use client";

import { confirmAction, notify } from "@/lib/feedback";

import { useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  FileDown,
  Loader2,
  Pencil,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { PlanoViagem } from "@/lib/api/types";
import { planoViagemApi } from "@/lib/api/plano-viagem";
import { PlanoViagemForm } from "./PlanoViagemForm";
import { ItemPlanoList } from "./ItemPlanoList";
import { usePlanoViagemPDF } from "./pdf/usePlanoViagemPDF";

interface Props {
  plano: PlanoViagem;
  index: number;
  onDeleted: (id: string) => void;
  onUpdated: (plano: PlanoViagem) => void;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function PlanoViagemCard({ plano, index, onDeleted, onUpdated }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deletando, setDeletando] = useState(false);

  const { exportando, exportarPDF } = usePlanoViagemPDF(plano);

  async function handleDelete() {
    if (!(await confirmAction(`Excluir o plano "${plano.titulo}"?`))) return;
    setDeletando(true);
    try {
      await planoViagemApi.remove(plano.id);
      onDeleted(plano.id);
    } catch {
      notify.error("Erro ao excluir. Tente novamente.");
    } finally {
      setDeletando(false);
    }
  }

  if (editing) {
    return (
      <div className="rounded-2xl border border-primary/40 bg-card p-5">
        <p className="mb-4 font-display text-sm font-semibold uppercase tracking-wide text-primary">
          Editar plano
        </p>
        <PlanoViagemForm
          plano={plano}
          onSuccess={(atualizado) => {
            onUpdated(atualizado);
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
    >
      {/* Cabeçalho do card */}
      <div className="flex items-start justify-between gap-4 p-5">
        <div className="flex flex-1 flex-col gap-1">
          <h3 className="font-display text-lg font-bold uppercase tracking-wide text-card-foreground">
            {plano.titulo}
          </h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5 text-primary" />
              {formatDate(plano.dataInicio)}
            </span>
            <span className="text-xs text-muted-foreground/50">→</span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5 text-primary" />
              {formatDate(plano.dataFim)}
            </span>
          </div>
        </div>

        {/* Ações */}
        <div className="flex shrink-0 items-center gap-1">
          {/* Exportar PDF */}
          <button
            onClick={exportarPDF}
            disabled={exportando}
            aria-label="Exportar plano como PDF"
            title="Exportar PDF"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary disabled:opacity-50"
          >
            {exportando ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FileDown className="h-3.5 w-3.5" />
            )}
          </button>

          {/* Editar */}
          <button
            onClick={() => setEditing(true)}
            aria-label="Editar plano"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>

          {/* Excluir */}
          <button
            onClick={handleDelete}
            disabled={deletando}
            aria-label="Excluir plano"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive disabled:opacity-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>

          {/* Expandir itens */}
          <button
            onClick={() => setExpanded((p) => !p)}
            aria-expanded={expanded}
            aria-label={expanded ? "Fechar itens" : "Ver itens do plano"}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Itens expansíveis */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-5 pb-5 pt-4">
              <ItemPlanoList planoId={plano.id} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
