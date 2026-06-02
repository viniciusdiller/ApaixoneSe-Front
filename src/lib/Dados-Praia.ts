export interface WaveData {
  waveHeight: number;
  waveDirection: number;
  wavePeriod: number;
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  windDirection: number;
}

export const defaultWaveData: WaveData = {
  waveHeight: 1.4,
  waveDirection: 135,
  wavePeriod: 12,
  temperature: 27,
  weatherCode: 1,
  windSpeed: 16,
  windDirection: 120,
};

export const praias = [
  {
    id: 1,
    nome: "Praia de Itaúna",
    imagem: "/images/praias/Itauna.jpeg",
    slug: "itauna",
    descricao_curta: "Pico clássico da WSL com ondas de classe mundial.",
    descricao:
      "Itaúna é referência internacional do surf brasileiro, com ondas constantes e atmosfera vibrante durante todo o ano.",
    filtros: ["surf", "bandeira azul"],
    acessivel: true,
    dificuldade: "avançado",
    estacionamento: true,
    quiosques: true,
    lat: -22.9358,
    lng: -42.4779,
  },
  {
    id: 2,
    nome: "Praia da Vila",
    imagem: "/images/praias/Vila.jpg",
    slug: "vila",
    descricao_curta: "Faixa extensa de areia com excelente estrutura urbana.",
    descricao:
      "A Praia da Vila combina mar aberto, calçadão e fácil acesso para famílias e visitantes.",
    filtros: ["família", "bandeira azul"],
    acessivel: true,
    dificuldade: "iniciante",
    estacionamento: true,
    quiosques: true,
    lat: -22.9372,
    lng: -42.4952,
  },
  {
    id: 3,
    nome: "Praia de Jaconé",
    imagem: "/images/praias/Jaconé.jpg",
    slug: "jacone",
    descricao_curta: "Natureza preservada e mar com energia para o surf.",
    descricao:
      "Jaconé oferece um visual rústico e conexão com a paisagem local, ideal para quem busca tranquilidade.",
    filtros: ["surf", "família"],
    acessivel: false,
    dificuldade: "intermediário",
    estacionamento: true,
    quiosques: false,
    lat: -22.9327,
    lng: -42.5961,
  },
  // {
  //   id: 4,
  //   nome: "Praia da Barrinha",
  //   imagem: "/images/praias/Jaconé.jpg",
  //   slug: "barrinha",
  //   descricao_curta: "Barrinha descrição curta",
  //   descricao:
  //     "Barrinha descrição",
  //   filtros: ["família"],
  //   acessivel: true,
  //   dificuldade: "iniciante",
  //   estacionamento: false,
  //   quiosques: true,
  //   lat: -22.935248338202257,
  //   lng: -42.49046690394575,
  // },
  // {
  //   id: 5,
  //   nome: "Praia de Vilatur",
  //   imagem: "/images/praias/Jaconé.jpg",
  //   slug: "vilatur",
  //   descricao_curta: "vilatur descrição curta",
  //   descricao:
  //     "vilatur descrição",
  //   filtros: ["família"],
  //   acessivel: true,
  //   dificuldade: "iniciante",
  //   estacionamento: false,
  //   quiosques: true,
  //   lat: -22.935248338202257,
  //   lng: -42.49046690394575,
  // },
];
