import Image from "next/image";

interface DataCardProps {
  nome: string;
  descricao?: string;
  imagem?: string;
  badge?: string;
  extras?: { label: string; value: string }[];
}

export function DataCard({ nome, descricao, imagem, badge, extras }: DataCardProps) {
  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-shadow hover:shadow-md">
      {imagem ? (
        <div className="relative h-44 w-full overflow-hidden">
          <Image
            src={imagem}
            alt={nome}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className="flex h-44 w-full items-center justify-center bg-muted">
          <span className="font-display text-4xl text-muted-foreground/30 uppercase tracking-widest">
            {nome.slice(0, 2)}
          </span>
        </div>
      )}

      {badge && (
        <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground shadow">
          {badge}
        </span>
      )}

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="font-display text-base font-semibold uppercase tracking-wide text-foreground line-clamp-1">
          {nome}
        </h3>
        {descricao && (
          <p className="flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
            {descricao}
          </p>
        )}
        {extras && extras.length > 0 && (
          <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 border-t border-border pt-2">
            {extras.map((e) => (
              <div key={e.label} className="flex gap-1 text-xs">
                <dt className="font-medium text-muted-foreground">{e.label}:</dt>
                <dd className="text-foreground">{e.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}
