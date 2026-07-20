import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MapPin } from "lucide-react";
import type { PontoAgua } from "@/lib/api";
import { safeMediaUrl } from "@/lib/safeMediaUrl";

export function LagoaCard({ lagoa }: { lagoa: PontoAgua }) {
  const src = safeMediaUrl(lagoa.imagemUrl);

  return (
    <Link
      href={`/lagoas/${lagoa.slug}`}
      className="group block overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-xl"
    >
      <div className="relative h-48 overflow-hidden bg-primary/20">
        {src && (
          <Image
            src={src}
            alt={lagoa.nome}
            fill
            className="object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        <div className="absolute bottom-3 left-3 flex flex-wrap items-center gap-1.5">
          {(lagoa.filtros ?? []).map((f) => (
            <span
              key={f}
              className="rounded-md bg-restinga/20 px-2 py-0.5 text-xs font-medium text-restinga backdrop-blur-sm"
            >
              {f.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      </div>
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
          <ArrowRight className="mt-1 h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {lagoa.descricaoCurta}
        </p>
      </div>
    </Link>
  );
}
