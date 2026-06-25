"use client";

import { useEffect, useState } from "react";
import { servicoTuristaApi } from "@/lib/api";
import { FormularioServico } from "@/components/perfil/forms/FormularioServicoTurista"; 
import { Loader2 } from "lucide-react";

export default function PaginaServico({ params }: { params: { id?: string } }) {
  const idDaUrl = params?.id;
  
  const isNovo = !idDaUrl || idDaUrl === "novo"; 

  const [loading, setLoading] = useState(!isNovo);
  const [dados, setDados] = useState<any>(null);

  useEffect(() => {
    if (!isNovo && idDaUrl) {
      servicoTuristaApi.getById(idDaUrl)
        .then((resultado) => {
          setDados(resultado);
          setLoading(false);
        })
        .catch(() => {
          alert("Erro ao buscar serviço. Verifique se o ID está correto.");
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
          <FormularioServico modo="criar" />
        ) : (
          <FormularioServico 
            modo="editar" 
            estabelecimentoId={idDaUrl} 
            dadosIniciais={dados} 
          />
        )}
      </div>
    </main>
  );
}