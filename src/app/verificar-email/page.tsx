'use client';

import { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { verifyEmailToken } from '@/lib/api/auth';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

function VerificarEmailContent() {
  const router = useRouter();
  const [digits, setDigits] = useState<string[]>(Array(6).fill(''));
  const [isLoading, setIsLoading] = useState(false);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = cleaned;
    setDigits(next);
    if (cleaned && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) inputsRef.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = Array(6).fill('');
    pasted.split('').forEach((char, i) => { next[i] = char; });
    setDigits(next);
    const focusIdx = Math.min(pasted.length, 5);
    inputsRef.current[focusIdx]?.focus();
  };

  const code = digits.join('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) return toast.error('Digite os 6 dígitos do código.');
    setIsLoading(true);
    try {
      await verifyEmailToken(code);
      toast.success('E-mail verificado com sucesso!');
      router.push('/login?emailVerificado=true');
    } catch (err: unknown) {
      toast.error((err as Error).message || 'Código inválido ou expirado.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
        {/* Ícone de envelope */}
        <div className="mx-auto mb-6 flex items-center justify-center h-14 w-14 rounded-full bg-blue-100">
          <svg className="h-7 w-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-2">Verifique seu e-mail</h2>
        <p className="text-gray-600 mb-8 text-sm leading-relaxed">
          Enviamos um código de <strong>6 dígitos</strong> para o seu e-mail.
          Digite-o abaixo para ativar sua conta.
        </p>

        <form onSubmit={handleSubmit}>
          {/* Inputs OTP */}
          <div className="flex justify-center gap-3 mb-8">
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputsRef.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onPaste={handlePaste}
                className="w-12 h-14 text-center text-2xl font-bold border-2 rounded-lg
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  border-gray-300 text-gray-800 bg-gray-50 transition-all"
                aria-label={`Dígito ${i + 1} do código`}
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading || code.length < 6}
            className="w-full bg-[#0D7675] text-white py-3 px-4 rounded-lg font-semibold
              hover:bg-[#0a5f5e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Verificando...' : 'Confirmar código'}
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-500">
            Não recebeu o código? Verifique sua caixa de spam.
          </p>
          <Link href="/login" className="text-sm font-medium text-[#0D7675] hover:underline">
            Voltar para o Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerificarEmailPage() {
  return (
    <Suspense fallback={<div className="flex justify-center items-center min-h-screen">Carregando...</div>}>
      <VerificarEmailContent />
    </Suspense>
  );
}
