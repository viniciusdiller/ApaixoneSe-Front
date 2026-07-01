"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, AlertCircle, Loader2, CheckCircle2, Mail } from "lucide-react";
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
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <Image
              height={150}
              width={150}
              src="/images/apaixone-se.png"
              alt="Logo"
            />
          </div>
          <h1 className="text-2xl font-bold font-display uppercase text-foreground mb-6">
            {success ? "Conta criada!" : "Crie sua conta"}
          </h1>
        </div>

        {/* Card do formulário */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-border bg-card p-8 shadow-sm"
        >
          {success ? (
            <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
              <Mail className="h-16 w-16 text-primary" />
              <p className="text-lg font-semibold text-foreground">
                Verifique seu e-mail!
              </p>
              <p className="text-sm text-muted-foreground">
                Enviamos um link de confirmação para o seu e-mail. Por favor, acesse-o para ativar sua conta.
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
                <label htmlFor="nome" className="text-sm font-semibold text-foreground">
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
                <label htmlFor="email" className="text-sm font-semibold text-foreground">
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
                <label htmlFor="usuario" className="text-sm font-semibold text-foreground">
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
                <label htmlFor="senha" className="text-sm font-semibold text-foreground">
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
                    {showSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 px-1 py-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                  <p className="text-sm font-medium text-red-600">{error}</p>
                </div>
              )}

              <div className="pt-2">
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
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary underline-offset-4 transition hover:underline"
            >
              Faça login aqui
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}