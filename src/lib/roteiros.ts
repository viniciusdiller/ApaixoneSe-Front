export type Roteiro = {
  slug: string;
  label: string;
  descricao: string;
  icon: string;
  imagem: string;
  atividades: Atividade[];
};

export type Atividade = {
  nome: string;
  descricao: string;
  duracao?: string;
  dificuldade?: string;
};

export const roteiros: Roteiro[] = [
  {
    slug: "a-pe",
    label: "A Pé",
    descricao: "Percursos e trilhas para explorar Saquarema a pé, com contato direto com a natureza e a cultura local.",
    icon: "🥾",
    imagem: "/images/itauna-surf.jpg",
    atividades: [
      { nome: "Trilha da Restinga", descricao: "Caminhada pelo ecossistema único de restinga com guia local.", duracao: "3h", dificuldade: "Moderada" },
      { nome: "Caminhada na Praia de Itaúna", descricao: "Percurso à beira-mar ao amanhecer, observando surfistas e o mar aberto.", duracao: "1h", dificuldade: "Fácil" },
      { nome: "Centro Histórico de Saquarema", descricao: "Passeio a pé pelo centro histórico e seus pontos culturais.", duracao: "2h", dificuldade: "Fácil" },
      { nome: "Trilha do Morro da Sambaqui", descricao: "Subida ao morro com vista panorâmica da Lagoa e do mar.", duracao: "2h30", dificuldade: "Moderada" },
    ],
  },
  {
    slug: "esporte-e-aventura",
    label: "Esporte e Aventura",
    descricao: "Adrenalina pura em um dos destinos esportivos mais famosos do Brasil.",
    icon: "🏄",
    imagem: "/images/itauna-surf.jpg",
    atividades: [
      { nome: "Surf em Itaúna", descricao: "Aulas e sessões livres nas famosas ondas de Itaúna, palco da WSL.", duracao: "2h", dificuldade: "Variada" },
      { nome: "Kitesurf na Lagoa de Saquarema", descricao: "Ventos constantes e águas calmas tornam a lagoa ideal para o kitesurf.", duracao: "3h", dificuldade: "Moderada" },
      { nome: "Stand-up Paddle", descricao: "Remada tranquila pela lagoa com vista para a Igreja de Nossa Senhora de Nazaré.", duracao: "1h30", dificuldade: "Fácil" },
      { nome: "Vôlei de Praia no CBV", descricao: "Quadras profissionais abertas para visitantes com agendamento.", duracao: "2h", dificuldade: "Variada" },
      { nome: "Pesca Esportiva", descricao: "Pesca embarcada no mar ou na lagoa com pescadores locais.", duracao: "4h", dificuldade: "Fácil" },
    ],
  },
  {
    slug: "de-praias",
    label: "De Praias",
    descricao: "As praias de Saquarema são o coração da cidade — cada uma com uma personalidade única.",
    icon: "🏖️",
    imagem: "/images/itauna-surf.jpg",
    atividades: [
      { nome: "Praia de Itaúna", descricao: "A mais famosa, com ondas de classe mundial e estrutura completa.", duracao: "Dia inteiro", dificuldade: "Fácil" },
      { nome: "Praia de Saquarema", descricao: "Praia urbana na região central, com quiosques e acesso fácil.", duracao: "Dia inteiro", dificuldade: "Fácil" },
      { nome: "Praia de Jaconé", descricao: "Praia tranquila e menos movimentada, ideal para famílias.", duracao: "Dia inteiro", dificuldade: "Fácil" },
      { nome: "Praia de Barra Nova", descricao: "Pequena enseada com água calma, perfeita para mergulho de snorkel.", duracao: "Meio período", dificuldade: "Fácil" },
      { nome: "Praia de Palmital", descricao: "Extensa faixa de areia com dunas e natureza preservada.", duracao: "Dia inteiro", dificuldade: "Fácil" },
    ],
  },
  {
    slug: "cultural",
    label: "Cultural",
    descricao: "Mergulhe na história, na fé e na arte que moldaram a identidade de Saquarema.",
    icon: "🏛️",
    imagem: "/images/igreja-nazare.jpg",
    atividades: [
      { nome: "Igreja de Nossa Senhora de Nazaré", descricao: "Um dos cartões-postais mais icônicos do Rio de Janeiro, do séc. XVII.", duracao: "1h", dificuldade: "Fácil" },
      { nome: "Templo do Rock", descricao: "Memorial dedicado a Serguei, ídolo do rock nacional nascido em Saquarema.", duracao: "1h30", dificuldade: "Fácil" },
      { nome: "Museu Municipal", descricao: "Acervo histórico sobre a formação e a tradição caiçara da cidade.", duracao: "1h", dificuldade: "Fácil" },
      { nome: "Casarões Históricos do Centro", descricao: "Arquitetura colonial preservada no coração da cidade.", duracao: "1h30", dificuldade: "Fácil" },
      { nome: "Feira de Artesanato Local", descricao: "Artigos em fibra de taboa, cerâmica e pesca artesanal.", duracao: "2h", dificuldade: "Fácil" },
    ],
  },
  {
    slug: "religioso",
    label: "Religioso",
    descricao: "Espiritualidade e devoção em lugares sagrados de grande beleza e tradição.",
    icon: "⛪",
    imagem: "/images/igreja-nazare.jpg",
    atividades: [
      { nome: "Igreja de Nossa Senhora de Nazaré", descricao: "Visita à mítica igrejinha branca sobre a pedra, símbolo da cidade.", duracao: "1h", dificuldade: "Fácil" },
      { nome: "Procissão de Nossa Senhora de Nazaré", descricao: "Festa religiosa anual com participação massiva da população local.", duracao: "Evento", dificuldade: "Fácil" },
      { nome: "Cemitério das Irmãs", descricao: "Sítio histórico com mausoléus do séc. XIX, de grande valor patrimonial.", duracao: "45min", dificuldade: "Fácil" },
      { nome: "Rota das Capelas", descricao: "Visita às capelas e oratórios espalhados pelos bairros históricos.", duracao: "3h", dificuldade: "Fácil" },
    ],
  },
  {
    slug: "rural",
    label: "Rural",
    descricao: "Descubra o interior de Saquarema com fazendas, gastronomia do campo e tradições.",
    icon: "🌾",
    imagem: "/images/gastronomia.jpg",
    atividades: [
      { nome: "Visita a Propriedades Rurais", descricao: "Conheça pequenos produtores locais de frutas, hortaliças e mel.", duracao: "3h", dificuldade: "Fácil" },
      { nome: "Gastronomia do Campo", descricao: "Almoço típico em sítio com pratos feitos com ingredientes locais.", duracao: "2h", dificuldade: "Fácil" },
      { nome: "Cavalgada nos Arredores", descricao: "Passeios a cavalo pelos campos e trilhas do interior de Saquarema.", duracao: "2h", dificuldade: "Fácil" },
      { nome: "Apiário do Mel de Restinga", descricao: "Visita guiada a criador de abelhas nativas e degustação de méis especiais.", duracao: "1h30", dificuldade: "Fácil" },
    ],
  },
  {
    slug: "ecologico",
    label: "Ecológico",
    descricao: "Natureza exuberante, lagoas, restingas e fauna local para os amantes do ecoturismo.",
    icon: "🌿",
    imagem: "/images/itauna-surf.jpg",
    atividades: [
      { nome: "Lagoa de Saquarema", descricao: "Passeio de barco pela maior lagoa da região com observação de aves.", duracao: "2h", dificuldade: "Fácil" },
      { nome: "APA da Massambaba", descricao: "Área de Proteção Ambiental com trilhas por restinga nativa e fauna silvestre.", duracao: "3h", dificuldade: "Moderada" },
      { nome: "Observação de Aves", descricao: "Birdwatching na Lagoa Vermelha com espécies endêmicas da Mata Atlântica.", duracao: "2h", dificuldade: "Fácil" },
      { nome: "Projeto TAMAR", descricao: "Conheça o trabalho de proteção às tartarugas marinhas na costa de Saquarema.", duracao: "1h30", dificuldade: "Fácil" },
      { nome: "Trilha das Dunas", descricao: "Caminhada pelas dunas costeiras com vista para o Atlântico.", duracao: "2h", dificuldade: "Moderada" },
    ],
  },
];

export function getRoteiroBySlug(slug: string): Roteiro | undefined {
  return roteiros.find((r) => r.slug === slug);
}
