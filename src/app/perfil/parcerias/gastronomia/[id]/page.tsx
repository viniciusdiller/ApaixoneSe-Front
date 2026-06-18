"use client";

import { useEffect, useState } from "react";
import { gastronomiaApi } from "@/lib/api";
import { FormularioGastronomia } from "@/components/perfil/forms/FormularioGastronomia"; 

export default function PaginaGastronomia({ params }: { params: { id?: string } }) {
  const idDaUrl = params?.id;
  
  // É novo se a URL não tiver ID nenhum ou se for a palavra "novo"
  const isNovo = !idDaUrl || idDaUrl === "novo"; 

  const [loading, setLoading] = useState(!isNovo);
  const [dados, setDados] = useState<any>(null);

  useEffect(() => {
    // Só vai no banco de dados se for uma edição (tem um ID de verdade)
    if (!isNovo && idDaUrl) {
      gastronomiaApi.getById(idDaUrl)
        .then((resultado) => {
          setDados(resultado);
          setLoading(false);
        })
        .catch(() => {
          alert("Erro ao buscar estabelecimento. Verifique se o ID está correto.");
          setLoading(false);
        });
    }
  }, [idDaUrl, isNovo]);

  if (loading) {
    return <p className="p-6 text-center text-muted-foreground">Carregando dados...</p>;
  }

  // Renderiza o nosso Componente Inteligente!
  return (
    <div className="p-4 md:p-8">
      {isNovo ? (
        <FormularioGastronomia modo="criar" />
      ) : (
        <FormularioGastronomia 
          modo="editar" 
          estabelecimentoId={idDaUrl} 
          dadosIniciais={dados} 
        />
      )}
    </div>
  );
}