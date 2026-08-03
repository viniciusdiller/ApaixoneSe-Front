"use client";

import { toast } from "react-hot-toast";

type ConfirmOptions = {
  title?: string;
  confirmLabel?: string;
  anchor?: HTMLElement | null;
};

/** Mensagens breves para retornos de ações não destrutivas. */
export const notify = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message, { duration: 6000 }),
};

/**
 * Confirmação não bloqueante. Quando recebe o elemento acionado, fica logo acima
 * dele; caso contrário usa o centro da tela para preservar a visibilidade.
 */
export function confirmAction(message: string, options: ConfirmOptions = {}) {
  return new Promise<boolean>((resolve) => {
    const activeElement = typeof document !== "undefined" && document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null;
    const anchor = (options.anchor ?? activeElement)?.getBoundingClientRect();
    const style = anchor
      ? {
          position: "fixed" as const,
          left: `${Math.min(Math.max(anchor.left + anchor.width / 2, 170), window.innerWidth - 170)}px`,
          top: `${Math.max(anchor.top - 12, 12)}px`,
          transform: "translate(-50%, -100%)",
        }
      : undefined;

    const id = toast.custom(
      (current) => (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-label={options.title ?? "Confirmar ação"}
          style={style}
          className={`w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-red-200 bg-white p-4 shadow-xl transition ${
            current.visible ? "opacity-100" : "opacity-0"
          }`}
        >
          <p className="text-sm font-semibold text-slate-900">{options.title ?? "Confirmar ação"}</p>
          <p className="mt-1 text-sm leading-5 text-slate-600">{message}</p>
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => { toast.dismiss(id); resolve(false); }}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              Cancelar
            </button>
            <button
              type="button"
              autoFocus
              onClick={() => { toast.dismiss(id); resolve(true); }}
              className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              {options.confirmLabel ?? "Excluir"}
            </button>
          </div>
        </div>
      ),
      { duration: Infinity, position: anchor ? "top-center" : "top-center" },
    );
  });
}
