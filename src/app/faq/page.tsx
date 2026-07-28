"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, ChevronDown, HelpCircle } from "lucide-react";

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "Como posso entrar em contato com o suporte?",
      answer:
        "Você pode entrar em contato com o suporte através do nosso formulário de contato ou enviando um e-mail para a Secretaria de Turismo.",
    },
    {
      question:
        "Onde posso encontrar informações sobre os eventos em Saquarema?",
      answer:
        "Você pode acessar a aba 'EVENTOS' no menu principal do nosso site para conferir o calendário oficial atualizado da Capital Nacional do Esporte.",
    },
    {
      question: "Quais são as melhores praias para a prática de surf?",
      answer:
        "A Praia de Itaúna é mundialmente conhecida pelas suas ondas perfeitas e frequentemente sedia campeonatos internacionais de surf. A Praia da Vila também é uma excelente opção.",
    },
    {
      question: "Como funcionam os serviços de hospedagem locais?",
      answer:
        "Saquarema oferece desde pousadas aconchegantes até grandes hotéis. Na seção 'HOSPEDAGEM' do nosso site, você encontra uma lista completa com avaliações e contatos.",
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
