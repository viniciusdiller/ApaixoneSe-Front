// src/lib/eventos-data.ts

export type EventoDetalhe = {
  data: string;
  nome: string;
  local?: string;
};

export type MesData = {
  titulo: string;
  descricao: string;
  eventos: EventoDetalhe[];
};

const MESES_ORDEM = [
  "janeiro",
  "fevereiro",
  "marco",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

/**
 * Slug do mês (pt-BR, sem acento) a partir da data ISO de um evento — mesma
 * lógica de MesPageClient.tsx (slice do mês na string, não Date.getUTCMonth),
 * pra garantir que o slug gerado aqui sempre bata com o que a rota /eventos/[mes]
 * espera.
 */
export function mesSlugFromData(dataIso: string): string {
  const mesNumero = Number(dataIso.slice(5, 7));
  return MESES_ORDEM[mesNumero - 1] ?? "";
}

export const dadosDosMeses: Record<string, MesData> = {
  janeiro: {
    titulo: "Janeiro",
    descricao:
      "Abertura do Festival de Verão, shows na Praça do Coração e grandes competições esportivas.",
    eventos: [
      { data: "10/01", nome: "Abertura do Festival de Verão" },
      {
        data: "10/01",
        nome: "Show do Tuca Fernandes",
        local: "Praça do Coração",
      },
      {
        data: "10/01 a 31/01",
        nome: "Atividades de Verão",
        local: "Praia de Itaúna / Casarão",
      },
      { data: "17/01", nome: "Sunset Run (Corrida)" },
      {
        data: "17/01",
        nome: "Show do Barão Vermelho",
        local: "Praça do Coração",
      },
      {
        data: "24/01",
        nome: "Show do Lukas e Gustavo",
        local: "Praça do Coração",
      },
      {
        data: "25/01",
        nome: "Rei e Rainha do Mar (Natação, Corrida e Biathlon)",
      },
      { data: "31/01", nome: "Show do Kamisa 10", local: "Praça do Coração" },
    ],
  },
  fevereiro: {
    titulo: "Fevereiro",
    descricao:
      "Mês do Carnaval de Saquarema e encerramento do Festival de Verão.",
    eventos: [
      {
        data: "01/02 a 08/02",
        nome: "Festival de Verão",
        local: "Praia de Itaúna (Casarão)",
      },
      { data: "07/02", nome: "Show Pagode da Malu", local: "Praça do Coração" },
      { data: "13/02 a 17/02", nome: "Carnaval Saquarema 2026" },
      { data: "22/02", nome: "Corrida Saquatrilhas" },
    ],
  },
  marco: {
    titulo: "Março",
    descricao:
      "Aloha Spirit, Saquarema Beer Fest e o início dos grandes torneios de esportes aquáticos e lutas.",
    eventos: [
      {
        data: "07/03 e 08/03",
        nome: "1ª Etapa – Team Remo Futevôlei Saquarema",
      },
      { data: "13/03 a 15/03", nome: "Saquarema Beer Fest" },
      {
        data: "13/03 a 22/03",
        nome: "Aloha Spirit (Festival de Esportes Aquáticos)",
      },
      {
        data: "28/03 e 29/03",
        nome: "Circuito Mineirinho Costa do Sol de Jiu-Jitsu",
        local: "Saquarema Summer National Open",
      },
      { data: "28/03 e 29/03", nome: "Nacional Bodyboarding Classic Kids" },
      { data: "28/03", nome: "2º Saquá Night Run (Corrida)" },
    ],
  },
  abril: {
    titulo: "Abril",
    descricao:
      "A capital nacional do Vôlei de Praia entra em cena, junto com a Tríplice Coroa de Surf.",
    eventos: [
      { data: "01/04 a 05/04", nome: "Circuito Brasileiro de Vôlei de Praia" },
      {
        data: "05/04 a 08/04",
        nome: "Circuito Brasileiro de Vôlei de Praia Sub 21",
      },
      { data: "05/04", nome: "Desafio Pedra Branca (Corrida)" },
      {
        data: "08/04 a 12/04",
        nome: "Volleyball World Beach Pro Tour Elite",
        local: "Mundial de Vôlei de Praia",
      },
      { data: "12/04", nome: "Sem Limites Run (Corrida)" },
      { data: "18/04", nome: "Circuito Cervejeiro (Corrida)" },
      {
        data: "19/04",
        nome: "1ª Etapa – Campeonato Bodysurf e Handsurf Saquarema",
      },
      { data: "25/04 e 26/04", nome: "Tríplice Coroa Saquarema (Surf)" },
      {
        data: "25/04 e 26/04",
        nome: "Move Esport Festival (Corrida e Canoagem)",
      },
    ],
  },
  maio: {
    titulo: "Maio",
    descricao:
      "Mês do Saquarema Country Fest, do Saquá MotoRock e de muita adrenalina.",
    eventos: [
      { data: "01/05 a 03/05", nome: "Saquarema Country Fest (Rodeio)" },
      {
        data: "02/05 e 03/05",
        nome: "1ª Etapa – Circuito Beach Tennis de Saquarema",
      },
      {
        data: "02/05 e 03/05",
        nome: "1ª Etapa – Torneio Onda na Rede – Beach Volleyball",
      },
      {
        data: "16/05 e 17/05",
        nome: "Sun Challenge Crossfit / Sun Race (Corrida)",
      },
      { data: "21/05 a 24/05", nome: "25º Saquá MotoRock" },
      {
        data: "23/05",
        nome: "Night Run Music – Etapa Funk das Antigas (Corrida)",
      },
    ],
  },
  junho: {
    titulo: "Junho",
    descricao:
      "O mês mais aguardado do ano com o WSL Vivo Rio Pro, reunindo a elite mundial do surf em Itaúna.",
    eventos: [
      {
        data: "06/06 e 07/06",
        nome: "2ª Etapa – Team Remo Futevôlei Saquarema",
      },
      { data: "07/06", nome: "Winter Race (Corrida)" },
      { data: "19/06 a 27/06", nome: "WSL Vivo Rio Pro (Mundial de Surf)" },
      { data: "28/06", nome: "Corrida Sangue Bom" },
    ],
  },
  julho: {
    titulo: "Julho",
    descricao:
      "Clima de festa julina com o Arraiá da Vila e mais campeonatos de surf e futebol.",
    eventos: [
      { data: "05/07", nome: "Circuito Corridas Populares" },
      { data: "11/07 e 12/07", nome: "Tríplice Coroa Saquarema (Surf)" },
      {
        data: "17/07 a 31/07",
        nome: "Arraiá da Vila",
        local: "Fins de Semana",
      },
      { data: "17/07 a 19/07", nome: "Saquá Cup – Torneio de Futebol de Base" },
      { data: "19/07", nome: "Jacarepá Vila Run (Corrida)" },
      {
        data: "23/07",
        nome: "Copa Tri RJ 2026",
        local: "Triatlo – Natação, Pedal e Corrida",
      },
      {
        data: "26/07",
        nome: "2ª Etapa – Campeonato de Bodysurf e Handsurf Saquarema",
      },
    ],
  },
  agosto: {
    titulo: "Agosto",
    descricao:
      "Festival Gastronômico, Saquá Blues Rock Festival e o tradicional Círio de Nazareth se aproximando.",
    eventos: [
      { data: "01/08 a 31/08", nome: "Festival Gastronômico Gosto de Agosto" },
      { data: "01/08 e 02/08", nome: "Arraiá da Vila" },
      {
        data: "01/08 e 02/08",
        nome: "2ª Etapa – Circuito Beach Tennis de Saquarema",
      },
      {
        data: "01/08 e 02/08",
        nome: "2ª Etapa – Torneio Onda na Rede – Beach Volleyball",
      },
      { data: "05/08", nome: "4º Fórum Municipal de Turismo" },
      { data: "07/08 a 09/08", nome: "Saquá Blues Rock Festival" },
      {
        data: "08/08 e 09/08",
        nome: "Circuito Mineirinho Costa do Sol de Jiu-Jitsu",
        local: "Saquarema International Cup",
      },
      {
        data: "22/08 a 30/08",
        nome: "Kneeboard Surfing World Titles (Surf de Joelhos)",
      },
      { data: "30/08", nome: "Meia Maratona N.S. de Nazareth" },
    ],
  },
  setembro: {
    titulo: "Setembro",
    descricao:
      "Tradição e fé com o Círio de Nazareth, acompanhados de eventos de surf e gastronomia.",
    eventos: [
      { data: "04/09 a 08/09", nome: "Círio de Nazareth (Festa da Padroeira)" },
      {
        data: "05/09 e 06/09",
        nome: "3ª Etapa – Team Remo Futevôlei Saquarema",
      },
      { data: "11/09 a 13/09", nome: "Steak Party" },
      { data: "12/09", nome: "Workshop de Esportes" },
      { data: "13/09", nome: "Desafio RP (Corrida)" },
      { data: "16/09 a 20/09", nome: "WSL Rema Surf Festival" },
      { data: "18/09 e 19/09", nome: "Saquarema Gospel" },
    ],
  },
  outubro: {
    titulo: "Outubro",
    descricao:
      "Mês de conscientização com a Corrida Outubro Rosa e mais Tríplice Coroa de Surf.",
    eventos: [
      {
        data: "03/10 e 04/10",
        nome: "3ª Etapa – Circuito Beach Tennis de Saquarema",
      },
      { data: "04/10", nome: "Corrida da Arca" },
      { data: "09/10 a 11/10", nome: "Saquarema Beer Fest" },
      {
        data: "17/10 e 18/10",
        nome: "Circuito Mineirinho Costa do Sol de Jiu-Jitsu",
        local: "Saquarema Spring National Open",
      },
      { data: "18/10", nome: "Corrida Outubro Rosa" },
      { data: "24/10 e 25/10", nome: "Tríplice Coroa Saquarema (Surf)" },
      { data: "24/10 e 25/10", nome: "V’a RJ – Etapa Saquarema" },
      { data: "25/10", nome: "Servidores Run – Onda Verde (Corrida)" },
    ],
  },
  novembro: {
    titulo: "Novembro",
    descricao:
      "Cultura e esportes em alta com a Feira Literária (FLIS) e a Abertura do Natal Luz.",
    eventos: [
      { data: "06/11 a 08/11", nome: "Open Nacional de Futevôlei" },
      {
        data: "11/11 a 20/11",
        nome: "Feira Literária Internacional de Saquarema",
      },
      { data: "14/11", nome: "Abertura do Natal Luz" },
      { data: "14/11 a 21/11", nome: "Master de Voleibol" },
      { data: "22/11", nome: "Brutus Race (Corrida com obstáculos)" },
      {
        data: "29/11",
        nome: "3ª Etapa – Campeonato de Bodysurf e Handsurf Saquarema",
      },
      { data: "29/11", nome: "Saquá Run (Corrida)" },
    ],
  },
  dezembro: {
    titulo: "Dezembro",
    descricao:
      "O encanto do Natal Luz ilumina a cidade enquanto encerramos o ano com esportes de base.",
    eventos: [
      { data: "01/12 a 31/12", nome: "Natal Luz" },
      {
        data: "11/12 a 13/12",
        nome: "SaquaCup – Campeonato de Futebol de Base",
      },
    ],
  },
};
