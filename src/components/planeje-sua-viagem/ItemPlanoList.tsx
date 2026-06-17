"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2, ListX } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { planoViagemApi } from "@/lib/api/plano-viagem";
import type { ItemPlanoViagem } from "@/lib/api/types";
import { ItemPlanoCard } from "./ItemPlanoCard";
import { ItemPlanoForm } from "./ItemPlanoForm";

interface Props {
  planoId: string;
}

export function ItemPlanoList({ planoId }: Props) {
  const [itens, setItens] = useState<ItemPlanoViagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adicionando, setAdicionando] = useState(false);

  useEffect(() => {
    planoViagemApi
      .getById(planoId)
      .then((plano) => setItens(plano.itens ?? []))
      .catch(() => setItens([]))
      .finally(() => setLoading(false));
  }, [planoId]);

  function handleItemAdded(novoItem: ItemPlanoViagem) {
    setItens((prev) => [...prev, novoItem]);
    setAdicionando(false);
  }

  function handleItemDeleted(id: string) {
    setItens((prev) => prev.filter((i) => i.id !== id));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Lista de itens */}
      <AnimatePresence initial={false}>
        {itens.length === 0 && !adicionando ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-2 py-6 text-center"
          >
            <ListX className="h-8 w-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">
              Nenhum item neste plano ainda.
            </p>
          </motion.div>
        ) : (
          itens.map((item, i) => (
            <ItemPlanoCard
              key={item.id}
              item={item}
              index={i}
              onDeleted={handleItemDeleted}
            />
          ))
        )}
      </AnimatePresence>

      {/* Formulário inline de adição */}
      <AnimatePresence>
        {adicionando && (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="rounded-xl border border-primary/30 bg-primary/5 p-4"
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary">
              Adicionar item ao plano
            </p>
            <ItemPlanoForm
              planoId={planoId}
              onSuccess={handleItemAdded}
              onCancel={() => setAdicionando(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botão adicionar item */}
      {!adicionando && (
        <button
          onClick={() => setAdicionando(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
        >
          <Plus className="h-4 w-4" />
          Adicionar item
        </button>
      )}
    </div>
  );
}
