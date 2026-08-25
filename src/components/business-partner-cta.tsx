"use client";

import Link from "next/link";
import { ArrowRight, Building2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface BusinessPartnerCtaProps {
  categoria?: string;
}

export function BusinessPartnerCta({ categoria }: BusinessPartnerCtaProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  const href = user ? "/perfil" : "/login";
  const actionLabel = user ? "Acessar meu perfil" : "Entrar para cadastrar";
  const categoriaTexto = categoria ? ` em ${categoria.toLowerCase()}` : "";

  return (
    <section className="bg-background px-4 py-10 sm:py-14">
      <div className="container mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-2xl border border-primary/15 bg-gradient-to-r from-primary/10 via-card to-accent/10 px-5 py-6 shadow-sm sm:px-8 sm:py-7">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-10 -top-14 h-40 w-40 rounded-full bg-primary/10"
          />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <Building2 className="h-5 w-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Para empreendedores locais
                </p>
                <h2 className="mt-1 font-display text-2xl font-bold uppercase leading-tight text-foreground sm:text-3xl">
                  Seu negócio também pode estar aqui
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  Cadastre seu estabelecimento ou serviço{categoriaTexto} e torne-se parceiro do Apaixone-se por Saquarema.
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground/80">
                  {user
                    ? "No seu perfil, você encontra as opções para cadastrar seu negócio."
                    : "Entre na sua conta para acessar o perfil e iniciar o cadastro."}
                </p>
              </div>
            </div>

            <Link
              href={href}
              className="group inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              {actionLabel}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
