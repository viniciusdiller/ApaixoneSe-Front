import Link from "next/link";
import { ArrowRight, LucideIcon } from "lucide-react";

interface CategoriaCardProps {
  href: string;
  titulo: string;
  descricao: string;
  Icone: LucideIcon;
}

export function CategoriaCard({
  href,
  titulo,
  descricao,
  Icone,
}: CategoriaCardProps) {
  return (
    <Link
      href={href}
      className="group relative flex h-full flex-col overflow-hidden rounded-[28px] border border-border/70 bg-card/95 p-8 text-left shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/10"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(1,105,111,0.12),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(218,113,1,0.08),transparent_34%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <div className="relative flex h-full flex-col">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="rounded-3xl border border-primary/10 bg-primary/10 p-4 text-primary shadow-sm transition-transform duration-300 group-hover:scale-105 group-hover:bg-primary/15">
            <Icone className="h-8 w-8" />
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground transition-colors duration-300 group-hover:border-primary/20 group-hover:text-primary">
            Avançar
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
          </span>
        </div>

        <div className="space-y-3">
          <h2 className="font-display text-3xl font-bold uppercase leading-none text-foreground transition-colors duration-300 group-hover:text-primary">
            {titulo}
          </h2>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            {descricao}
          </p>
        </div>
      </div>
    </Link>
  );
}
