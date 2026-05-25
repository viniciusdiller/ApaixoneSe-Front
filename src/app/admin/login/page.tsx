"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usersApi } from "@/lib/api";
import { setToken } from "@/lib/api/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [identificador, setIdentificador] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await usersApi.login({ identificador, senha });
      // Backend retorna { token, user } — campo exato: "token"
      const token = data.token;
      if (!token) throw new Error("Token n\u00e3o retornado pelo servidor.");
      setToken(token);
      router.push("/admin");
    } catch (err: any) {
      let msg = "Usu\u00e1rio ou senha inv\u00e1lidos.";
      try {
        const parsed = JSON.parse(err.message);
        msg = Array.isArray(parsed.message)
          ? parsed.message.join(" ")
          : parsed.message ?? msg;
      } catch {}
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1
            className="text-3xl font-bold tracking-tight"
            style={{ fontFamily: "var(--font-display, Oswald, sans-serif)", color: "var(--primary, #c8a96e)" }}
          >
            Apaixone-se
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Painel Administrativo</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-card border border-border rounded-xl p-8 shadow-sm space-y-5"
        >
          <div className="space-y-1">
            <label htmlFor="identificador" className="text-sm font-medium">
              Usu\u00e1rio
            </label>
            <input
              id="identificador"
              type="text"
              required
              autoComplete="username"
              value={identificador}
              onChange={(e) => setIdentificador(e.target.value)}
              placeholder="seu_usuario"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary,#c8a96e)] transition"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="senha" className="text-sm font-medium">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              required
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary,#c8a96e)] transition"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg text-sm font-semibold transition disabled:opacity-60"
            style={{ background: "var(--primary, #c8a96e)", color: "#fff" }}
          >
            {loading ? "Entrando\u2026" : "Entrar"}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6">
          <a href="/" className="underline underline-offset-2 hover:text-foreground transition">
            \u2190 Voltar ao site
          </a>
        </p>
      </div>
    </div>
  );
}
