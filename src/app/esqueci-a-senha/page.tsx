'use client';

import { useState } from 'react';
import { forgotPassword } from '@/lib/api/auth';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function EsqueciSenhaPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await forgotPassword(email);
      toast.success(response?.message || 'Código de recuperação enviado para o e-mail informado.');
      // Passa o email como query param para a página de redefinir senha
      // mostrar para qual e-mail o código foi enviado
      router.push(`/redefinir-senha?email=${encodeURIComponent(email)}`);
    } catch (error: unknown) {
      toast.error((error as Error).message || 'Ocorreu um erro ao processar sua solicitação.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8">
        {/* Ícone */}
        <div className="mx-auto mb-6 flex items-center justify-center h-14 w-14 rounded-full bg-teal-100">
          <svg className="h-7 w-7 text-[#0D7675]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Recuperar Senha</h2>
        <p className="text-sm text-gray-600 mb-6 text-center leading-relaxed">
          Digite seu e-mail para receber um <strong>código de 6 dígitos</strong> e redefinir sua senha.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">E-mail</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2.5 border border-gray-300 rounded-lg shadow-sm
                focus:outline-none focus:ring-2 focus:ring-[#0D7675] focus:border-[#0D7675]"
              placeholder="seu@email.com"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg
              shadow-sm text-sm font-semibold text-white bg-[#0D7675]
              hover:bg-[#0a5f5e] transition-colors
              focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0D7675]
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Enviando...' : 'Enviar código'}
          </button>
        </form>

        <p className="mt-4 text-xs text-gray-500 text-center">
          Você receberá um código de 6 dígitos válido por 30 minutos.
        </p>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-[#0D7675] hover:underline font-medium">
            Voltar para o Login
          </Link>
        </div>
      </div>
    </div>
  );
}
