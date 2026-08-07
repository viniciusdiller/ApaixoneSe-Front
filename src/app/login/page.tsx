"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Waves, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [identificador, setIdentificador] = useState("");
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (searchParams.get("verified") === "1") {
      toast.success("Conta verificada com sucesso. Agora você já pode entrar.");
      const url = new URL(window.location.href);
      url.searchParams.delete("verified");
      window.history.replaceState({}, "", url.pathname + url.search);
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ identificador, senha });

      const raw =
        typeof window !== "undefined" ? localStorage.getItem("app_user") : null;
      const user = raw ? JSON.parse(raw) : null;

      if (user?.perfil === "ADMIN") {
        router.push("/admin");
      } else if (user?.perfil === "PARCEIRO") {
        router.push("/perfil");
      } else {
        router.push("/");
      }
    } catch (err: unknown) {
      let msg = "Usuário ou senha inválidos.";
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
              Apaixone-Se
            </p>
            <p
              className="text-sm font-sans leading-relaxed max-w-xs"
              style={{ color: "hsl(179.5 60% 85%)" }}
            >
              Descubra experiências únicas, roteiros inesquecíveis e a beleza
              das praias e lagoas de Saquarema.
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

        <div className="w-full max-w-sm">
          {/* Cabeçalho do formulário */}
          <div className="mb-8">
            <h1 className="text-2xl font-display font-bold uppercase tracking-wide text-foreground">
              Entrar
            </h1>
            <p className="mt-1.5 text-sm text-muted-foreground">
              Acesse sua conta para continuar.
            </p>
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
            <div className="space-y-1.5">
              <label
                htmlFor="identificador"
                className="text-sm font-semibold text-foreground"
              >
                Usuário ou E-mail
              </label>
              <input
                id="identificador"
                type="text"
                required
                autoComplete="username"
                value={identificador}
                onChange={(e) => setIdentificador(e.target.value)}
                placeholder="Usuário"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

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
                  type={showSenha ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Sua senha aqui"
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

              {/* Link esqueci a senha */}
              <div className="flex justify-end pt-1">
                <Link
                  href="/esqueci-a-senha"
                  className="text-xs text-primary hover:underline"
                >
                  Esqueceu a senha?
                </Link>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-60 active:scale-[0.98]"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading ? "Entrando..." : "Entrar"}
            </button>

            <div className="text-center text-sm text-muted-foreground pt-2">
              Ainda não tem uma conta?{" "}
              <Link
                href="/login/registro-usuario"
                className="font-semibold text-primary underline-offset-4 transition-colors hover:underline"
              >
                Clique aqui
              </Link>
            </div>
          </form>

          {/* Separador */}
          <div className="relative my-6 flex items-center">
            <div className="flex-1 border-t border-border" />
            <span className="mx-4 text-xs text-muted-foreground">ou</span>
            <div className="flex-1 border-t border-border" />
          </div>

          <p className="text-center">
            <Link
              href="/"
              className="text-xs text-muted-foreground underline underline-offset-2 transition hover:text-foreground"
            >
              ← Voltar ao site
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <LoginPageContent />
    </Suspense>
  );
}
