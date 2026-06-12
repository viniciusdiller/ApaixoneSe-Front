import Link from "next/link";
import { LucideIcon } from "lucide-react";

interface CategoriaCardProps {
  href: string;
  titulo: string;
  descricao: string;
  Icone: LucideIcon;
}

export function CategoriaCard({ href, titulo, descricao, Icone }: CategoriaCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-10 text-center transition-all hover:-translate-y-1 hover:border-primary hover:shadow-xl"
    >
      <div className="mb-4 rounded-full bg-primary/10 p-5 text-primary transition-transform duration-300 group-hover:scale-110">
        <Icone className="h-10 w-10" />
      </div>
      <h2 className="font-display text-2xl font-bold uppercase text-foreground transition-colors group-hover:text-primary">
        {titulo}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {descricao}
      </p>
    </Link>
  );
}