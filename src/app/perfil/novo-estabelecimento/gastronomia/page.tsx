"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Store, UploadCloud } from "lucide-react";
import { PerfilFormField } from "@/components/perfil/UsuarioFormField";

export default function NovaGastronomiaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Estado para armazenar os dados do formulário
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    endereco: "",
    telefone: "",
    tipo: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // TODO: Aqui vamos conectar com a API de Gastronomia (gastronomiaApi.create)
      // Como o usuário comum cadastra, o backend deve salvar com status "PENDENTE" de aprovação
      console.log("Dados enviados:", formData);
      
      // Simulando tempo de rede por enquanto
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert("Estabelecimento enviado para aprovação com sucesso!");
      router.push("/perfil"); // Volta para o perfil após sucesso
    } catch (error) {
      console.error(error);
      alert("Erro ao enviar o cadastro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background pb-16 pt-32">
      <div className="container mx-auto max-w-3xl px-4">
        {/* Botão de Voltar */}
        <Link
          href="/perfil/novo-estabelecimento"
          className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para Categorias
        </Link>

        {/* Cabeçalho */}
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Store className="h-7 w-7" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold uppercase text-foreground">
              Cadastrar em Gastronomia
            </h1>
            <p className="text-muted-foreground">
              Preencha os dados para cadastrar seu estabelecimento.
            </p>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
          <div className="grid gap-6 sm:grid-cols-2">
            
            <PerfilFormField
              label="Nome do Estabelecimento *"
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              placeholder="Ex: Restaurante do João"
              required
              className="sm:col-span-2"
            />

            <PerfilFormField
              label="Tipo de Estabelecimento *"
              name="tipo"
              as="select"
              value={formData.tipo}
              onChange={handleChange}
              required
              options={[
                { label: "Restaurante", value: "Restaurante" },
                { label: "Bar", value: "Bar" },
                { label: "Café", value: "Cafe" },
                { label: "Lanchonete", value: "Lanchonete" },
                { label: "Quiosque", value: "Quiosque" },
                { label: "Outro", value: "Outro" },
              ]}
            />

            <PerfilFormField
              label="Telefone de Contato"
              name="telefone"
              value={formData.telefone}
              onChange={handleChange}
              placeholder="(22) 99999-9999"
            />

            <PerfilFormField
              label="Endereço Completo *"
              name="endereco"
              value={formData.endereco}
              onChange={handleChange}
              placeholder="Rua, Número, Bairro - Saquarema, RJ"
              required
              className="sm:col-span-2"
            />

            <PerfilFormField
              label="Descrição do Local *"
              name="descricao"
              as="textarea"
              value={formData.descricao}
              onChange={handleChange}
              placeholder="Conte um pouco sobre o seu estabelecimento, especialidades, ambiente..."
              required
              className="sm:col-span-2"
            />

            {/* Placeholder Visual para Imagem (Vamos dar vida a isso no próximo passo se quiser) */}
            <div className="sm:col-span-2 mt-2">
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Logo / Foto Principal
              </label>
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/50 py-8 transition-colors hover:bg-muted">
                <UploadCloud className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Clique ou arraste uma imagem aqui</p>
                <p className="text-xs text-muted-foreground/70 mt-1">PNG, JPG até 5MB</p>
              </div>
            </div>
          </div>

          <div className="mt-8 flex items-center justify-end gap-4 border-t border-border pt-6">
            <Link
              href="/perfil/novo-estabelecimento"
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-muted-foreground transition hover:text-foreground"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-primary px-8 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-70"
            >
              {loading ? "Enviando..." : "Enviar para Aprovação"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}