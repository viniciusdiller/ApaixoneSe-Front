export interface Lagoa {
  id: string;
  nome: string;
  slug: string;
  imagem: string;
  descricao_curta: string;
  descricao: string;
  filtros: string[];
  acessivel: boolean;
  dificuldade: string;
  estacionamento: boolean;
  quiosques: boolean;
  lat: number;
  lng: number;
}

export const lagoas: Lagoa[] = [
  {
    id: "1",
    nome: "Lagoa de Saquarema",
    slug: "saquarema",
    imagem: "/images/lagoas/saquarema.jpg",
    descricao_curta: "O coração da cidade, ideal para esportes náuticos e contemplação do pôr do sol.",
    descricao: "A Lagoa de Saquarema é o cartão postal da cidade. Com águas tranquilas, é o cenário perfeito para a prática de Stand Up Paddle (SUP), caiaque, passeios de barco e jet ski. O pôr do sol visto de suas margens é considerado um dos mais belos de toda a Região dos Lagos.",
    filtros: ["esportes_nauticos", "passeio_de_barco", "por_do_sol"],
    acessivel: true,
    dificuldade: "livre",
    estacionamento: true,
    quiosques: true,
    lat: -22.9248,
    lng: -42.4938,
  },
  {
    id: "2",
    nome: "Lagoa de Vilatur",
    slug: "vilatur",
    imagem: "/images/lagoas/vilatur.jpg",
    descricao_curta: "Águas calmas cercadas por restinga, perfeita para um dia relaxante em família.",
    descricao: "A lagoa na região de Vilatur (próxima à Lagoa Vermelha) é um oásis de águas mornas e serenas, cercada pela vegetação típica de restinga. É o local perfeito para um piquenique em família, onde as crianças podem brincar na água com total segurança. Ótima também para observação de aves.",
    filtros: ["familia", "natureza", "banho_calmo"],
    acessivel: true,
    dificuldade: "livre",
    estacionamento: true,
    quiosques: false,
    lat: -22.9333,
    lng: -42.4200,
  },
  {
    id: "3",
    nome: "Lagoa de Jaconé",
    slug: "jacone",
    imagem: "/images/lagoas/jacone.jpg",
    descricao_curta: "Refúgio de paz rústico, excelente para pesca e amantes da fotografia.",
    descricao: "Localizada numa região mais preservada e afastada do centro, a Lagoa de Jaconé oferece um ambiente extremamente sereno. É muito procurada por pescadores locais e amantes da natureza que buscam fugir do agito. Rende excelentes fotografias e momentos de profunda paz.",
    filtros: ["pesca", "tranquilidade", "fotografia"],
    acessivel: false,
    dificuldade: "livre",
    estacionamento: true,
    quiosques: false,
    lat: -22.9300,
    lng: -42.5900,
  }
];