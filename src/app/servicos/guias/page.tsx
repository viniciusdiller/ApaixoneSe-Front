import { ServicoTuristaListPage } from "@/components/servicos/ServicoTuristaListPage";

export default function GuiasPage() {
  return (
    <ServicoTuristaListPage
      tipo="GUIA_TURISMO"
      titulo="Guias de Turismo"
      subtitulo="Profissionais credenciados"
      descricao="Conheça os guias de turismo credenciados em Saquarema e descubra os segredos do destino."
      emoji="🗺️"
      labelSingular="guia"
      labelPlural="guias"
      imagemFallback="/images/hero-saquarema.jpeg"
      heroImage="/images/header/guias.jpg"
    />
  );
}
