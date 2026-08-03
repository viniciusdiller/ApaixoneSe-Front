"use client";

import Link from "next/link";
import { Facebook, Instagram, Send, Waves, Youtube, Globe } from "lucide-react";
import { useState } from "react";
import { ondasNewsletterApi } from "@/lib/api/ondas-newsletter";
import CarrosselLogo from "./CarroselLogo";

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
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Waves className="h-7 w-7" />
              <span className="font-display text-xl font-bold">SAQUAREMA</span>
            </div>
            <p className="text-sm leading-relaxed text-primary-foreground/70">
              Prefeitura Municipal de Saquarema
              <br />
              Secretaria de Turismo
              <br />
              <span className="text-xs opacity-60">
                Capital Nacional do Esporte — Região dos Lagos, RJ
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
                  Praias
                </Link>
              </li>
              <li>
                <Link
                  href="/cultura"
                  className="transition-colors hover:text-primary-foreground"
                >
                  Cultura & História
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
            </ul>
          </div>

          <div>
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
                Secretaria de Turismo
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

        <div className="mt-12 border-t border-primary-foreground/10 pt-6 text-center text-xs text-primary-foreground/40">
          © {new Date().getFullYear()} Prefeitura Municipal de Saquarema. Todos
          os direitos reservados.
        </div>
      </div>
    </footer>
  );
}
