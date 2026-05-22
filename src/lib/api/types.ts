// ─── Users ────────────────────────────────────────────────────────────────
export interface User {
  id: number;
  nome: string;
  email: string;
  createdAt?: string;
}

export interface RegisterUserDto {
  nome: string;
  email: string;
  senha: string;
}

export interface LoginUserDto {
  email: string;
  senha: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

// ─── Atividades ───────────────────────────────────────────────────────────
export interface Atividade {
  id: number;
  nome: string;
  descricao: string;
  roteiro?: string;
  imagem?: string;
  createdAt?: string;
}

export interface CreateAtividadeDto {
  nome: string;
  descricao: string;
  roteiro?: string;
  imagem?: string;
}

export type UpdateAtividadeDto = Partial<CreateAtividadeDto>;

// ─── Eventos ──────────────────────────────────────────────────────────────
export interface Evento {
  id: number;
  nome: string;
  descricao: string;
  data: string;
  local?: string;
  imagem?: string;
  createdAt?: string;
}

export interface CreateEventoDto {
  nome: string;
  descricao: string;
  data: string;
  local?: string;
  imagem?: string;
}

export type UpdateEventoDto = Partial<CreateEventoDto>;

// ─── Gastronomia ──────────────────────────────────────────────────────────
export interface Gastronomia {
  id: number;
  nome: string;
  descricao: string;
  tipo?: string;
  endereco?: string;
  imagem?: string;
  createdAt?: string;
}

export interface CreateGastronomiaDto {
  nome: string;
  descricao: string;
  tipo?: string;
  endereco?: string;
  imagem?: string;
}

export type UpdateGastronomiaDto = Partial<CreateGastronomiaDto>;

// ─── Hospedagem ───────────────────────────────────────────────────────────
export interface Hospedagem {
  id: number;
  nome: string;
  descricao: string;
  tipo?: string;
  endereco?: string;
  imagem?: string;
  preco?: number;
  createdAt?: string;
}

export interface CreateHospedagemDto {
  nome: string;
  descricao: string;
  tipo?: string;
  endereco?: string;
  imagem?: string;
  preco?: number;
}

export type UpdateHospedagemDto = Partial<CreateHospedagemDto>;

// ─── Serviço Turista ──────────────────────────────────────────────────────
export interface ServicoTurista {
  id: number;
  nome: string;
  descricao: string;
  categoria?: string;
  contato?: string;
  imagem?: string;
  createdAt?: string;
}

export interface CreateServicoTuristaDto {
  nome: string;
  descricao: string;
  categoria?: string;
  contato?: string;
  imagem?: string;
}

export type UpdateServicoTuristaDto = Partial<CreateServicoTuristaDto>;

// ─── Plano de Viagem ──────────────────────────────────────────────────────
export interface PlanoViagem {
  id: number;
  titulo: string;
  descricao?: string;
  userId?: number;
  itens?: ItemPlanoViagem[];
  createdAt?: string;
}

export interface CreatePlanoViagemDto {
  titulo: string;
  descricao?: string;
  userId?: number;
}

export type UpdatePlanoViagemDto = Partial<CreatePlanoViagemDto>;

// ─── Item Plano Viagem ────────────────────────────────────────────────────
export interface ItemPlanoViagem {
  id: number;
  planoId: number;
  referenciaId: number;
  tipo: string;
  createdAt?: string;
}

export interface CreateItemPlanoViagemDto {
  planoId: number;
  referenciaId: number;
  tipo: string;
}

// ─── Cat (categoria) ──────────────────────────────────────────────────────
export interface Cat {
  id: number;
  nome: string;
  descricao?: string;
  createdAt?: string;
}

export interface CreateCatDto {
  nome: string;
  descricao?: string;
}

export type UpdateCatDto = Partial<CreateCatDto>;
