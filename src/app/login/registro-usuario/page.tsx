"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Mail,
  Waves,
} from "lucide-react";
import Image from "next/image";
import { usersApi } from "@/lib/api/users";
import type { RegisterUserDto } from "@/lib/api/types";
import { maskPersonName } from "@/lib/masks";

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<RegisterUserDto>({
    nome: "",
    email: "",
    usuario: "",
    senha: "",
    perfil: "USUARIO",
  });

  const [showSenha, setShowSenha] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "nome" ? maskPersonName(value) : value,
    }));
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await usersApi.register(formData);
      setSuccess(true);
    } catch (err: unknown) {
      let msg = "Erro ao criar conta. Tente novamente.";
      try {
        const parsed = JSON.parse((err as Error).message);
        msg = Array.isArray(parsed.message)
          ? parsed.message.join(" ")
          : (parsed.message ?? msg);
      } catch {}
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Painel esquerdo — identidade visual */}
      <div
        className="hidden lg:flex lg:w-[46%] xl:w-[42%] flex-col items-center justify-center relative overflow-hidden"
        style={{
          background:
            "linear-gradient(155deg, hsl(179.5 100% 16%) 0%, hsl(192 100% 30%) 60%, hsl(179.5 100% 21.6%) 100%)",
        }}
      >
        {/* Círculos decorativos de fundo */}
        <div
          className="absolute -top-24 -left-24 w-80 h-80 rounded-full opacity-10"
          style={{ background: "hsl(0 0% 100%)" }}
        />
        <div
          className="absolute bottom-10 -right-16 w-64 h-64 rounded-full opacity-10"
          style={{ background: "hsl(0 0% 100%)" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-5"
          style={{ background: "hsl(0 0% 100%)" }}
        />

        {/* Conteúdo central */}
        <div className="relative z-10 flex flex-col items-center gap-8 px-10 text-center">
          <Image
            height={170}
            width={170}
            src="/images/apaixone-se.png"
            alt="ApaixoneSe Logo"
            className="drop-shadow-xl"
          />
          <div className="space-y-3">
            <h2
              className="text-3xl font-display font-bold uppercase tracking-wide"
              style={{ color: "hsl(0 0% 100%)" }}
            >
              Bem-vindo ao
            </h2>
            <p
              className="text-4xl font-display font-bold uppercase tracking-widest"
              style={{ color: "hsl(26.5 87.3% 75%)" }}
            >
              ApaixoneSe
            </p>
            <p
              className="text-sm font-sans leading-relaxed max-w-xs"
              style={{ color: "hsl(179.5 60% 85%)" }}
            >
              Descubra experiências únicas, roteiros inesquecíveis e a beleza
              das praias e lagoas de Saquerema.
            </p>
          </div>

          {/* Ondas decorativas */}
          <div
            className="flex items-center gap-3 mt-2"
            style={{ color: "hsl(179.5 60% 75%)" }}
          >
            <Waves className="h-5 w-5" />
            <span
              className="font-handwritten text-lg"
              style={{ color: "hsl(26.5 87.3% 78%)" }}
            >
              Saquarema
            </span>
            <Waves className="h-5 w-5" />
          </div>
        </div>

        {/* Onda decorativa na base */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            viewBox="0 0 1440 80"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            className="w-full h-16"
            style={{ fill: "hsl(210 16.7% 97.6%)" }}
          >
            <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" />
          </svg>
        </div>
      </div>

      {/* Painel direito — formulário */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 lg:px-12 xl:px-16">
        {/* Logo mobile (só aparece em telas pequenas) */}
        <div className="flex flex-col items-center mb-8 lg:hidden">
          <Image
            height={120}
            width={120}
            src="/images/apaixone-se.png"
            alt="Logo"
          />
        </div>

        <div className="w-full max-w-md">
          {/* Cabeçalho do formulário */}
          <div className="mb-8">
            <h1 className="text-2xl font-display font-bold uppercase tracking-wide text-foreground">
              {success ? "Conta criada!" : "Crie sua conta"}
            </h1>
            {!success && (
              <p className="mt-1.5 text-sm text-muted-foreground">
                Preencha os dados abaixo para se juntar à comunidade.
              </p>
            )}
            {/* Linha decorativa com a cor primary */}
            <div
              className="mt-4 h-0.5 w-12 rounded-full"
              style={{ background: "hsl(179.5 100% 21.6%)" }}
            />
          </div>

          {/* Card do formulário */}
          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-2xl border border-border bg-card p-8 shadow-sm"
          >
            {success ? (
              <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                <Mail className="h-16 w-16 text-primary" />
                <p className="text-lg font-semibold text-foreground">
                  Verifique seu e-mail!
                </p>
                <p className="text-sm text-muted-foreground">
                  Enviamos um link de confirmação para o seu e-mail. Por favor,
                  acesse-o para ativar sua conta.
                </p>
                <Link
                  href="/login"
                  className="mt-4 text-primary font-semibold hover:underline"
                >
                  Voltar para o Login
                </Link>
              </div>
            ) : (
              <>
                {/* Campo Nome */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="nome"
                    className="text-sm font-semibold text-foreground"
                  >
                    Nome Completo
                  </label>
                  <input
                    id="nome"
                    name="nome"
                    type="text"
                    required
                    value={formData.nome}
                    onChange={handleChange}
                    placeholder="Seu nome"
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Campo E-mail */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="text-sm font-semibold text-foreground"
                  >
                    E-mail
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="exemplo@email.com"
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Campo Usuário */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="usuario"
                    className="text-sm font-semibold text-foreground"
                  >
                    Nome de Usuário
                  </label>
                  <input
                    id="usuario"
                    name="usuario"
                    type="text"
                    required
                    value={formData.usuario}
                    onChange={handleChange}
                    placeholder="ex: joaosilva123"
                    className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                {/* Campo Senha */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="senha"
                    className="text-sm font-semibold text-foreground"
                  >
                    Senha
                  </label>
                  <div className="relative">
                    <input
                      id="senha"
                      name="senha"
                      type={showSenha ? "text" : "password"}
                      required
                      value={formData.senha}
                      onChange={handleChange}
                      placeholder="Crie uma senha forte"
                      className="w-full rounded-xl border border-border bg-background px-4 py-2.5 pr-11 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowSenha((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                    >
                      {showSenha ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                )}

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-60 active:scale-[0.98]"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {loading ? "A criar conta..." : "Criar Conta"}
                  </button>
                </div>
              </>
            )}
          </form>

          {!success && (
            <>
              {/* Separador */}
              <div className="relative my-6 flex items-center">
                <div className="flex-1 border-t border-border" />
                <span className="mx-4 text-xs text-muted-foreground">ou</span>
                <div className="flex-1 border-t border-border" />
              </div>

              <p className="text-center text-sm text-muted-foreground">
                Já tem uma conta?{" "}
                <Link
                  href="/login"
                  className="font-semibold text-primary underline-offset-4 transition hover:underline"
                >
                  Faça login aqui
                </Link>
              </p>

              <p className="mt-4 text-center">
                <Link
                  href="/"
                  className="text-xs text-muted-foreground underline underline-offset-2 transition hover:text-foreground"
                >
                  ← Voltar ao site
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
