import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function AdminPagination({ page, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null;

  // gera janela de páginas: sempre mostra até 5 botões centrados na atual
  const delta = 2;
  const range: (number | "...")[] = [];
  const left = Math.max(1, page - delta);
  const right = Math.min(totalPages, page + delta);

  if (left > 1) {
    range.push(1);
    if (left > 2) range.push("...");
  }
  for (let i = left; i <= right; i++) range.push(i);
  if (right < totalPages) {
    if (right < totalPages - 1) range.push("...");
    range.push(totalPages);
  }

  return (
    <div className="mt-4 flex items-center justify-center gap-1">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="Página anterior"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronLeft size={15} />
      </button>

      {range.map((item, i) =>
        item === "..." ? (
          <span key={`ellipsis-${i}`} className="flex h-8 w-8 items-center justify-center text-sm text-muted-foreground">
            …
          </span>
        ) : (
          <button
            key={item}
            onClick={() => onPageChange(item as number)}
            aria-current={item === page ? "page" : undefined}
            className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium transition ${
              item === page
                ? "bg-primary text-primary-foreground shadow-sm"
                : "border border-border bg-card text-foreground hover:bg-muted"
            }`}
          >
            {item}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Próxima página"
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition hover:bg-muted disabled:pointer-events-none disabled:opacity-40"
      >
        <ChevronRight size={15} />
      </button>
    </div>
  );
}
