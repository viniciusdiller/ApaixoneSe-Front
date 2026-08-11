import { ServicoTuristaListPage } from "@/components/servicos/ServicoTuristaListPage";

export default function EsportesPage() {
  return (
    <ServicoTuristaListPage
      tipo="ESPORTE_LAZER"
      titulo="Esportes & Lazer"
      subtitulo="Aventura e diversão"
      descricao="Atividades esportivas, aventura e lazer para toda a família em Saquarema."
      emoji="🏄"
      labelSingular="atividade"
      labelPlural="atividades"
      imagemFallback="/images/hero-saquarema.jpeg"
      heroImage="/images/header/esportes.jpg"
    />
  );
}
