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
          {/* Overlay — cobre tudo incluindo navbar, mas z-[60] fica abaixo do painel */}
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

          {/* Painel
              Mobile  : ocupa a tela toda de top-[64px] até o fundo
              Desktop : centralizado horizontalmente com left-1/2 + -translate-x-1/2,
                        começa em top-[88px] para ficar bem abaixo da navbar
                        e termina em bottom-8 para não encostar no rodapé */}
          <motion.div
            key="panel"
            role="dialog"
            aria-modal="true"
            aria-label="Planeje sua viagem"
            initial={{ opacity: 0, y: 48, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 32, scale: 0.97 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={
              "fixed z-[70] flex flex-col overflow-hidden border border-border bg-background shadow-2xl " +
              // Mobile
              "inset-x-0 bottom-0 top-[64px] rounded-t-2xl " +
              // Desktop
              "md:bottom-8 md:left-1/2 md:right-auto md:top-[88px] md:w-full md:max-w-2xl md:-translate-x-1/2 md:rounded-2xl"
            }
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
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
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
