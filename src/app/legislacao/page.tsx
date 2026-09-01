import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Legislação | Apaixone-se por Saquarema",
  description:
    "Conheça as principais leis federais, estaduais e municipais que regulam o turismo, as praias e as lagoas de Saquarema.",
};

const spheres = [
  {
    title: "Legislação Federal",
    items: [
      {
        name: "Lei nº 11.771/2008 — Política Nacional de Turismo",
        content:
          "Dispõe sobre a Política Nacional de Turismo, define as atribuições do Governo Federal no planejamento, desenvolvimento e estímulo ao setor turístico e disciplina a Classificação dos Prestadores de Serviços Turísticos (Cadastur).",
      },
      {
        name: "Lei nº 8.078/1990 — Código de Defesa do Consumidor",
        content:
          "Aplica-se às relações de consumo entre turistas e prestadores de serviços (hospedagem, agências, transporte, gastronomia), garantindo direito à informação clara, segurança e reparação de danos.",
      },
      {
        name: "Lei nº 9.985/2000 — Sistema Nacional de Unidades de Conservação (SNUC)",
        content:
          "Institui as categorias de unidades de conservação ambiental, base legal para áreas protegidas do município, como restingas, lagoas e remanescentes de Mata Atlântica visitados por turistas.",
      },
      {
        name: "Lei nº 10.257/2001 — Estatuto da Cidade",
        content:
          "Estabelece diretrizes gerais da política urbana, incluindo ordenação do uso do solo em áreas de interesse turístico e proteção do patrimônio ambiental, cultural e paisagístico dos municípios.",
      },
      {
        name: "Lei nº 6.938/1981 — Política Nacional do Meio Ambiente",
        content:
          "Base legal para a proteção de praias, lagoas e faixas de restinga como patrimônio ambiental, exigindo licenciamento e fiscalização de atividades turísticas com potencial impacto ambiental.",
      },
    ],
  },
  {
    title: "Legislação Estadual (Rio de Janeiro)",
    items: [
      {
        name: "Política Estadual de Turismo do Rio de Janeiro",
        content:
          "Coordenada pela Secretaria de Estado de Turismo (Setur-RJ) e pela TurisRio, estabelece diretrizes de fomento, infraestrutura e promoção dos destinos turísticos fluminenses, incluindo a Região dos Lagos, na qual Saquarema está inserida.",
      },
      {
        name: "Lei Estadual nº 650/1983 — Política Estadual de Proteção Ambiental",
        content:
          "Disciplina o controle da poluição e a proteção de ecossistemas costeiros e lacustres no território fluminense, relevante para a preservação das lagoas de Saquarema, Jaconé e Jacarepiá.",
      },
    ],
  },
  {
    title: "Legislação Municipal (Saquarema)",
    items: [
      {
        name: "Lei Orgânica do Município de Saquarema",
        content:
          "Nos artigos 170, 172 e 178, estabelece a proteção da flora, das áreas verdes e do patrimônio natural, cultural e histórico do município, definindo praias, ilhas fluviais e marítimas, orlas marítima e lagunar e costões rochosos como áreas de proteção ambiental e paisagística.",
      },
      {
        name: "Lei nº 1.055/2010 — Código Municipal de Meio Ambiente",
        content:
          "Consolida as normas ambientais de Saquarema, incluindo regras de uso e ocupação do solo em áreas de preservação permanente (APPs), disciplina de atividades náuticas e esportivas nas lagoas e proteção das faixas de praia.",
      },
      {
        name: "Plano Diretor Municipal",
        content:
          "Define o zoneamento urbano e ambiental do município, incluindo as Zonas de Interesse Turístico e as áreas de proteção da orla, orientando o crescimento urbano de forma compatível com a vocação turística e ambiental de Saquarema.",
      },
      {
        name: "Política Municipal de Fomento ao Turismo",
        content:
          "Conjunto de leis e decretos que estruturam a atuação da Secretaria Municipal de Esporte, Lazer e Turismo, incluindo o cadastro de prestadores de serviços turísticos e a promoção de eventos oficiais de calendário turístico.",
      },
      {
        name: "Decreto nº 2.572/2023 — Acesso de Veículos de Turismo",
        content:
          "Regulamenta os critérios de entrada, circulação e estacionamento de veículos de turismo (ônibus, micro-ônibus, vans e similares) no município. Exige autorização prévia solicitada pelo site da Prefeitura, com pagamento de boleto no mínimo 3 dias úteis antes da viagem e guia fixada no para-brisa; as tarifas variam conforme o tipo de hospedagem do grupo e a autorização vale por 1 dia. Prevê isenção para empresas de turismo locais com frota emplacada em Saquarema e para veículos de equipes técnicas e atletas de competições esportivas realizadas no município.",
      },
      {
        name: "Decreto nº 3.163/2026 — Cadastro de Prestadores de Serviços Turísticos",
        content:
          "Regulamenta, no âmbito municipal, o cadastro de prestadores de serviços turísticos junto ao Ministério do Turismo (Cadastur), em conformidade com a Lei Federal nº 11.771/2008.",
      },
    ],
  },
];

export default function LegislacaoPage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero */}
      <section className="bg-primary px-4 pb-16 pt-32 relative overflow-hidden">
        <div className="container mx-auto max-w-4xl relative z-10">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-2 text-sm text-primary-foreground/80 transition-colors hover:bg-primary-foreground/20 hover:text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para a página inicial
          </Link>

          <h1 className="font-display text-4xl font-bold uppercase text-primary-foreground md:text-6xl flex flex-col md:flex-row items-center justify-start gap-4">
            <Scale className="h-10 w-10 md:h-14 md:w-14 text-accent" />
            Legislação
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-primary-foreground/80 md:text-xl">
            Principais leis federais, estaduais e municipais que regulam o
            turismo e a proteção das praias e lagoas de Saquarema.
          </p>
        </div>
      </section>

      {/* Conteúdo */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto space-y-12">
          {spheres.map((sphere) => (
            <div key={sphere.title}>
              <h2 className="font-display text-2xl font-bold text-foreground mb-6">
                {sphere.title}
              </h2>
              <div className="space-y-6">
                {sphere.items.map((item) => (
                  <div
                    key={item.name}
                    className="rounded-2xl border border-border bg-card p-6 md:p-8"
                  >
                    <h3 className="font-display text-lg font-bold text-foreground mb-3">
                      {item.name}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed text-sm md:text-base">
                      {item.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <p className="text-xs text-muted-foreground/70 text-center pt-4">
            As informações acima têm caráter meramente informativo. Para a
            íntegra e a atualização das normas, consulte o{" "}
            <a
              href="https://transparencia.saquarema.rj.leg.br/leis"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-foreground"
            >
              Portal da Transparência da Câmara Municipal de Saquarema
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
