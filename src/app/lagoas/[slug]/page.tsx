import { lagoas } from "@/lib/Dados-Lagoa";
import { notFound } from "next/navigation";
import Image from "next/image";
import { MapPin } from "lucide-react";

// 1. ESTA É A FUNÇÃO QUE FALTAVA!
// Ela diz ao Next.js quais são todos os "slugs" possíveis na hora de construir o site estático.
export function generateStaticParams() {
  return lagoas.map((lagoa) => ({
    slug: lagoa.slug,
  }));
}

export default function LagoaDetalhesPage({ params }: { params: { slug: string } }) {
  // Busca a lagoa que tem o slug igual ao da URL
  const lagoa = lagoas.find((l) => l.slug === params.slug);

  // Se o usuário digitar um slug que não existe, manda para a página 404
  if (!lagoa) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-background pb-16 pt-32">
      <div className="container mx-auto max-w-4xl px-4">
        
        {/* Título e Localização */}
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold uppercase text-foreground md:text-5xl">
            {lagoa.nome}
          </h1>
          <div className="mt-2 flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>Saquarema, RJ</span>
          </div>
        </div>

        {/* Imagem de Destaque */}
        <div className="relative mb-8 h-[40vh] w-full overflow-hidden rounded-3xl md:h-[60vh]">
          <Image
            src={lagoa.imagem}
            alt={lagoa.nome}
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Tags / Filtros */}
        <div className="mb-8 flex flex-wrap gap-2">
          {lagoa.filtros.map((filtro) => (
            <span
              key={filtro}
              className="rounded-full bg-primary/10 px-4 py-1.5 text-sm font-semibold uppercase text-primary"
            >
              {filtro.replace(/_/g, ' ')}
            </span>
          ))}
        </div>

        {/* Descrição Completa */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <h2 className="text-2xl font-bold">Sobre a Lagoa</h2>
          <p className="text-muted-foreground leading-relaxed whitespace-pre-line">
            {lagoa.descricao}
          </p>
        </div>

      </div>
    </main>
  );
}