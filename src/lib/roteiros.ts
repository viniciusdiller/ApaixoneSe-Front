// Mapeamento estático dos 7 roteiros — sem mock de atividades.
// As atividades reais vêm do banco via atividadesApi.getByRoteiro(slug_enum)

export type TipoRoteiro =
  | "A_PE"
  | "ESPORTE_E_AVENTURA"
  | "DE_PRAIAS"
  | "CULTURAL"
  | "RELIGIOSO"
  | "RURAL"
  | "ECOLOGICO";

export type RoteiroMeta = {
  /** Enum salvo no banco (coluna `roteiro` da tabela `atividade`) */
  enum: TipoRoteiro;
  /** Slug usado na URL: /roteiros/[slug] */
  slug: string;
  label: string;
  descricao: string;

  imagem: string;
  /** Layout no bento grid da home */
  span: string;
};

export const ROTEIROS: RoteiroMeta[] = [
  {
    enum: "A_PE",
    slug: "a-pe",
    label: "A P\u00e9",
    descricao:
      "Percursos e trilhas para explorar Saquarema a pé, com contato direto com a natureza e a cultura local.",
    imagem: "/images/itauna-surf.jpg",
    span: "",
  },
  {
    enum: "ESPORTE_E_AVENTURA",
    slug: "esporte-e-aventura",
    label: "Esporte e Aventura",
    descricao:
      "Adrenalina pura em um dos destinos esportivos mais famosos do Brasil.",
    imagem: "/images/itauna-surf.jpg",
    span: "md:col-span-2",
  },
  {
    enum: "DE_PRAIAS",
    slug: "de-praias",
    label: "De Praias",
    descricao:
      "As praias de Saquarema — cada uma com uma personalidade \u00fanica.",
    imagem: "/images/itauna-surf.jpg",
    span: "",
  },
  {
    enum: "CULTURAL",
    slug: "cultural",
    label: "Cultural",
    descricao:
      "Mergulhe na hist\u00f3ria, na f\u00e9 e na arte que moldaram a identidade de Saquarema.",
    imagem: "/images/igreja-nazare.jpg",
    span: "md:col-span-2 md:row-span-2",
  },
  {
    enum: "RELIGIOSO",
    slug: "religioso",
    label: "Religioso",
    descricao:
      "Espiritualidade e devoc\u00e3o em lugares sagrados de grande beleza e tradi\u00e7\u00e3o.",
    imagem: "/images/igreja-nazare.jpg",
    span: "",
  },
  {
    enum: "RURAL",
    slug: "rural",
    label: "Rural",
    descricao:
      "Fazendas, gastronomia do campo e tradi\u00e7\u00f5es do interior de Saquarema.",
    imagem: "/images/gastronomia.jpg",
    span: "",
  },
  {
    enum: "ECOLOGICO",
    slug: "ecologico",
    label: "Ecol\u00f3gico",
    descricao:
      "Natureza exuberante, lagoas, restingas e fauna local para os amantes do ecoturismo.",
    imagem: "/images/itauna-surf.jpg",
    span: "",
  },
];

export function getRoteiroBySlug(slug: string): RoteiroMeta | undefined {
  return ROTEIROS.find((r) => r.slug === slug);
}
