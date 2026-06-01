import Link from "next/link";
import type { Lagoa } from "@/lib/Dados-Lagoa";

export function LagoaCard({ lagoa }: { lagoa: Lagoa }) {
  // Formata o filtro (ex: "por_do_sol" vira "Por Do Sol")
  const formatarFiltro = (filtro: string) => {
    return filtro.split('_').join(' ');
  };

  return (
    <Link href={`/lagoas/${lagoa.slug}`}>
      <article className="group overflow-hidden rounded-2xl border border-border bg-card transition-all hover:shadow-md cursor-pointer flex flex-col h-full">
        <div
          className="h-52 bg-cover bg-center shrink-0 transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url(${lagoa.imagem})` }}
        />
        <div className="p-5 flex flex-col grow bg-card relative z-10">
          <h3 className="font-display text-2xl font-bold uppercase">
            {lagoa.nome}
          </h3>
          
          {/* Mostra a descrição curta em vez da longa */}
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2 grow">
            {lagoa.descricao_curta}
          </p>

          {/* Renderiza as tags dos filtros */}
          <div className="mt-4 flex flex-wrap gap-2">
            {lagoa.filtros.slice(0, 2).map((filtro, idx) => (
              <span 
                key={idx} 
                className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold uppercase text-primary"
              >
                {formatarFiltro(filtro)}
              </span>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-border">
            <span className="text-sm font-semibold text-primary transition-colors hover:text-primary/80">
              Explorar lagoa &rarr;
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}