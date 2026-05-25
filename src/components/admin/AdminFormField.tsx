import React from "react";

interface AdminFormFieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  children: React.ReactNode;
}

/**
 * Wrapper genérico de campo de formulário.
 * Renderiza label + qualquer elemento filho (input, select, textarea, FileUploadField, etc.)
 *
 * Uso:
 *   <AdminFormField label="Nome *" htmlFor="nome">
 *     <input id="nome" value={...} onChange={...} className="..." />
 *   </AdminFormField>
 */
export function AdminFormField({ label, htmlFor, error, children }: AdminFormFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={htmlFor}
        className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
      >
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
