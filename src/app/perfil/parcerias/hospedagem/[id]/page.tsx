"use client";

import { notify } from "@/lib/feedback";

import { useEffect, useState } from "react";
import { hospedagemApi } from "@/lib/api";
import { FormularioHospedagem } from "@/components/perfil/forms/FormularioHospedagem"; 
import { Loader2 } from "lucide-react";

export default function PaginaHospedagem({ params }: { params: { id?: string } }) {
  const idDaUrl = params?.id;
  
  // É novo se a URL não tiver ID ou se for a palavra "novo"
  const isNovo = !idDaUrl || idDaUrl === "novo"; 

  const [loading, setLoading] = useState(!isNovo);
  const [dados, setDados] = useState<any>(null);

  useEffect(() => {
    // Só vai ao banco de dados se for edição
    if (!isNovo && idDaUrl) {
      hospedagemApi.getById(idDaUrl)
        .then((resultado) => {
          setDados(resultado);
          setLoading(false);
        })
        .catch(() => {
          notify.error("Erro ao buscar hospedagem. Verifique se o ID está correto.");
          setLoading(false);
        });
    }
  }, [idDaUrl, isNovo]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background pt-32 pb-16">
      <div className="container mx-auto px-4">
        {isNovo ? (
          <FormularioHospedagem modo="criar" />
        ) : (
          <FormularioHospedagem 
            modo="editar" 
            estabelecimentoId={idDaUrl} 
            dadosIniciais={dados} 
          />
        )}
      </div>
    </main>
  );
}