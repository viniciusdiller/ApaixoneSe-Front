import { Waves } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({
  title = "Nenhum resultado encontrado",
  description = "Os dados ainda não foram cadastrados.",
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
      <Waves className="h-12 w-12 text-muted-foreground/30" />
      <h3 className="font-display text-lg uppercase tracking-wide text-muted-foreground">
        {title}
      </h3>
      <p className="max-w-xs text-sm text-muted-foreground/70">{description}</p>
    </div>
  );
}
