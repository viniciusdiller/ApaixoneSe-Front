"use client";

import { useEffect, useState } from "react";
import { Plus, Loader2, Map } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { planoViagemApi } from "@/lib/api/plano-viagem";
import type { PlanoViagem } from "@/lib/api/types";
import { useAuth } from "@/context/AuthContext";
import { PlanoViagemCard } from "./PlanoViagemCard";
import { PlanoViagemForm } from "./PlanoViagemForm";

export function PlanoViagemList() {
  const { user } = useAuth();
  const [planos, setPlanos] = useState<PlanoViagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [criando, setCriando] = useState(false);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    planoViagemApi
      .getAll()
      .then((todos) =>
        setPlanos(todos.filter((p) => p.usuarioId === user.id))
      )
      .catch(() => setPlanos([]))
      .finally(() => setLoading(false));
  }, [user]);

  function handleCriado(novoPlano: PlanoViagem) {
    setPlanos((prev) => [novoPlano, ...prev]);
    setCriando(false);
  }

  function handleDeletado(id: string) {
    setPlanos((prev) => prev.filter((p) => p.id !== id));
  }

  function handleAtualizado(planoAtualizado: PlanoViagem) {
    setPlanos((prev) =>
      prev.map((p) => (p.id === planoAtualizado.id ? planoAtualizado : p))
    );
  }

  /* Usuário não logado */
  if (!user) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <Map className="h-12 w-12 text-muted-foreground/30" />
        <div>
          <p className="font-display text-lg font-semibold text-foreground">
            Entre na sua conta
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Faça login para criar e gerenciar seus planos de viagem.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Cabeçalho com contador e botão */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {planos.length === 0
            ? "Você ainda não tem planos."
            : `${planos.length} plano${planos.length > 1 ? "s" : ""} encontrado${planos.length > 1 ? "s" : ""}`}
        </p>
        <button
          onClick={() => setCriando((p) => !p)}
          aria-expanded={criando}
          className="flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Novo plano
        </button>
      </div>

      {/* Formulário de criação inline */}
      <AnimatePresence>
        {criando && (
          <motion.div
            key="form-criar"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="rounded-2xl border border-primary/30 bg-primary/5 p-5"
          >
            <p className="mb-4 font-display text-sm font-bold uppercase tracking-wider text-primary">
              Novo plano de viagem
            </p>
            <PlanoViagemForm
              onSuccess={handleCriado}
              onCancel={() => setCriando(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista vazia */}
      {planos.length === 0 && !criando && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-14 text-center">
          <Map className="h-10 w-10 text-muted-foreground/30" />
          <p className="font-display text-base font-semibold text-muted-foreground">
            Crie seu primeiro plano!
          </p>
          <p className="max-w-xs text-sm text-muted-foreground/70">
            Organize restaurantes, hospedagens, atividades e eventos num só lugar.
          </p>
        </div>
      )}

      {/* Planos */}
      <AnimatePresence initial={false}>
        {planos.map((plano, i) => (
          <PlanoViagemCard
            key={plano.id}
            plano={plano}
            index={i}
            onDeleted={handleDeletado}
            onUpdated={handleAtualizado}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
