"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Waves, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [identificador, setIdentificador] = useState("");
  const [senha, setSenha] = useState("");
  const [showSenha, setShowSenha] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ identificador, senha });
      // Redireciona conforme perfil (lido do localStorage logo após login)
      const raw = typeof window !== "undefined" ? localStorage.getItem("app_user") : null;
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
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-10 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
              <Waves className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-foreground">
            Apaixone-se
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Saquarema / RJ — Capital Nacional do Surf
          </p>
        </div>

        {/* Card do formulário */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-border bg-card p-8 shadow-sm"
        >
          <div className="space-y-1.5">
            <label htmlFor="identificador" className="text-sm font-semibold text-foreground">
              Usuário ou E-mail
            </label>
            <input
              id="identificador"
              type="text"
              required
              autoComplete="username"
              value={identificador}
              onChange={(e) => setIdentificador(e.target.value)}
              placeholder="seu_usuario"
              className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="senha" className="text-sm font-semibold text-foreground">
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
                placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 pr-11 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <button
                type="button"
                onClick={() => setShowSenha((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                aria-label={showSenha ? "Ocultar senha" : "Mostrar senha"}
              >
                {showSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
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
            {loading ? "Entrando\u2026" : "Entrar"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          <Link
            href="/"
            className="underline underline-offset-2 transition hover:text-foreground"
          >
            ← Voltar ao site
          </Link>
        </p>
      </div>
    </div>
  );
}
