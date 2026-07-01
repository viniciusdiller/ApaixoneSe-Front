'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { resetPassword } from '@/lib/api/auth';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

function RedefinirSenhaContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [token, setToken] = useState(searchParams.get('token') ?? '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const sanitizedToken = token.trim();
    if (!sanitizedToken) return toast.error('Informe o token recebido no e-mail.');
    if (password.length < 8) return toast.error('A nova senha deve ter ao menos 8 caracteres.');
    if (password !== confirmPassword) return toast.error('As senhas não conferem.');

    setIsLoading(true);

    try {
      const response = await resetPassword(sanitizedToken, password);
      toast.success(response?.message || 'Senha redefinida com sucesso.');
      router.push('/login');
    } catch (error: unknown) {
      toast.error((error as Error).message || 'Erro ao redefinir senha.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Redefinir Senha</h2>
        <p className="text-sm text-gray-600 text-center mb-6">
          Cole o token recebido no e-mail e informe sua nova senha.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="token" className="block text-sm font-medium text-gray-700">Token</label>
            <input
              id="token"
              type="text"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="TOKEN_QUE_CHEGOU_NO_EMAIL"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Nova senha</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="NovaSenha123!"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirmar nova senha</label>
            <input
              id="confirmPassword"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repita a nova senha"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-[#0D7675] py-2 px-4 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-[#0D7675] focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? 'Salvando...' : 'Redefinir senha'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm font-medium text-[#0D7675] hover:text-[#0D7675]">
            Voltar para o Login
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function RedefinirSenhaPage() {
  return <Suspense fallback={<div>Carregando...</div>}><RedefinirSenhaContent /></Suspense>;
}