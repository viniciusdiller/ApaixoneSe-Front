import { FileCheck2, FileX2 } from "lucide-react";

function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TermoAceiteBadge({
  termoAceiteEm,
}: {
  termoAceiteEm?: string | null;
}) {
  if (!termoAceiteEm) {
    return (
      <span
        title="Sem registro de aceite do Termo de Adesão (cadastro anterior à exigência ou criado pelo admin)"
        className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground"
      >
        <FileX2 size={11} /> Termo não aceito
      </span>
    );
  }

  return (
    <span
      title={`Termo de Adesão aceito em ${formatDateTime(termoAceiteEm)}`}
      className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-950/40 dark:text-green-400"
    >
      <FileCheck2 size={11} /> Termo aceito em {formatDateTime(termoAceiteEm)}
    </span>
  );
}
