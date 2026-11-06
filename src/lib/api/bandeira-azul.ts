import { apiFetch } from "./config";

export type BandeiraAzulBlocoTipo = "text" | "image" | "video";

export interface BandeiraAzulMidia {
  url: string;
  link?: string;
}

export interface BandeiraAzulBloco {
  type: BandeiraAzulBlocoTipo;
  content: string;
  bgColor?: string;
  isBold?: boolean;
  images?: BandeiraAzulMidia[];
  videos?: BandeiraAzulMidia[];
}

export interface BandeiraAzul {
  id: string;
  titulo: string;
  subtitulo?: string | null;
  /** Fotos do carrossel do banner, na ordem de exibição */
  bannerImagens?: string[] | null;
  blocos: BandeiraAzulBloco[];
  updatedAt: string;
}

export type SalvarBandeiraAzulDto = {
  titulo: string;
  subtitulo?: string;
  bannerImagens?: string[];
  blocos: BandeiraAzulBloco[];
};

export const bandeiraAzulApi = {
  /** GET /bandeira-azul — null enquanto o admin não publicou a página */
  get: () =>
    // Sem página publicada o backend responde com corpo vazio, que o apiFetch devolve como {}
    apiFetch<BandeiraAzul | null>("/bandeira-azul").then((p) => (p && p.id ? p : null)),

  /** PUT /bandeira-azul — cria ou substitui a página (admin) */
  save: (data: SalvarBandeiraAzulDto) =>
    apiFetch<BandeiraAzul>("/bandeira-azul", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  /** POST /bandeira-azul/midia — envia imagem ou vídeo e devolve a URL (admin) */
  uploadMidia: (arquivo: File) => {
    const form = new FormData();
    form.append("arquivo", arquivo);
    return apiFetch<{ url: string }>("/bandeira-azul/midia", {
      method: "POST",
      body: form,
    });
  },
};
