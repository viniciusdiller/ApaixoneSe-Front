import { notFound } from "next/navigation";
import { ROTEIROS, getRoteiroBySlug } from "@/lib/roteiros";
import { AtividadesClient } from "./AtividadesClient";

interface Props {
  params: { slug: string };
}

// Obrigatório com output: export — define as rotas estáticas geradas no build
export function generateStaticParams() {
  return ROTEIROS.map((r) => ({ slug: r.slug }));
}

export default function RoteiroDetailPage({ params }: Props) {
  const roteiro = getRoteiroBySlug(params.slug);
  if (!roteiro) return notFound();

  return <AtividadesClient roteiro={roteiro} />;
}
