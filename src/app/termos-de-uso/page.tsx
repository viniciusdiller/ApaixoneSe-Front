import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso | Apaixone-se por Saquarema",
  description:
    "Leia os Termos de Uso do portal Apaixone-se por Saquarema antes de utilizar os nossos serviços.",
};

const sections = [
  {
    title: "1. Aceitação dos termos",
    content:
      'Ao acessar ou utilizar o portal "Apaixone-se por Saquarema", você concorda com os presentes Termos de Uso. Caso não concorde com alguma condição, recomendamos que não utilize a plataforma. Estes termos são regidos pela legislação brasileira.',
  },
  {
    title: "2. Sobre o portal",
    content:
      "O portal é uma iniciativa da Prefeitura Municipal de Saquarema, por meio da Secretaria de Esporte, Lazer e Turismo, com o objetivo de:\n\n• Divulgar atrativos turísticos, eventos, praias, gastronomia e hospedagens do município.\n• Permitir que visitantes e moradores criem e compartilhem roteiros personalizados.\n• Disponibilizar informações sobre serviços públicos voltados ao turista.",
  },
  {
    title: "3. Cadastro e conta de usuário",
    content:
      "Para acessar recursos personalizados (como salvar roteiros e listas de favoritos), é necessário criar uma conta. Ao se cadastrar, você se compromete a:\n\n• Fornecer informações verídicas, precisas e atualizadas.\n• Manter a confidencialidade de sua senha e não compartilhá-la com terceiros.\n• Notificar imediatamente a equipe do portal em caso de uso não autorizado de sua conta.\n\nA Prefeitura reserva-se o direito de suspender ou excluir contas que violem estes Termos.",
  },
  {
    title: "4. Uso aceitável",
    content:
      "Ao utilizar o portal, você concorda em NÃO:\n\n• Publicar conteúdo falso, difamatório, discriminatório ou que viole direitos de terceiros.\n• Usar o portal para fins comerciais não autorizados ou para envio de spam.\n• Tentar burlar mecanismos de segurança ou acessar áreas restritas do sistema.\n• Coletar dados de outros usuários sem consentimento.\n• Compartilhar conteúdo que infrinja direitos autorais ou de propriedade intelectual.",
  },
  {
    title: "5. Conteúdo gerado por usuários",
    content:
      "Roteiros, avaliações e outros conteúdos criados por você permanecem de sua responsabilidade. Ao publicá-los, você concede à Prefeitura de Saquarema uma licença não exclusiva, gratuita e irrevogável para exibir, distribuir e adaptar esse conteúdo exclusivamente dentro do portal e em comunicações oficiais de turismo do município.",
  },
  {
    title: "6. Propriedade intelectual",
    content:
      "Todo o conteúdo editorial, fotografias, logotipos, marcas e código-fonte do portal são de propriedade da Prefeitura Municipal de Saquarema ou de seus licenciantes. É proibida a reprodução, distribuição ou modificação sem autorização prévia e expressa.",
  },
  {
    title: "7. Isenção de responsabilidade",
    content:
      "O portal disponibiliza informações com fins informativos e turísticos. A Prefeitura não se responsabiliza por:\n\n• Eventuais inconsistências em informações de estabelecimentos privados (restaurantes, hotéis, etc.).\n• Cancelamentos de eventos por causas de força maior.\n• Danos decorrentes do uso indevido da plataforma por terceiros.\n\nAs condições das praias e a previsão de ondas são disponibilizadas para fins informativos. Pratique esportes aquáticos com responsabilidade e respeite as sinalizações locais.",
  },
  {
    title: "8. Links externos",
    content:
      "O portal pode conter links para sites de terceiros (estabelecimentos, parceiros, redes sociais). Esses links são fornecidos para sua conveniência, e a Prefeitura não se responsabiliza pelo conteúdo ou pelas práticas de privacidade desses sites.",
  },
  {
    title: "9. Disponibilidade do serviço",
    content:
      "A Prefeitura envidará os melhores esforços para manter o portal disponível continuamente, mas não garante disponibilidade ininterrupta. Manutenções programadas serão comunicadas com antecedência, sempre que possível.",
  },
  {
    title: "10. Alterações nos termos",
    content:
      "Estes Termos de Uso podem ser revisados a qualquer momento. As alterações entram em vigor a partir da data de publicação. O uso continuado do portal após as alterações implica aceitação dos novos termos.",
  },
  {
    title: "11. Legislação aplicável",
    content:
      "Estes Termos são regidos pelas leis da República Federativa do Brasil. Para resolução de conflitos, fica eleito o foro da Comarca de Saquarema — RJ, com renúncia expressa a qualquer outro, por mais privilegiado que seja.",
  },
];

export default function TermosDeUsoPage() {
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
            <FileText className="h-10 w-10 md:h-14 md:w-14 text-accent" />
            Termos de Uso
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-primary-foreground/80 md:text-xl">
            Leia com atenção as condições de uso do portal antes de criar sua
            conta ou utilizar os nossos serviços.
          </p>
        </div>
      </section>

      {/* Conteúdo */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto space-y-8">
          {sections.map((section) => (
            <div
              key={section.title}
              className="rounded-2xl border border-border bg-card p-6 md:p-8"
            >
              <h2 className="font-display text-lg font-bold text-foreground mb-3">
                {section.title}
              </h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line text-sm md:text-base">
                {section.content}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
