"use client";

import { FileCheck2 } from "lucide-react";

interface TermoAceiteFieldProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
}

const TITULO_TERMO =
  "Termo de Aceite e Adesão para Participação de Prestadores de Serviços Turísticos nas Ações de Promoção e Divulgação Turística do Município de Saquarema";

export function TermoAceiteField({
  checked,
  onChange,
  error,
}: TermoAceiteFieldProps) {
  return (
    <section className="space-y-3 rounded-[24px] border border-border/70 bg-background/60 p-5 md:p-6">
      <div className="flex items-center gap-3 pb-1">
        <div className="h-px flex-1 bg-gradient-to-r from-primary/30 to-transparent" />
        <p className="shrink-0 text-xs font-bold uppercase tracking-[0.28em] text-primary">
          Termo de Adesão
        </p>
        <div className="h-px flex-1 bg-gradient-to-l from-primary/30 to-transparent" />
      </div>

      <div className="max-h-56 space-y-3 overflow-y-auto rounded-2xl border border-dashed border-primary/25 bg-[linear-gradient(135deg,rgba(1,105,111,0.05),rgba(218,113,1,0.04))] p-4 text-xs leading-relaxed text-muted-foreground md:text-sm">
        <p className="font-semibold uppercase tracking-wide text-foreground">
          {TITULO_TERMO}
        </p>

        <p>
          Ao enviar este cadastro, o(a) prestador(a) de serviços turísticos
          identificado(a) nos dados preenchidos acima DECLARA, para os devidos
          fins, que aceita participar das ações de promoção e divulgação
          turística promovidas pelo Município de Saquarema e AUTORIZA o
          Município, por meio de seus canais oficiais e materiais
          institucionais, a divulgar:
        </p>

        <ul className="list-inside list-disc space-y-1">
          <li>seu nome, nome empresarial ou nome fantasia;</li>
          <li>descrição dos serviços prestados;</li>
          <li>endereço e canais de contato;</li>
          <li>redes sociais e site comercial;</li>
          <li>fotografias e demais materiais fornecidos pelo participante.</li>
        </ul>

        <p>
          A autorização abrange a utilização dessas informações e materiais em
          sites, redes sociais, campanhas institucionais, materiais gráficos,
          impressos e digitais e demais ações de promoção turística do
          Município, exclusivamente para fins de divulgação turística.
        </p>

        <p>
          O participante declara que as informações e imagens fornecidas são
          verdadeiras e que possui os direitos e autorizações necessários para
          sua utilização, responsabilizando-se por eventuais reclamações de
          terceiros.
        </p>

        <p>
          O Município poderá retirar ou suspender a divulgação caso sejam
          constatadas informações falsas, irregularidades, reclamações
          fundamentadas ou descumprimento das regras de participação.
        </p>
      </div>

      <label className="flex cursor-pointer items-start gap-3 text-sm text-foreground">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-primary focus:ring-2 focus:ring-primary/50"
        />
        <span className="flex items-start gap-2">
          <FileCheck2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          Li e aceito o Termo de Adesão e autorizo o uso das informações e
          imagens do meu negócio para fins de divulgação turística pelo
          Município de Saquarema.
        </span>
      </label>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </section>
  );
}
