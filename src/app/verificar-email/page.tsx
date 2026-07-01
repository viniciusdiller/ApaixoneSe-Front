'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyEmailToken } from '@/lib/api/auth';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

function VerificarEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }

    verifyEmailToken(token)
      .then(() => {
        setStatus('success');
        toast.success('E-mail verificado com sucesso!');
        setTimeout(() => router.push('/login?verified=1'), 3000);
      })
      .catch((err) => {
        console.error(err);
        setStatus('error');
        toast.error('Token inválido ou expirado.');
      });
  }, [token, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        {status === 'loading' && (
          <>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-800">Verificando e-mail...</h2>
            <p className="mt-2 text-gray-600">Aguarde um momento enquanto validamos sua conta.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">E-mail Confirmado!</h2>
            <p className="mt-2 text-gray-600">Sua conta foi ativada. Você será redirecionado para o login.</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Erro na verificação</h2>
            <p className="mt-2 text-gray-600">O link é inválido ou já expirou.</p>
            <Link href="/login" className="mt-6 inline-block w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition">
              Ir para o Login
            </Link>
          </>
        )}
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