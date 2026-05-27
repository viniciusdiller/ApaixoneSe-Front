import { notFound } from "next/navigation";
import { dadosDosMeses } from "@/lib/eventos";
import { MesPageClient } from "./MesPageClient";

interface Props {
  params: { mes: string };
}

// Obrigatório com output: export — define as rotas estáticas geradas no build
export function generateStaticParams() {
  return Object.keys(dadosDosMeses).map((mes) => ({ mes }));
}

export default function MesPage({ params }: Props) {
  const mesAtual = dadosDosMeses[params.mes];
  if (!mesAtual) notFound();

  return <MesPageClient mes={params.mes} mesAtual={mesAtual} />;
}
