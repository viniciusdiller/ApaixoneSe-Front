"use client";

import { useState } from "react";
import { FileText, ZoomIn, X } from "lucide-react";

interface MediaPreviewProps {
  url: string;
  label?: string;
  /** Se true, trata como PDF e exibe badge em vez de imagem */
  isPdf?: boolean;
}

/**
 * Exibe um thumbnail clicável.
 * - Imagem → abre lightbox com a imagem em tamanho grande
 * - PDF   → badge que abre o arquivo em nova aba
 */
export function MediaPreview({ url, label = "Arquivo", isPdf = false }: MediaPreviewProps) {
  const [open, setOpen] = useState(false);

  if (!url) return <span className="text-xs text-muted-foreground">—</span>;

  if (isPdf) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/20 transition"
        title={label}
      >
        <FileText className="h-3.5 w-3.5" />
        Ver PDF
      </a>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group relative inline-block rounded-md overflow-hidden border border-border focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label={`Ver ${label}`}
        title={`Ver ${label}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={label}
          width={48}
          height={48}
          className="h-12 w-12 object-cover"
          loading="lazy"
        />
        <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition">
          <ZoomIn className="h-4 w-4 text-white opacity-0 group-hover:opacity-100 transition" />
        </span>
      </button>

      {/* Lightbox */}
      {open && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label={label}
        >
          <div
            className="relative max-h-[90vh] max-w-[90vw]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute -right-3 -top-3 z-10 rounded-full bg-white p-1.5 text-gray-800 shadow-lg hover:bg-gray-100 transition"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={label}
              className="max-h-[85vh] max-w-[85vw] rounded-lg object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
}
