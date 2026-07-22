export interface Lagoa {
  id: string;
  nome: string;
  slug: string;
  imagem: string;
  descricao_curta: string;
  descricao: string;
  filtros: string[];
  acessivel: boolean;
  dificuldade: string;
  estacionamento: boolean;
  quiosques: boolean;
  lat: number;
  lng: number;
}
