"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usersApi } from "@/lib/api";
import { setToken } from "@/lib/api/auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await usersApi.login({ username, password });
      const token = (data as any).access_token ?? (data as any).token;
      if (!token) throw new Error("Token não retornado pelo servidor.");
      setToken(token);
      router.push("/admin");
    } catch (err: any) {
      let msg = "Usuário ou senha inválidos.";
      try {
        const parsed = JSON.parse(err.message);
        msg = parsed.message ?? msg;
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
            <label htmlFor="username" className="text-sm font-medium">
              Usuário
            </label>
            <input
              id="username"
              type="text"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="seu_usuario"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--primary,#c8a96e)] transition"
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="text-sm font-medium">
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
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
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6">
          <a href="/" className="underline underline-offset-2 hover:text-foreground transition">
            ← Voltar ao site
          </a>
        </p>
      </div>
    </div>
  );
}
