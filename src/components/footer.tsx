"use client";

import Link from "next/link";
import { Facebook, Instagram, Send, Waves, Youtube, Globe } from "lucide-react";
import { useState } from "react";

export function Footer() {
  const [email, setEmail] = useState("");

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
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-display text-sm uppercase tracking-wide text-accent">
              Legal
            </h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li>
                <a
                  href="#"
                  className="transition-colors hover:text-primary-foreground"
                >
                  Transparência
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="transition-colors hover:text-primary-foreground"
                >
                  Política de Privacidade
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="transition-colors hover:text-primary-foreground"
                >
                  Termos de Uso
                </a>
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
            <div className="mt-7">
              <p className="mb-2 text-xs text-primary-foreground/60">
                Receba as ondas no seu e-mail
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setEmail("");
                }}
                className="flex"
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="flex-1 rounded-l-full border-0 bg-primary-foreground/10 px-4 py-2 text-sm text-primary-foreground placeholder:text-primary-foreground/40 focus:outline-none focus:ring-1 focus:ring-accent"
                  required
                />
                <button
                  type="submit"
                  className="rounded-r-full bg-accent px-4 py-2 text-accent-foreground transition-colors hover:bg-accent/90"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
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
