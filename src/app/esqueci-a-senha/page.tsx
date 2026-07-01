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
      toast.success(response?.message || 'Token de recuperação enviado para o e-mail informado.');
      setEmail('');
      router.push('/redefinir-senha');
    } catch (error: unknown) {
      toast.error((error as Error).message || 'Ocorreu um erro ao processar sua solicitação.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Recuperar Senha</h2>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Digite seu e-mail para receber o token de recuperação e redefinir sua senha.
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
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="seu@email.com"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0D7675] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0D7675] disabled:opacity-50"
          >
            {isLoading ? 'Enviando...' : 'Enviar Link'}
          </button>
        </form>

        <p className="mt-4 text-xs text-gray-500 text-center">
          Depois, informe o token recebido por e-mail na tela de redefinição.
        </p>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-[#0D7675] hover:text-[#0D7675] font-medium">
            Voltar para o Login
          </Link>
        </div>
      </div>
    </div>
  );
}