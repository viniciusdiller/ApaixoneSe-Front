import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react"; // Ícones de clima removidos daqui
import { praias } from "@/lib/Dados-Praia";
import { BeachConditions } from "@/components/praia/condicao-praia"; // <--- Importe o novo componente

export function generateStaticParams() {
  return praias.map((p) => ({ slug: p.slug }));
}

export default function PraiaDetalhePage({
  params,
}: {
  params: { slug: string };
}) {
  const praia = praias.find((p) => p.slug === params.slug);
  if (!praia) notFound();

  return (
    <div className="min-h-screen bg-background">
      <section className="bg-primary px-4 pb-12 pt-28">
        <div className="container mx-auto max-w-4xl">
          <Link
            href="/praias"
            className="mb-4 inline-flex items-center gap-1 text-sm text-primary-foreground/70 transition-colors hover:text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Voltar para Praias
          </Link>
          <h1 className="font-display text-4xl font-bold uppercase text-primary-foreground md:text-6xl">
            {praia.nome}
          </h1>
          <p className="mt-2 text-primary-foreground/80">
            {praia.descricao_curta}
          </p>
        </div>
      </section>

      <div className="container mx-auto max-w-4xl px-4 py-12">
        {/* Aqui entra o componente que conecta na API */}
        <BeachConditions lat={praia.lat} lng={praia.lng} />
        <div className="mb-12">
          <h2 className="mb-4 font-display text-2xl font-bold uppercase text-foreground">
            Sobre a Praia
          </h2>
          <p className="leading-relaxed text-muted-foreground">
            {praia.descricao}
          </p>
        </div>

        <div className="mb-12">
          <h2 className="mb-4 font-display text-2xl font-bold uppercase text-foreground">
            Informações Práticas
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <InfoItem label="Dificuldade" value={praia.dificuldade} />
            <InfoBool label="Estacionamento" value={praia.estacionamento} />
            <InfoBool label="Quiosques" value={praia.quiosques} />
            <InfoBool label="Acessível" value={praia.acessivel} />
          </div>
        </div>
      </div>
    </div>
  );
}

// Funções auxiliares (InfoItem, InfoBool) continuam aqui...
function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted p-3">
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 font-medium capitalize text-foreground">{value}</p>
    </div>
  );
}

function InfoBool({ label, value }: { label: string; value: boolean }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
      {value ? (
        <CheckCircle className="h-4 w-4 text-restinga" />
      ) : (
        <XCircle className="h-4 w-4 text-muted-foreground" />
      )}
      <div>
        <p className="text-xs uppercase text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-sm font-medium text-foreground">
          {value ? "Sim" : "Não"}
        </p>
      </div>
    </div>
  );
}
