"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ChevronDown, HelpCircle } from "lucide-react";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "Onde encontrar informações turísticas sobre a cidade?",
      answer:
        "Atendimento presencial: Você pode obter informações na Secretaria Municipal de Turismo e no Centro de Atendimento ao Turista (CAT), na região central, com funcionamento até as 17:00. Informações digitais: O portal oficial da Prefeitura e as páginas da Secretaria Municipal de Esporte, Lazer e Turismo disponibilizam calendário de eventos, roteiros e atrações.",
    },
    {
      question:
        "Onde posso encontrar informações sobre os eventos em Saquarema?",
      answer:
        "Você pode acessar a aba 'EVENTOS' no menu principal do nosso site para conferir o calendário oficial atualizado da Capital Nacional do Esporte.",
    },
    {
      question: "Como funcionam as taxas de turismo de Saquarema?",
      answer:
        "Não há cobrança para carros de passeio comuns. Porém, ônibus, micro-ônibus e vans de excursão precisam emitir autorização prévia e pagar uma taxa municipal (Decreto nº 2.572/2023). A solicitação é 100% online no site da Prefeitura com antecedência mínima de 3 dias úteis.",
    },
    {
      question: "Onde fica e como chegar a Saquarema?",
      answer:
        "Saquarema fica na Região dos Lagos (RJ), a cerca de 100 km da capital. De carro, a rota principal é pela Ponte Rio-Niterói, seguida pelas rodovias RJ-104 e RJ-106. De ônibus, a Auto Viação 1001 possui linhas diárias saindo da Rodoviária Novo Rio e de Niterói direto para o terminal da cidade.",
    },
    {
      question: "Qual é o aeroporto mais próximo?",
      answer:
        "O mais próximo é o Aeroporto de Cabo Frio (CFB), a cerca de 55 km. Na capital, o Galeão (GIG) e o Santos Dumont (SDU) ficam a aproximadamente 110 km e oferecem a maior variedade de voos.",
    },
    {
      question: "Qual praia é mais indicada para famílias com crianças?",
      answer:
        "A Praia da Vila (no centro) e as margens da Lagoa de Saquarema são as mais recomendadas. O trecho perto do canal possui águas mais tranquilas e rasas, além de contar com excelente infraestrutura de calçadão e quiosques.",
    },
    {
      question: "Quais são as melhores praias para a prática de surf?",
      answer:
        "A Praia de Itaúna é a 'Capital do Surf', conhecida mundialmente por ondas fortes e constantes, sediando até o campeonato da WSL. A Praia Vilatur e o trecho aberto da Praia da Vila também são excelentes para surfistas experientes.",
    },
    {
      question: "Posso levar animais de estimação para a praia?",
      answer:
        "Por questões de higiene pública, não é permitida a permanência de pets na faixa de areia. Porém, você pode passear com eles tranquilamente no calçadão, praças e vias públicas, sempre usando guia (e focinheira, quando exigido por lei).",
    },
    {
      question: "Saquarema é um destino apenas para surfistas?",
      answer:
        "De forma alguma! Além do surf, a cidade oferece pontos turísticos históricos como a Igreja de Nossa Senhora de Nazareth, esportes náuticos na lagoa (stand-up paddle, kitesurf), passeios de barco, trilhas ecológicas, mirantes e uma ótima gastronomia local.",
    },
    {
      question: "Como funcionam os serviços de hospedagem locais?",
      answer:
        "Saquarema oferece desde pousadas aconchegantes até grandes hotéis. Na seção 'HOSPEDAGEM' do nosso site, você encontra uma lista completa com avaliações e contatos.",
    },
    {
      question: "Como posso entrar em contato com o suporte?",
      answer:
        "Você pode entrar em contato com o suporte através do nosso formulário de contato ou enviando um e-mail para a Secretaria Municipal de Esporte, Lazer e Turismo.",
    },
  ];
  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Seção de Cabeçalho (Hero) */}
      <section className="bg-primary px-4 pb-16 pt-32 relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto max-w-4xl text-center relative z-10"
        >
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-2 text-sm text-primary-foreground/80 transition-colors hover:bg-primary-foreground/20 hover:text-primary-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para a página inicial
          </Link>

          <h1 className="font-display text-4xl font-bold uppercase text-primary-foreground md:text-6xl flex flex-col md:flex-row items-center justify-center gap-4">
            <HelpCircle className="h-10 w-10 md:h-14 md:w-14 text-accent" />
            Dúvidas Frequentes
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-foreground/80 md:text-xl">
            Encontre as respostas para as perguntas mais comuns sobre o portal
            Apaixone-se por Saquarema.
          </p>
        </motion.div>
      </section>

      {/* Seção de Conteúdo (Acordeões) */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                key={index}
                className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? "border-primary/50 bg-card shadow-md"
                    : "border-border bg-card/50 hover:border-primary/30 hover:bg-card"
                }`}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="flex w-full items-center justify-between p-6 text-left"
                >
                  <span className="font-display text-lg font-bold text-foreground sm:text-xl pr-4">
                    {faq.question}
                  </span>

                  {/* Ícone customizado que rotaciona e muda de cor quando aberto */}
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
                      isOpen
                        ? "bg-primary text-primary-foreground"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="h-5 w-5" />
                    </motion.div>
                  </div>
                </button>

                {/* Área da Resposta Animada */}
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 text-muted-foreground leading-relaxed sm:text-base">
                        <div className="pt-4 border-t border-border">
                          {faq.answer}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
