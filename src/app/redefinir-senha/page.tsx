"use client";

import {
  useRef,
  useState,
  useEffect,
  KeyboardEvent,
  ClipboardEvent,
  Suspense,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { resetPassword } from "@/lib/api/auth";
import { toast } from "react-hot-toast";
import Link from "next/link";

function RedefinirSenhaContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const emailParam = searchParams.get("email") || "";

  const [digits, setDigits] = useState<string[]>(Array(6).fill(""));
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = cleaned;
    setDigits(next);
    if (cleaned && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0)
      inputsRef.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5)
      inputsRef.current[index + 1]?.focus();
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);
    if (!pasted) return;
    const next = Array(6).fill("");
    pasted.split("").forEach((char, i) => {
      next[i] = char;
    });
    setDigits(next);
    const focusIdx = Math.min(pasted.length, 5);
    inputsRef.current[focusIdx]?.focus();
  };

  const code = digits.join("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) return toast.error("Digite os 6 dígitos do código.");
    if (password.length < 6)
      return toast.error("A nova senha deve ter ao menos 6 caracteres.");
    if (password !== confirmPassword)
      return toast.error("As senhas não conferem.");

    setIsLoading(true);
    try {
      const response = await resetPassword(code, password);
      toast.success(response?.message || "Senha redefinida com sucesso.");
      router.push("/login");
    } catch (error: unknown) {
      toast.error((error as Error).message || "Erro ao redefinir senha.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-md">
        {/* Ícone */}
        <div className="mx-auto mb-6 flex items-center justify-center h-14 w-14 rounded-full bg-teal-100">
          <svg
            className="h-7 w-7 text-[#0D7675]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Redefinir Senha
        </h2>
        <p className="text-sm text-gray-600 text-center mb-6">
          {emailParam ? (
            <>
              Código enviado para <strong>{emailParam}</strong>. Digite-o
              abaixo.
            </>
          ) : (
            "Digite o código de 6 dígitos recebido no e-mail e sua nova senha."
          )}
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* OTP Inputs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
              Código de verificação
            </label>
            <div className="flex justify-center gap-3">
              {digits.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => {
                    inputsRef.current[i] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  className="w-11 h-13 text-center text-xl font-bold border-2 rounded-lg
                    focus:outline-none focus:ring-2 focus:ring-[#0D7675] focus:border-[#0D7675]
                    border-gray-300 text-gray-800 bg-gray-50 transition-all"
                  aria-label={`Dígito ${i + 1} do código`}
                />
              ))}
            </div>
          </div>

          {/* Nova senha */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Nova senha
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 shadow-sm
                focus:outline-none focus:ring-2 focus:ring-[#0D7675] focus:border-[#0D7675]"
            />
          </div>

          {/* Confirmar senha */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirmar nova senha
            </label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita a nova senha"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2.5 shadow-sm
                focus:outline-none focus:ring-2 focus:ring-[#0D7675] focus:border-[#0D7675]"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || code.length < 6}
            className="w-full rounded-lg bg-[#0D7675] py-3 px-4 text-sm font-semibold text-white
              hover:bg-[#0a5f5e] transition-colors
              focus:outline-none focus:ring-2 focus:ring-[#0D7675] focus:ring-offset-2
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Salvando..." : "Redefinir senha"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm font-medium text-[#0D7675] hover:underline"
          >
            Voltar para o Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RedefinirSenhaPage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <RedefinirSenhaContent />
    </Suspense>
  );
}
