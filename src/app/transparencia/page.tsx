import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  ExternalLink,
  FileText,
  Scale,
} from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transparência | Apaixone-se por Saquarema",
  description:
    "Acesso às informações públicas da Prefeitura Municipal de Saquarema e da Secretaria de Turismo.",
};

const portalLinks = [
  {
    title: "Portal da Transparência",
    description:
      "Acesse receitas, despesas, contratos, convênios e dados orçamentários do município.",
    href: "https://transparencia.saquarema.rj.gov.br/",
    icon: Building2,
  },
  {
    title: "Diário Oficial",
    description:
      "Publicações oficiais de atos administrativos, licitações, portarias e decretos.",
    href: "https://dos.saquarema.rj.gov.br/",
    icon: FileText,
  },
  {
    title: "Lei de Acesso à Informação (LAI)",
    description:
      "Solicite informações públicas com base na Lei nº 12.527/2011. Respostas em até 20 dias úteis.",
    href: "https://transparencia.saquarema.rj.gov.br/",
    icon: Scale,
  },
];

const infoItems = [
  {
    label: "CNPJ",
    value: "32.147.670/0001-21",
  },
  {
    label: "Endereço",
    value: "Rua Coronel Madureira, 77, Centro, Saquarema - RJ, CEP 28990-756",
  },
  {
    label: "Horário de Atendimento",
    value: "Segunda a Sexta, das 09h às 17h",
  },
  {
    label: "Ouvidoria",
    value: "ouvidoria@saquarema.rj.gov.br.",
  },
];

export default function TransparenciaPage() {
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
            Transparência
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-primary-foreground/80 md:text-xl">
            A Prefeitura Municipal de Saquarema e a Secretaria de Turismo
            comprometem-se com a transparência e o acesso à informação pública.
          </p>
        </div>
      </section>

      {/* Conteúdo */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Portais */}
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">
              Portais Oficiais
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {portalLinks.map((item) => (
                <a
                  key={item.title}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/40 hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="font-display font-bold text-foreground">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </a>
              ))}
            </div>
          </div>

          {/* Dados Institucionais */}
          <div>
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">
              Dados Institucionais
            </h2>
            <div className="rounded-2xl border border-border bg-card overflow-hidden">
              {infoItems.map((item, index) => (
                <div
                  key={item.label}
                  className={`flex flex-col sm:flex-row sm:items-center gap-2 px-6 py-4 ${
                    index < infoItems.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground sm:w-48">
                    {item.label}
                  </span>
                  <span className="text-sm text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
