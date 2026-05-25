"use client";

import { useRef, useState } from "react";
import { Upload, X, FileText, Image as ImageIcon } from "lucide-react";
import { safeMediaUrl } from "@/lib/safeMediaUrl";

type Accept = "image" | "pdf" | "any";

interface FileUploadFieldProps {
  label: string;
  currentUrl?: string;
  onFileChange: (localUrl: string, file: File) => void;
  onClear?: () => void;
  accept?: Accept;
  required?: boolean;
  hint?: string;
}

const ACCEPT_MAP: Record<Accept, string> = {
  image: "image/*",
  pdf: "application/pdf",
  any: "image/*,application/pdf",
};

export function FileUploadField({
  label,
  currentUrl = "",
  onFileChange,
  onClear,
  accept = "any",
  required,
  hint,
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [localPreview, setLocalPreview] = useState<string>("");
  const [localName, setLocalName] = useState<string>("");

  // Para preview: prefere blob local; se não houver, usa a URL do servidor (encodada)
  const serverPreview = safeMediaUrl(currentUrl);
  const previewUrl = localPreview || serverPreview;
  const isPdf =
    localName.toLowerCase().endsWith(".pdf") ||
    currentUrl.toLowerCase().includes(".pdf");

  function handleFile(file: File) {
    setLocalName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      setLocalPreview(url);
      onFileChange(url, file);
    };
    reader.readAsDataURL(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }

  function handleClear() {
    setLocalPreview("");
    setLocalName("");
    if (inputRef.current) inputRef.current.value = "";
    onClear?.();
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}{required && " *"}
      </label>

      {previewUrl ? (
        <div className="relative flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-3">
          {isPdf ? (
            <a
              href={previewUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-md bg-primary/10 px-3 py-2 text-sm text-primary hover:bg-primary/20 transition"
            >
              <FileText className="h-4 w-4" />
              <span className="font-medium">Ver PDF</span>
            </a>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewUrl}
              alt={label}
              className="h-16 w-16 rounded-md object-cover border border-border"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="truncate text-sm text-foreground">
              {localName || currentUrl.split("/").pop()}
            </p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-xs text-primary hover:underline"
            >
              Trocar arquivo
            </button>
          </div>
          <button
            type="button"
            onClick={handleClear}
            className="shrink-0 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition"
            aria-label="Remover arquivo"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-6 text-sm transition ${
            dragging
              ? "border-primary bg-primary/5 text-primary"
              : "border-border text-muted-foreground hover:border-primary/50 hover:bg-muted/40"
          }`}
        >
          {accept === "pdf" ? (
            <FileText className="h-6 w-6" />
          ) : (
            <ImageIcon className="h-6 w-6" />
          )}
          <span>
            <span className="font-medium text-primary">Clique para selecionar</span>
            {" "}ou arraste aqui
          </span>
          {hint && <span className="text-xs">{hint}</span>}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT_MAP[accept]}
        onChange={handleInputChange}
        className="hidden"
      />
    </div>
  );
}
