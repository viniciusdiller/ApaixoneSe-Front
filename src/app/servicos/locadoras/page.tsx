import { ServicoTuristaListPage } from "@/components/servicos/ServicoTuristaListPage";

export default function LocadorasPage() {
  return (
    <ServicoTuristaListPage
      tipo="LOCADORA_VEICULOS"
      titulo="Locadoras de Veículos"
      subtitulo="Mobilidade e liberdade"
      descricao="Alugue carros, motos ou bicicletas e explore o destino no seu próprio ritmo."
      emoji="🚗"
      labelSingular="locadora"
      labelPlural="locadoras"
      imagemFallback="/images/hero-saquarema.jpeg"
      heroImage="/images/header/locadoras.jpg"
    />
  );
}
