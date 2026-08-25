"use client";

import Link from "next/link";
import { ClipboardCheck, MapPin, Store } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const benefits = [
  {
    title: "Planeje suas viagens",
    description: "Monte roteiros personalizados",
    icon: MapPin,
  },
  {
    title: "Marque restaurantes visitados",
    description: "Registre suas experiências em Saquarema",
    icon: ClipboardCheck,
  },
  {
    title: "Cadastre seu negócio",
    description: "Torne-se parceiro como estabelecimento ou serviço",
    icon: Store,
  },
];

export function AccountCta() {
  const { user, isLoading } = useAuth();

  if (isLoading || user) return null;

  return (
    <section
      aria-labelledby="account-cta-title"
      className="bg-background px-4 py-10 sm:py-14"
    >
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-primary/80 px-5 py-10 text-center shadow-xl shadow-primary/10 sm:px-10 sm:py-12"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-28 h-64 w-64 rounded-full bg-primary-foreground/10"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-36 -left-24 h-64 w-64 rounded-full bg-primary-foreground/10"
        />

        <div className="relative">
          <h2
            id="account-cta-title"
            className="font-display text-2xl font-semibold tracking-wide text-primary-foreground sm:text-3xl"
          >
            Crie sua conta e viva Saquarema no seu ritmo
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-primary-foreground/85 sm:text-base">
            É grátis e leva menos de um minuto para começar.
          </p>

          <div
            aria-label="Benefícios de criar uma conta"
            className="mx-auto mt-8 grid max-w-4xl gap-3 md:grid-cols-3"
          >
            {benefits.map(({ title, description, icon: Icon }) => (
              <article
                key={title}
                className="flex min-h-36 flex-col items-center justify-center rounded-2xl border border-primary-foreground/10 bg-primary-foreground/10 px-4 py-5 transition-colors hover:bg-primary-foreground/15"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-foreground/10 text-primary-foreground">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <h3 className="mt-3 text-sm font-semibold leading-tight text-primary-foreground">
                  {title}
                </h3>
                <p className="mt-1 max-w-[14rem] text-xs leading-relaxed text-primary-foreground/75">
                  {description}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/login/registro-usuario"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary-foreground px-6 py-2.5 text-sm font-semibold text-primary shadow-md transition hover:scale-[1.02] hover:bg-primary-foreground/95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              Criar uma conta
            </Link>
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-primary-foreground/45 px-6 py-2.5 text-sm font-semibold text-primary-foreground transition hover:scale-[1.02] hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              Já tenho conta
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
