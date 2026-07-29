import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade | Apaixone-se por Saquarema",
  description:
    "Saiba como coletamos, usamos e protegemos seus dados pessoais no portal Apaixone-se por Saquarema.",
};

const sections = [
  {
    title: "1. Quem somos",
    content:
      'O portal "Apaixone-se por Saquarema" é uma iniciativa da Prefeitura Municipal de Saquarema, por meio da Secretaria de Turismo, com o objetivo de promover o turismo e facilitar o planejamento de viagens ao município. O responsável pelo tratamento de dados é a Prefeitura Municipal de Saquarema, CNPJ 28.636.579/0001-00, com sede na Rua Coronel Serrado, s/n, Centro, Saquarema — RJ.',
  },
  {
    title: "2. Dados que coletamos",
    content:
      "Coletamos os seguintes dados pessoais para a operação do portal:\n\n• Dados de cadastro: nome, endereço de e-mail e senha (armazenada de forma criptografada) ao criar uma conta.\n• Dados de uso: páginas visitadas, itinerários criados e preferências de viagem, para personalizar sua experiência.\n• Dados de newsletter: endereço de e-mail fornecido voluntariamente para receber o boletim de ondas (Ondas) ou informativos de turismo.\n• Dados técnicos: endereço IP, tipo de navegador e sistema operacional, coletados automaticamente para fins de segurança e diagnóstico.",
  },
  {
    title: "3. Como usamos seus dados",
    content:
      "Utilizamos seus dados pessoais exclusivamente para:\n\n• Criar e gerenciar sua conta de usuário no portal.\n• Salvar e exibir seus roteiros e planos de viagem personalizados.\n• Enviar o boletim de ondas e comunicações de turismo, quando você optar por se inscrever.\n• Melhorar os conteúdos e funcionalidades do portal com base em dados de uso agregados e anonimizados.\n• Cumprir obrigações legais aplicáveis.",
  },
  {
    title: "4. Compartilhamento de dados",
    content:
      "Não vendemos nem alugamos seus dados pessoais a terceiros. Podemos compartilhá-los apenas:\n\n• Com outros órgãos da Prefeitura de Saquarema, quando necessário para a prestação de serviços públicos.\n• Com prestadores de serviços técnicos (ex.: hospedagem de servidores) que atuam sob contrato e ficam proibidos de usar os dados para outros fins.\n• Por obrigação legal ou determinação judicial.",
  },
  {
    title: "5. Seus direitos (LGPD)",
    content:
      'Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito a:\n\n• Confirmar se tratamos seus dados pessoais.\n• Acessar, corrigir ou atualizar seus dados.\n• Solicitar a exclusão de seus dados ("direito ao esquecimento").\n• Revogar o consentimento para envio de comunicações a qualquer momento.\n• Opor-se ao tratamento em caso de descumprimento desta política.\n\nPara exercer seus direitos, envie um e-mail para: privacidade@saquarema.rj.gov.br',
  },
  {
    title: "6. Cookies",
    content:
      "Utilizamos cookies essenciais para o funcionamento do portal (como manutenção de sessão) e cookies analíticos para entender o uso do site. Você pode configurar seu navegador para recusar cookies, mas isso pode afetar algumas funcionalidades da plataforma.",
  },
  {
    title: "7. Segurança",
    content:
      "Adotamos medidas técnicas e organizacionais adequadas para proteger seus dados contra acesso não autorizado, perda ou destruição, incluindo criptografia de senhas, conexões HTTPS e controles de acesso aos sistemas internos.",
  },
  {
    title: "8. Retenção de dados",
    content:
      "Seus dados são mantidos enquanto sua conta estiver ativa ou pelo período necessário para cumprir as finalidades descritas nesta política. Após a exclusão da conta, os dados são eliminados ou anonimizados, exceto quando a retenção for exigida por lei.",
  },
  {
    title: "9. Alterações nesta política",
    content:
      "Esta política pode ser atualizada periodicamente. Quando isso ocorrer, notificaremos você por e-mail ou por aviso em destaque no portal. A data da última revisão consta no rodapé desta página.",
  },
  {
    title: "10. Contato",
    content:
      "Dúvidas, solicitações ou reclamações relacionadas à privacidade de dados podem ser direcionadas ao Encarregado de Dados (DPO) da Prefeitura de Saquarema:\n\nE-mail: privacidade@saquarema.rj.gov.br\nEndereço: Rua Coronel Serrado, s/n — Centro, Saquarema — RJ, 28990-000",
  },
];

export default function PoliticaDePrivacidadePage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero */}
      <section className="bg-primary px-4 pb-16 pt-32 relative overflow-hidden">
        <div className="container mx-auto max-w-4xl text-center relative z-10">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-2 text-sm text-primary-foreground/80 transition-colors hover:bg-primary-foreground/20 hover:text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para a página inicial
          </Link>

          <h1 className="font-display text-4xl font-bold uppercase text-primary-foreground md:text-6xl flex flex-col md:flex-row items-center justify-center gap-4">
            <ShieldCheck className="h-10 w-10 md:h-14 md:w-14 text-accent" />
            Política de Privacidade
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-foreground/80 md:text-xl">
            Saiba como tratamos seus dados pessoais em conformidade com a Lei
            Geral de Proteção de Dados (LGPD).
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
