"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  Bus,
  ExternalLink,
  Info,
  Trophy,
  Building2,
} from "lucide-react";

const autorizacoes = [
  {
    icon: <Building2 size={24} />,
    title: "Autorização com Hospedagem",
    desc: "Para grupos com hospedagem em meios cadastrados ou não no CADASTUR, incluindo casas de temporada e hospedagens sem CNPJ ou alvará.",
    href: "https://saquarema.1doc.com.br/b.php?pg=o/dados_servico&service=01K6DZ06VDJ3FC4S7W7V2YBZVN&dados=1",
    label: "Emitir Autorização com Hospedagem",
    color:
      "bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950/30 dark:border-blue-800 dark:text-blue-300",
    btnColor: "bg-blue-600 hover:bg-blue-700 text-white",
  },
  {
    icon: <Bus size={24} />,
    title: "Autorização sem Hospedagem (Bate-volta)",
    desc: "Para excursões e deslocamentos de bate-volta com fins culturais, religiosos, esportivos ou particulares, sem hospedagem no município.",
    href: "https://saquarema.1doc.com.br/b.php?pg=o/dados_servico&service=01K5EJB1HJVQCGNW1NHYYNZ994&dados=1",
    label: "Emitir Autorização sem Hospedagem",
    color:
      "bg-green-50 border-green-200 text-green-700 dark:bg-green-950/30 dark:border-green-800 dark:text-green-300",
    btnColor: "bg-green-600 hover:bg-green-700 text-white",
  },
  {
    icon: <Trophy size={24} />,
    title: "Isenção – Atletas e Equipes de Competições",
    desc: "Para veículos destinados ao transporte de atletas, equipes técnicas e apoio em campeonatos esportivos realizados em Saquarema.",
    href: "https://saquarema.1doc.com.br/b.php?pg=o/dados_servico&service=01K6DZMS3ANS26H5JG2542NW5C&dados=1",
    label: "Solicitar Isenção – Competições Esportivas",
    color:
      "bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-950/30 dark:border-yellow-800 dark:text-yellow-300",
    btnColor: "bg-yellow-600 hover:bg-yellow-700 text-white",
  },
  {
    icon: <Building2 size={24} />,
    title: "Isenção – Empresas de Turismo Locais",
    desc: "Para empresas de turismo registradas em Saquarema, com frota de veículos emplacada no município.",
    href: "https://saquarema.1doc.com.br/b.php?pg=o/dados_servico&service=01K86HWV2NH5XY4BAMPK2DJNQF&dados=1",
    label: "Solicitar Isenção – Empresas de Turismo Locais",
    color:
      "bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-950/30 dark:border-purple-800 dark:text-purple-300",
    btnColor: "bg-purple-600 hover:bg-purple-700 text-white",
  },
];

const tabela = [
  {
    categoria: "Hospedagem com CADASTUR",
    detalhe:
      "Meios de Hospedagem devidamente cadastrados no Ministério do Turismo (CADASTUR), como Hotéis, Pousadas, Hostel etc. Recomenda-se verificar se o estabelecimento está regularmente inscrito e ativo.",
    onibus: "R$\u00a0200,00",
    micro: "R$\u00a0150,00",
    van: "R$\u00a0100,00",
  },
  {
    categoria: "Hospedagem sem CADASTUR",
    detalhe:
      "Meios de Hospedagem não registrados no CADASTUR, sem cadastro ativo junto ao Ministério do Turismo.",
    onibus: "R$\u00a01.000,00",
    micro: "R$\u00a0600,00",
    van: "R$\u00a0300,00",
  },
  {
    categoria: "Com Hospedagem sem CNPJ e Alvará",
    detalhe:
      "Casas de veraneio, casas por temporada, hospedagem domiciliar, casas compartilhadas, sítios e chácaras de aluguel, trailers, campings informais etc.",
    onibus: "R$\u00a02.000,00",
    micro: "R$\u00a01.000,00",
    van: "R$\u00a0500,00",
  },
  {
    categoria: "Sem Hospedagem (Sem Pernoite e Sem Diária)",
    detalhe:
      "Deslocamentos diários destinados à participação em cursos, eventos culturais, religiosos, de lazer ou de caráter particular, sem necessidade de pernoite.",
    onibus: "R$\u00a02.000,00",
    micro: "R$\u00a01.000,00",
    van: "R$\u00a0500,00",
  },
];

export default function TaxaDeTurismoPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center py-20 px-4 text-center bg-primary/5">
        <button
          onClick={() => router.push("/servicos")}
          className="absolute left-4 top-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft size={16} /> Serviços
        </button>
        <div className="p-4 rounded-full bg-primary/10 text-primary mb-4">
          <FileText size={36} />
        </div>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-primary mb-4">
          Taxa de Turismo
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Autorização de Acesso de Veículos de Turismo – Município de Saquarema
        </p>
      </section>

      <div className="container mx-auto max-w-4xl px-4 py-16 space-y-12">
        {/* O que é */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">
            O que é a Taxa de Turismo?
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            A{" "}
            <strong className="text-foreground">
              Taxa de Turismo de Saquarema
            </strong>{" "}
            tem como objetivo{" "}
            <strong className="text-foreground">
              organizar o acesso, circulação e estacionamento de veículos de
              turismo
            </strong>{" "}
            no município, contribuindo para a{" "}
            <strong className="text-foreground">
              preservação do patrimônio natural, cultural e urbano
            </strong>
            , além de garantir uma experiência segura e ordenada para visitantes
            e moradores.
          </p>
          <div className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
            <Info size={18} className="mt-0.5 shrink-0 text-primary" />
            <p className="text-sm text-foreground">
              Conforme o <strong>Decreto Municipal nº 2.572/2023</strong>, todo
              veículo de turismo (ônibus, micro-ônibus e vans) deve{" "}
              <strong>
                solicitar previamente autorização para entrada no município
              </strong>
              . O procedimento é realizado de forma <strong>100% online</strong>
              , rápida e segura.
            </p>
          </div>
        </section>

        {/* Categorias de Autorização */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">
            Escolha a categoria correspondente
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {autorizacoes.map((a) => (
              <div
                key={a.title}
                className={`flex flex-col gap-3 rounded-xl border p-5 ${a.color}`}
              >
                <div className="flex items-center gap-2 font-bold">
                  {a.icon}
                  {a.title}
                </div>
                <p className="text-sm opacity-90 leading-relaxed flex-1">
                  {a.desc}
                </p>
                <a
                  href={a.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${a.btnColor}`}
                >
                  {a.label} <ExternalLink size={13} />
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* Tabela de Taxas */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">
            Tabela de Taxas
          </h2>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted text-muted-foreground">
                  <th className="px-4 py-3 text-left font-semibold">
                    Categoria
                  </th>
                  <th className="px-4 py-3 text-center font-semibold whitespace-nowrap">
                    Ônibus
                  </th>
                  <th className="px-4 py-3 text-center font-semibold whitespace-nowrap">
                    Micro-ônibus
                  </th>
                  <th className="px-4 py-3 text-center font-semibold whitespace-nowrap">
                    Van
                  </th>
                </tr>
              </thead>
              <tbody>
                {tabela.map((row, i) => (
                  <tr
                    key={i}
                    className="border-t border-border hover:bg-muted/40 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <p className="font-semibold text-foreground">
                        {row.categoria}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed max-w-sm">
                        {row.detalhe}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-foreground whitespace-nowrap">
                      {row.onibus}
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-foreground whitespace-nowrap">
                      {row.micro}
                    </td>
                    <td className="px-4 py-4 text-center font-bold text-foreground whitespace-nowrap">
                      {row.van}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Isenções */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-foreground">Isenções</h2>

          {/* Empresas Locais */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-2">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <Building2 size={20} className="text-primary" />
              Empresas de Turismo Registradas em Saquarema
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              As{" "}
              <strong className="text-foreground">
                empresas de turismo devidamente registradas junto à Prefeitura
                Municipal de Saquarema
              </strong>
              , que possuam{" "}
              <strong className="text-foreground">
                frota de veículos emplacada no município
              </strong>
              , são{" "}
              <strong className="text-foreground">
                isentas do pagamento da Taxa de Turismo
              </strong>
              , conforme o Decreto Municipal nº 2.572/2023.
            </p>
            <div className="rounded-lg bg-yellow-50 border border-yellow-200 px-3 py-2 text-xs text-yellow-800 dark:bg-yellow-950/30 dark:border-yellow-800 dark:text-yellow-300">
              ⚠️ Essa isenção é{" "}
              <strong>
                restrita exclusivamente aos veículos pertencentes à própria
                empresa
              </strong>{" "}
              registrada, não se estendendo a veículos terceirizados, fretados
              ou pertencentes a outras pessoas jurídicas ou físicas, ainda que
              prestem serviços à empresa beneficiada.
            </div>
          </div>

          {/* Atletas */}
          <div className="rounded-xl border border-border bg-card p-5 space-y-2">
            <div className="flex items-center gap-2 font-bold text-foreground">
              <Trophy size={20} className="text-primary" />
              Veículos Destinados a Competições Esportivas
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Estão{" "}
              <strong className="text-foreground">
                isentos do pagamento da Taxa de Turismo
              </strong>{" "}
              os{" "}
              <strong className="text-foreground">
                veículos destinados ao transporte de equipes técnicas, atletas
                e/ou equipes de apoio
              </strong>{" "}
              que participem de{" "}
              <strong className="text-foreground">
                campeonatos esportivos realizados no município de Saquarema
              </strong>
              .
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Para obtenção da isenção, é necessário{" "}
              <strong className="text-foreground">
                comprovar a finalidade esportiva da viagem
              </strong>{" "}
              e{" "}
              <strong className="text-foreground">
                emitir previamente a Autorização de Acesso
              </strong>
              , a qual deverá ser fixada{" "}
              <strong className="text-foreground">
                no para-brisa do veículo durante todo o período de permanência
              </strong>{" "}
              no município.
            </p>
          </div>
        </section>

        {/* Botão — fonte oficial */}
        <section className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border bg-muted/30 py-10 px-4 text-center">
          <FileText size={32} className="text-muted-foreground" />
          <p className="text-sm text-muted-foreground max-w-md">
            Para emitir autorizações, acessar o sistema oficial ou obter mais
            informações, acesse o portal da Prefeitura de Saquarema.
          </p>
          <a
            href="https://www.saquarema.rj.gov.br/pagamento-da-taxa-de-turismo/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Acessar Portal da Prefeitura <ExternalLink size={14} />
          </a>
        </section>
      </div>
    </div>
  );
}
