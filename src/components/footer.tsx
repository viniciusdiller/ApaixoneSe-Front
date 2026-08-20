"use client";

import Link from "next/link";
import {
  Facebook,
  Instagram,
  Send,
  Waves,
  Youtube,
  Globe,
  Phone,
  Flame,
  Shield,
  ShieldAlert,
  Siren,
  LifeBuoy,
} from "lucide-react";
import { useState } from "react";
import { ondasNewsletterApi } from "@/lib/api/ondas-newsletter";
import CarrosselLogo from "./CarroselLogo";

const usefulNumbers = [
  { label: "Bombeiros", display: "193", dial: "193", icon: Flame },
  { label: "Polícia Militar", display: "190", dial: "190", icon: ShieldAlert },
  {
    label: "Polícia Civil (124ª DP)",
    display: "(22) 99202-1973",
    dial: "+5522992021973",
    icon: Shield,
  },
  {
    label: "Guarda Civil Municipal",
    display: "153",
    dial: "153",
    icon: Siren,
  },
  {
    label: "Salvamento Marítimo (Salvamar)",
    display: "(22) 99993-6638",
    dial: "+5522999936638",
    icon: LifeBuoy,
  },
  {
    label: "SAMU",
    display: "192",
    dial: "192",
    icon: ShieldAlert,
  },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const normalizedEmail = email.trim();
    if (!normalizedEmail || loading) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await ondasNewsletterApi.subscribe(normalizedEmail);
      setSuccess(
        response.message ||
          "Inscrição confirmada! Você receberá todos os dias pela manhã o boletim de ondas.",
      );
      setEmail("");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erro ao realizar inscrição.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="mb-4 flex items-center gap-2">
              <Waves className="h-7 w-7" />
              <span className="font-display text-xl font-bold">SAQUAREMA</span>
            </div>
            <p className="text-sm leading-relaxed text-primary-foreground/70">
              Prefeitura Municipal de Saquarema
              <br />
              Secretaria de Esporte, Lazer e Turismo
              <br />
              <span className="text-xs opacity-60">
                Cidade dos Esportes - Costa do Sol
              </span>
            </p>

            <CarrosselLogo />
          </div>

          <div>
            <h4 className="mb-4 font-display text-sm uppercase tracking-wide text-accent">
              Explorar
            </h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li>
                <Link
                  href="/praias"
                  className="transition-colors hover:text-primary-foreground"
                >
                  Praias & Lagoas
                </Link>
              </li>
              <li>
                <Link
                  href="/historia"
                  className="transition-colors hover:text-primary-foreground"
                >
                  História
                </Link>
              </li>
              <li>
                <Link
                  href="/roteiros"
                  className="transition-colors hover:text-primary-foreground"
                >
                  Roteiros
                </Link>
              </li>
              <li>
                <Link
                  href="/eventos"
                  className="transition-colors hover:text-primary-foreground"
                >
                  Eventos
                </Link>
              </li>
              <li>
                <Link
                  href="/gastronomia"
                  className="transition-colors hover:text-primary-foreground"
                >
                  Gastronomia
                </Link>
              </li>
              <li>
                <Link
                  href="/hospedagens"
                  className="transition-colors hover:text-primary-foreground"
                >
                  Hospedagem
                </Link>
              </li>
              <li>
                <Link
                  href="/servicos"
                  className="transition-colors hover:text-primary-foreground"
                >
                  Serviços para o Turista
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="transition-colors hover:text-primary-foreground"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-display text-sm uppercase tracking-wide text-accent">
              Legal
            </h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li>
                <Link
                  href="/transparencia"
                  className="transition-colors hover:text-primary-foreground"
                >
                  Transparência
                </Link>
              </li>
              <li>
                <Link
                  href="/politica-de-privacidade"
                  className="transition-colors hover:text-primary-foreground"
                >
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link
                  href="/termos-de-uso"
                  className="transition-colors hover:text-primary-foreground"
                >
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link
                  href="/legislacao"
                  className="transition-colors hover:text-primary-foreground"
                >
                  Legislação
                </Link>
              </li>
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1">
            <h4 className="mb-4 font-display text-sm uppercase tracking-wide text-accent">
              Conecte-se
            </h4>

            <div className="mb-5">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-primary-foreground/70">
                Prefeitura de Saquarema
              </span>
              <div className="flex gap-3">
                <a
                  href="https://www.saquarema.rj.gov.br/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-primary-foreground/10 p-2 transition-colors hover:bg-primary-foreground/20"
                  aria-label="Site Oficial da Prefeitura"
                >
                  <Globe className="h-5 w-5" />
                </a>
                <a
                  href="https://www.instagram.com/prefeiturasaquarema/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-primary-foreground/10 p-2 transition-colors hover:bg-primary-foreground/20"
                  aria-label="Instagram da Prefeitura"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="https://www.facebook.com/PrefeituradeSaquarema/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-primary-foreground/10 p-2 transition-colors hover:bg-primary-foreground/20"
                  aria-label="Facebook da Prefeitura"
                >
                  <Facebook className="h-5 w-5" />
                </a>
                <a
                  href="https://www.youtube.com/prefeituradesaquaremaoficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-primary-foreground/10 p-2 transition-colors hover:bg-primary-foreground/20"
                  aria-label="YouTube da Prefeitura"
                >
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </div>

            <div>
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-primary-foreground/70">
                Secretaria de Esporte, Lazer e Turismo
              </span>
              <div className="flex gap-3">
                <a
                  href="https://www.instagram.com/turismosaquaremarj/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-primary-foreground/10 p-2 transition-colors hover:bg-primary-foreground/20"
                  aria-label="Instagram do Turismo"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="https://www.facebook.com/TurismoSaquaremaRj/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-primary-foreground/10 p-2 transition-colors hover:bg-primary-foreground/20"
                  aria-label="Facebook do Turismo"
                >
                  <Facebook className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-primary-foreground/10 pt-8">
          <h4 className="mb-4 flex items-center gap-2 font-display text-sm uppercase tracking-wide text-accent">
            <Phone className="h-4 w-4" />
            Números Úteis (Emergência)
          </h4>
          <div className="grid grid-cols-2 gap-x-6 gap-y-4 text-sm text-primary-foreground/70 sm:grid-cols-3 lg:grid-cols-6">
            {usefulNumbers.map((item) => (
              <div key={item.label} className="flex items-start gap-2">
                <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <div>
                  <p className="text-primary-foreground">{item.label}</p>
                  <a
                    href={`tel:${item.dial}`}
                    className="transition-colors hover:text-primary-foreground hover:underline"
                  >
                    {item.display}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 border-t border-primary-foreground/10 pt-6 text-center text-xs text-primary-foreground/40">
          © {new Date().getFullYear()} Prefeitura Municipal de Saquarema. Todos
          os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
