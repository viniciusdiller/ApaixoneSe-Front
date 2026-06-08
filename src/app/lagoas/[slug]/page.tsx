import Link from "next/link";
import { lagoas } from "@/lib/Dados-Lagoa";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react";
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
    // 1. Removido o pt-32 daqui para tirar o espaço branco
    <main className="min-h-screen bg-background pb-16">
        
      {/* Título e Localização */}
      {/* 2. pt-28 ajustado para pt-32 para compensar a navbar corretamente */}
      <section className="bg-primary px-4 pb-12 pt-32">
        <div className="container mx-auto max-w-4xl">
          <Link
            href="/praias"
            className="mb-4 inline-flex items-center gap-1 text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar para Praias
          </Link>
          <h1 className="font-display text-4xl font-bold uppercase text-primary-foreground md:text-6xl">
            {lagoa.nome}
          </h1>
          <p className="mt-2 text-primary-foreground/80">
            {lagoa.descricao_curta}
          </p>
        </div>
      </section>

      {/* 3. Adicionado mt-10 (margin-top) aqui para descolar a imagem da section azul */}
      <div className="container mx-auto max-w-4xl px-4 mt-10">
        
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