import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Roteiro } from "@/lib/roteiros";

interface RoteiroCardProps {
  roteiro: Roteiro;
  destaque?: boolean;
}

export function RoteiroCard({ roteiro, destaque = false }: RoteiroCardProps) {
  return (
    <Link
      href={`/roteiros/${roteiro.slug}`}
      className={`group relative overflow-hidden rounded-2xl ${
        destaque ? "md:col-span-2" : ""
      } flex min-h-[200px] flex-col justify-end`}
    >
      {/* Fundo degradê da categoria */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${roteiro.gradiente} transition-all duration-500 group-hover:brightness-110`}
      />

      {/* Textura sutil */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_white_0%,_transparent_60%)]" />

      {/* Ícone grande decorativo */}
      <div className="absolute right-4 top-4 text-5xl opacity-20 transition-transform duration-500 group-hover:scale-125 group-hover:opacity-30 select-none">
        {roteiro.icon}
      </div>

      {/* Conteúdo */}
      <div className="relative z-10 p-6">
        <span className="mb-2 inline-block text-3xl">{roteiro.icon}</span>
        <h3 className="font-display text-2xl font-bold uppercase tracking-wide text-white drop-shadow">
          {roteiro.label}
        </h3>
        <p className="mt-1 max-w-xs text-sm text-white/80 line-clamp-2">
          {roteiro.descricao}
        </p>
        <div className="mt-4 flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-white/70 transition-all duration-300 group-hover:gap-3 group-hover:text-white">
          <span>Ver atividades</span>
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>

      {/* Linha accent no hover */}
      <div className="absolute bottom-0 left-0 h-1 w-0 bg-accent transition-all duration-500 group-hover:w-full" />
    </Link>
  );
}
