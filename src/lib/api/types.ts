// ─── Enums ────────────────────────────────────────────────────────────────
export type Perfil = "USUARIO" | "PARCEIRO" | "ADMIN";

export type TipoRoteiro =
  | "A_PE"
  | "ESPORTE_E_AVENTURA"
  | "DE_PRAIAS"
  | "CULTURAL"
  | "RELIGIOSO"
  | "RURAL"
  | "ECOLOGICO";

export type TipoServicoTurista =
  | "GUIA_TURISMO"
  | "AGENCIA_TURISMO"
  | "ESPORTE_LAZER"
  | "LOCADORA_VEICULOS";

export type StatusEstabelecimento = "PENDENTE" | "APROVADO" | "REJEITADO";

// ─── Users ────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  nome: string;
  usuario: string;
  email: string;
  perfil: Perfil;
  createdAt?: string;
}

export interface RegisterUserDto {
  nome: string;
  usuario: string;
  email: string;
  senha: string;
  perfil?: Perfil;
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
  id: string;
  titulo: string;
  descricao: string;
  local: string;
  latitude?: number;
  longitude?: number;
  roteiro: TipoRoteiro;
  createdAt?: string;
}

export interface CreateAtividadeDto {
  titulo: string;
  descricao: string;
  local: string;
  latitude?: number;
  longitude?: number;
  roteiro: TipoRoteiro;
}

export type UpdateAtividadeDto = Partial<CreateAtividadeDto>;

// ─── Eventos ──────────────────────────────────────────────────────────────
export interface Evento {
  id: string;
  titulo: string;
  descricao: string;
  data: string; // ISO DateTime
  local: string;
  createdAt?: string;
}

export interface CreateEventoDto {
  titulo: string;
  descricao: string;
  data: string; // ISO DateTime
  local: string;
}

export type UpdateEventoDto = Partial<CreateEventoDto>;

// ─── Gastronomia ──────────────────────────────────────────────────────────
export interface Gastronomia {
  id: string;
  nome: string;
  telefone: string;
  instagram?: string;
  endereco: string;
  especialidade?: string;
  cnpj: string;
  responsavelNome: string;
  responsavelCpf: string;
  documentoPdfUrl: string;
  logoUrl: string;
  status: StatusEstabelecimento;
  usuarioId: string;
  createdAt?: string;
}

export interface CreateGastronomiaDto {
  nome: string;
  telefone: string;
  instagram?: string;
  endereco: string;
  especialidade?: string;
  cnpj: string;
  responsavelNome: string;
  responsavelCpf: string;
  documentoPdfUrl: string;
  logoUrl: string;
  usuarioId: string;
}

export type UpdateGastronomiaDto = Partial<CreateGastronomiaDto>;

// ─── Hospedagem ───────────────────────────────────────────────────────────
export interface Hospedagem {
  id: string;
  nome: string;
  telefone: string;
  instagram?: string;
  endereco: string;
  textoDiferencial: string;
  cnpj: string;
  responsavelNome: string;
  responsavelCpf: string;
  documentoPdfUrl: string;
  logoUrl: string;
  status: StatusEstabelecimento;
  usuarioId: string;
  createdAt?: string;
}

export interface CreateHospedagemDto {
  nome: string;
  telefone: string;
  instagram?: string;
  endereco: string;
  textoDiferencial: string;
  cnpj: string;
  responsavelNome: string;
  responsavelCpf: string;
  documentoPdfUrl: string;
  logoUrl: string;
  usuarioId: string;
}

export type UpdateHospedagemDto = Partial<CreateHospedagemDto>;

// ─── Serviço Turista ──────────────────────────────────────────────────────
export interface ServicoTurista {
  id: string;
  tipo: TipoServicoTurista;
  nome: string;
  telefone: string;
  instagram?: string;
  descricao?: string;
  endereco?: string;
  cnpj?: string;
  roteiro?: TipoRoteiro;
  idiomas?: string;
  logoUrl?: string;
  fotoUrl?: string;
  status: StatusEstabelecimento;
  usuarioId: string;
  createdAt?: string;
}

export interface CreateServicoTuristaDto {
  tipo: TipoServicoTurista;
  nome: string;
  telefone: string;
  instagram?: string;
  descricao?: string;
  endereco?: string;
  cnpj?: string;
  roteiro?: TipoRoteiro;
  idiomas?: string;
  logoUrl?: string;
  fotoUrl?: string;
  usuarioId: string;
}

export type UpdateServicoTuristaDto = Partial<CreateServicoTuristaDto>;

// ─── Plano de Viagem ──────────────────────────────────────────────────────
export interface PlanoViagem {
  id: string;
  titulo: string;
  dataInicio: string;
  dataFim: string;
  usuarioId: string;
  itens?: ItemPlanoViagem[];
  createdAt?: string;
}

export interface CreatePlanoViagemDto {
  titulo: string;
  dataInicio: string;
  dataFim: string;
  usuarioId: string;
}

export type UpdatePlanoViagemDto = Partial<CreatePlanoViagemDto>;

// ─── Item Plano Viagem ────────────────────────────────────────────────────
export interface ItemPlanoViagem {
  id: string;
  dataHoraAgendada: string;
  anotacao?: string;
  planoViagemId: string;
  gastronomiaId?: string;
  hospedagemId?: string;
  eventoId?: string;
  atividadeId?: string;
  servicoTuristaId?: string;
  createdAt?: string;
}

export interface CreateItemPlanoViagemDto {
  dataHoraAgendada: string;
  anotacao?: string;
  planoViagemId: string;
  gastronomiaId?: string;
  hospedagemId?: string;
  eventoId?: string;
  atividadeId?: string;
  servicoTuristaId?: string;
}

// ─── Cat ──────────────────────────────────────────────────────────────────
export interface Cat {
  id: string;
  texto: string;
  arquivoUrl: string;
  createdAt?: string;
}

export interface CreateCatDto {
  texto: string;
  arquivoUrl: string;
}

export type UpdateCatDto = Partial<CreateCatDto>;
