"use client";

import { Trash2 } from "lucide-react";
import type { ReactNode } from "react";

export interface Column<T> {
  key: keyof T;
  label: string;
  render?: (value: T[keyof T], row: T) => ReactNode;
}

interface Props<T extends { id: string | number }> {
  data: T[];
  columns: Column<T>[];
  onDelete?: (row: T) => void;
  /** Botões extras por linha, exibidos ANTES do botão de excluir */
  extraActions?: (row: T) => ReactNode;
}

export function AdminTable<T extends { id: string | number }>({
  data,
  columns,
  onDelete,
  extraActions,
}: Props<T>) {
  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface py-16 text-center">
        <p className="text-muted-foreground">Nenhum registro encontrado.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-surface">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-offset">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {col.label}
              </th>
            ))}
            {(onDelete || extraActions) && (
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Ações
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={row.id}
              className="border-b border-border last:border-0 transition-colors hover:bg-surface-offset"
            >
              {columns.map((col) => (
                <td key={String(col.key)} className="px-4 py-3 text-foreground">
                  {col.render
                    ? col.render(row[col.key], row)
                    : String(row[col.key] ?? "—")}
                </td>
              ))}
              {(onDelete || extraActions) && (
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {extraActions?.(row)}
                    {onDelete && (
                      <button
                        onClick={() => onDelete(row)}
                        title="Excluir"
                        className="rounded p-1 text-muted-foreground transition hover:bg-error/10 hover:text-error"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
