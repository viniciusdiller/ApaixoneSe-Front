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

export type Mes =
  | "JANEIRO"
  | "FEVEREIRO"
  | "MARCO"
  | "ABRIL"
  | "MAIO"
  | "JUNHO"
  | "JULHO"
  | "AGOSTO"
  | "SETEMBRO"
  | "OUTUBRO"
  | "NOVEMBRO"
  | "DEZEMBRO";

// ─── Users ────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  nome: string;
  usuario: string;
  email: string;
  perfil: Perfil;
  createdAt?: string;
  updatedAt?: string;
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

/** Backend retorna { token, user } */
export interface LoginResponse {
  token: string;
  user: User;
}

// ─── Atividades ───────────────────────────────────────────────────────────────
export interface Atividade {
  id: string;
  titulo: string;
  descricao: string;
  local: string;
  latitude?: number | null;
  longitude?: number | null;
  roteiro: TipoRoteiro;
  createdAt?: string;
  updatedAt?: string;
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

// ─── Eventos ───────────────────────────────────────────────────────────────
export interface Evento {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  local: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEventoDto {
  titulo: string;
  descricao: string;
  data: string;
  local: string;
}

export type UpdateEventoDto = Partial<CreateEventoDto>;

// ─── Gastronomia ──────────────────────────────────────────────────────────────
export interface Gastronomia {
  id: string;
  nome: string;
  telefone: string;
  instagram?: string | null;
  endereco: string;
  especialidade?: string | null;
  cnpj: string;
  responsavelNome: string;
  responsavelCpf: string;
  documentoPdfUrl: string;
  logoUrl: string;
  status: StatusEstabelecimento;
  usuarioId: string;
  usuario?: Pick<User, "id" | "nome" | "email" | "perfil">;
  createdAt?: string;
  updatedAt?: string;
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

export interface UpdateGastronomiaDto extends Partial<CreateGastronomiaDto> {
  status?: StatusEstabelecimento;
}

// ─── Hospedagem ───────────────────────────────────────────────────────────────
export interface Hospedagem {
  id: string;
  nome: string;
  telefone: string;
  instagram?: string | null;
  endereco: string;
  textoDiferencial: string;
  cnpj: string;
  responsavelNome: string;
  responsavelCpf: string;
  documentoPdfUrl: string;
  logoUrl: string;
  status: StatusEstabelecimento;
  usuarioId: string;
  /** Campo adicionado no backend (commit feat: add Tags Hospedagem).
   *  O Prisma salva como Json — o backend pode retornar string[] ou JSON string. */
  tags?: string[] | null;
  usuario?: Pick<User, "id" | "nome" | "email" | "perfil">;
  createdAt?: string;
  updatedAt?: string;
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
  /** Tags de comodidades — serializado como JSON.stringify(string[]) no FormData */
  tags?: string[];
}

export interface UpdateHospedagemDto extends Partial<CreateHospedagemDto> {
  status?: StatusEstabelecimento;
}

// ─── Serviço Turista ──────────────────────────────────────────────────────────────
export interface ServicoTurista {
  id: string;
  tipo: TipoServicoTurista;
  nome: string;
  telefone: string;
  instagram?: string | null;
  descricao?: string | null;
  endereco?: string | null;
  cnpj?: string | null;
  roteiro?: TipoRoteiro | null;
  idiomas?: string | null;
  logoUrl?: string | null;
  fotoUrl?: string | null;
  status: StatusEstabelecimento;
  usuarioId: string;
  usuario?: Pick<User, "id" | "nome" | "email" | "perfil">;
  /**
   * URL do comprovante Cadastur (PDF ou imagem .webp).
   * Obrigatório para todos os tipos exceto ESPORTE_LAZER.
   * Adicionado no commit: Comprovante OK para todos (08/06/2026)
   */
  comprovanteUrl?: string | null;
  /**
   * Data de validade do Cadastur.
   * Apenas ADMIN pode alterar via update.
   * Adicionado no commit: adicionado data de validade (08/06/2026)
   */
  validade?: string | null; // ISO date string "YYYY-MM-DD" ou datetime completo
  createdAt?: string;
  updatedAt?: string;
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
  /** Enviado via FormData como field 'comprovante' (File). Não enviado como string. */
  comprovanteUrl?: string;
  /** Enviado como string "YYYY-MM-DD" no FormData. Só admin pode alterar em updates. */
  validade?: string;
}

export interface UpdateServicoTuristaDto
  extends Partial<CreateServicoTuristaDto> {
  status?: StatusEstabelecimento;
}

// ─── Plano de Viagem ───────────────────────────────────────────────────────────────
export interface PlanoViagem {
  id: string;
  titulo: string;
  dataInicio: string;
  dataFim: string;
  usuarioId: string;
  usuario?: Pick<User, "id" | "nome" | "email">;
  itens?: ItemPlanoViagem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePlanoViagemDto {
  titulo: string;
  dataInicio: string;
  dataFim: string;
  usuarioId: string;
}

export type UpdatePlanoViagemDto = Partial<CreatePlanoViagemDto>;

// ─── Item Plano Viagem ──────────────────────────────────────────────────────────────
export interface ItemPlanoViagem {
  id: string;
  dataHoraAgendada: string;
  anotacao?: string | null;
  planoViagemId: string;
  planoViagem?: Pick<PlanoViagem, "id" | "titulo">;

  gastronomiaId?: string | null;
  gastronomia?: Pick<Gastronomia, "id" | "nome" | "endereco" | "logoUrl"> | null;

  hospedagemId?: string | null;
  hospedagem?: Pick<Hospedagem, "id" | "nome" | "endereco" | "logoUrl"> | null;

  eventoId?: string | null;
  evento?: Pick<Evento, "id" | "titulo" | "data" | "local"> | null;

  atividadeId?: string | null;
  atividade?: Pick<Atividade, "id" | "titulo" | "local" | "roteiro"> | null;

  servicoTuristaId?: string | null;
  servicoTurista?: Pick<ServicoTurista, "id" | "nome" | "tipo" | "logoUrl"> | null;

  createdAt?: string;
  updatedAt?: string;
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

// ─── Cat ────────────────────────────────────────────────────────────────────
/**
 * Modelo CAT atualizado (commit: add vídeo no CAT — 08/06/2026)
 * - arquivoUrl removido
 * - imagensUrl: array de URLs de imagens (.webp convertidas pelo backend)
 * - videoUrl: URL do vídeo original (.mp4, .mov etc.) — opcional
 */
export interface Cat {
  id: string;
  texto: string;
  imagensUrl: string[];
  videoUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCatDto {
  texto: string;
  /** Não enviado diretamente — imagens e vídeo chegam via FormData fields */
  imagensUrl?: string[];
  videoUrl?: string | null;
}

export type UpdateCatDto = Partial<CreateCatDto>;

// ─── Evento Principal ──────────────────────────────────────────────────────────────
export interface EventoPrincipal {
  id: string;
  titulo: string;
  etapa?: string | null;
  data: string; // ISO datetime
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEventoPrincipalDto {
  titulo: string;
  etapa?: string;
  data: string;
}

export type UpdateEventoPrincipalDto = Partial<CreateEventoPrincipalDto>;
