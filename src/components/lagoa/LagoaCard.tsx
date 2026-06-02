import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin } from "lucide-react";
import type { Lagoa } from "@/lib/Dados-Lagoa";

export function LagoaCard({ lagoa }: { lagoa: Lagoa }) {
  // Formata o filtro (ex: "por_do_sol" vira "por do sol")
  const formatarFiltro = (filtro: string) => {
    return filtro.split('_').join(' ');
  };

  return (
    <Link
      href={`/lagoas/${lagoa.slug}`}
      className="group block overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-xl"
    >
      {/* Container da Imagem */}
      <div className="relative h-48 overflow-hidden bg-primary/20">
        <Image
          src={lagoa.imagem}
          alt={lagoa.nome}
          width={400}
          height={300}
          className="h-full w-full object-cover"
        />
        {/* Gradiente escuro sobreposto na imagem para dar leitura às tags */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        {/* Tags com os filtros posicionadas sobre a imagem */}
        <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-1.5">
          {lagoa.filtros.map((filtro, idx) => (
            <span
              key={idx}
              className="rounded-md bg-restinga/20 px-2 py-0.5 text-xs font-medium text-restinga backdrop-blur-sm uppercase"
            >
              {formatarFiltro(filtro)}
            </span>
          ))}
        </div>
      </div>

      {/* Conteúdo de Texto do Card */}
      <div className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-display text-xl font-bold uppercase text-foreground transition-colors group-hover:text-primary">
              {lagoa.nome}
            </h3>
            <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>Saquarema, RJ</span>
            </div>
          </div>
          {/* Seta indicativa que muda de cor no hover do card */}
          <ArrowRight className="mt-1 h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
        </div>
        
        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
          {lagoa.descricao_curta}
        </p>
      </div>
    </Link>
  );
}