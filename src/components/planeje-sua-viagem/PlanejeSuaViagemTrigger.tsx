"use client";

import { useState } from "react";
import { PlanejeSuaViagemModal } from "./PlanejeSuaViagemModal";
import { PlanoViagemList } from "./PlanoViagemList";

interface Props {
  /** Permite sobrescrever o visual do botão via className */
  className?: string;
  children?: React.ReactNode;
}

export function PlanejeSuaViagemTrigger({ className, children }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={className}
        aria-haspopup="dialog"
      >
        {children ?? "Planeje sua Viagem"}
      </button>

      <PlanejeSuaViagemModal isOpen={open} onClose={() => setOpen(false)}>
        <PlanoViagemList />
      </PlanejeSuaViagemModal>
    </>
  );
}
