"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

interface AdminModalProps {
  title: string;
  open: boolean;
  onClose: () => void;
  onSubmit?: () => void;
  saving?: boolean;
  submitLabel?: string;
  children: React.ReactNode;
}

export function AdminModal({
  title,
  open,
  onClose,
  onSubmit,
  saving,
  submitLabel,
  children,
}: AdminModalProps) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl border border-border bg-card shadow-2xl">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-6 sm:py-4">
          <h2 className="font-display text-base font-bold uppercase tracking-widest text-foreground">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-col gap-4">{children}</div>
        </div>

        {/* Footer com botões — só renderiza se onSubmit for passado */}
        {onSubmit && (
          <div className="flex shrink-0 flex-wrap justify-end gap-3 border-t border-border px-4 py-3 sm:px-6 sm:py-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={saving}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
            >
              {submitLabel || (saving ? "Salvando..." : "Salvar")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
