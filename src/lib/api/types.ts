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
  identificador: string;
  senha: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

// ─── Atividades ───────────────────────────────────────────────────────────
export interface Atividade {
  id: number;
  titulo: string;
  descricao?: string;
  local: string;
  roteiro?: string;
  foto?: string;
  createdAt?: string;
}

export interface CreateAtividadeDto {
  titulo: string;
  descricao?: string;
  local: string;
  roteiro?: string;
  foto?: string;
}

export type UpdateAtividadeDto = Partial<CreateAtividadeDto>;

// ─── Eventos ──────────────────────────────────────────────────────────────
export interface Evento {
  id: number;
  titulo: string;
  descricao?: string;
  data: string;
  local: string;
  foto?: string;
  createdAt?: string;
}

export interface CreateEventoDto {
  titulo: string;
  descricao?: string;
  data: string;
  local: string;
  foto?: string;
}

export type UpdateEventoDto = Partial<CreateEventoDto>;

// ─── Gastronomia ──────────────────────────────────────────────────────────
export interface Gastronomia {
  id: number;
  titulo: string;
  descricao?: string;
  tipo?: string;
  local: string;
  foto?: string;
  createdAt?: string;
}

export interface CreateGastronomiaDto {
  titulo: string;
  descricao?: string;
  tipo?: string;
  local: string;
  foto?: string;
}

export type UpdateGastronomiaDto = Partial<CreateGastronomiaDto>;

// ─── Hospedagem ───────────────────────────────────────────────────────────
export interface Hospedagem {
  id: number;
  titulo: string;
  descricao?: string;
  tipo?: string;
  local: string;
  foto?: string;
  preco?: number;
  createdAt?: string;
}

export interface CreateHospedagemDto {
  titulo: string;
  descricao?: string;
  tipo?: string;
  local: string;
  foto?: string;
  preco?: number;
}

export type UpdateHospedagemDto = Partial<CreateHospedagemDto>;

// ─── Serviço Turista ──────────────────────────────────────────────────────
export interface ServicoTurista {
  id: number;
  titulo: string;
  descricao?: string;
  categoria?: string;
  contato?: string;
  foto?: string;
  createdAt?: string;
}

export interface CreateServicoTuristaDto {
  titulo: string;
  descricao?: string;
  categoria?: string;
  contato?: string;
  foto?: string;
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
