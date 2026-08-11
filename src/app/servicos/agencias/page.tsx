import { ServicoTuristaListPage } from "@/components/servicos/ServicoTuristaListPage";

export default function AgenciasPage() {
  return (
    <ServicoTuristaListPage
      tipo="AGENCIA_TURISMO"
      titulo="Agências de Turismo"
      subtitulo="Pacotes e roteiros"
      descricao="Pacotes completos, passeios de barco e roteiros personalizados para você."
      emoji="🧭"
      labelSingular="agência"
      labelPlural="agências"
      imagemFallback="/images/hero-saquarema.jpeg"
      heroImage="/images/header/agencias.jpg"
    />
  );
}
