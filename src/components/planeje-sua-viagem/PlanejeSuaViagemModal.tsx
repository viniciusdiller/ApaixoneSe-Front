"use client";

import { useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function PlanejeSuaViagemModal({ isOpen, onClose, children }: Props) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, handleKeyDown]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay — z-[60] fica acima da navbar (z-50) */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Painel — z-[70] acima do overlay
              Mobile : começa em 72px (abaixo da navbar ~64px) e vai até o fundo
              Desktop: centralizado com inset-y-8, sem conflito com navbar */}
          <motion.div
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label="Planeje sua viagem"
            initial={{ opacity: 0, y: 48, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-x-0 bottom-0 top-[72px] z-[70] mx-auto flex w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl border border-border bg-background shadow-2xl md:inset-x-auto md:inset-y-8 md:w-[calc(100%-2rem)] md:rounded-2xl"
          >
            {/* Cabeçalho fixo */}
            <div className="flex shrink-0 items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h2 className="font-display text-xl font-bold uppercase tracking-wide text-foreground">
                  Planeje sua Viagem
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Organize seus roteiros em Saquarema
                </p>
              </div>
              <button
                onClick={onClose}
                aria-label="Fechar modal"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Conteúdo rolável */}
            <div className="flex-1 overflow-y-auto px-6 py-6">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
