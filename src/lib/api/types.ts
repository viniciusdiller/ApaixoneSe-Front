// ─── Enums ────────────────────────────────────────────────────────────────────
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

// ─── Users ────────────────────────────────────────────────────────────────────
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
  logoUrl?: string | null;
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
  logoUrl?: string;
}

export type UpdateAtividadeDto = Partial<CreateAtividadeDto>;

// ─── Eventos ──────────────────────────────────────────────────────────────────
export interface Evento {
  id: string;
  titulo: string;
  descricao: string;
  data: string;
  local: string;
  endereco?: string | null;
  fotoUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEventoDto {
  titulo: string;
  descricao: string;
  data: string;
  local: string;
  endereco?: string;
  fotoUrl?: string;
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
  validade?: string | null;
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
  validade?: string | null;
}

// ─── Hospedagem ───────────────────────────────────────────────────────────────
export interface Hospedagem {
  id: string;
  nome: string;
  telefone: string;
  instagram?: string | null;
  site?: string | null;
  endereco: string;
  textoDiferencial: string;
  cnpj: string;
  responsavelNome: string;
  responsavelCpf: string;
  documentoPdfUrl: string;
  logoUrl: string;
  status: StatusEstabelecimento;
  usuarioId: string;
  tags?: string[] | null;
  usuario?: Pick<User, "id" | "nome" | "email" | "perfil">;
  validade?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateHospedagemDto {
  nome: string;
  telefone: string;
  instagram?: string;
  site?: string;
  endereco: string;
  textoDiferencial: string;
  cnpj: string;
  responsavelNome: string;
  responsavelCpf: string;
  documentoPdfUrl: string;
  logoUrl: string;
  usuarioId: string;
  tags?: string[];
}

export interface UpdateHospedagemDto extends Partial<CreateHospedagemDto> {
  status?: StatusEstabelecimento;
  validade?: string | null;
}

// ─── Serviço Turista ──────────────────────────────────────────────────────────
export interface ServicoTurista {
  id: string;
  tipo: TipoServicoTurista;
  nome: string;
  telefone: string;
  instagram?: string | null;
  site?: string | null;
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
  comprovanteUrl?: string | null;
  validade?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateServicoTuristaDto {
  tipo: TipoServicoTurista;
  nome: string;
  telefone: string;
  instagram?: string;
  site?: string;
  descricao?: string;
  endereco?: string;
  cnpj?: string;
  roteiro?: TipoRoteiro;
  idiomas?: string;
  logoUrl?: string;
  fotoUrl?: string;
  usuarioId: string;
  comprovanteUrl?: string;
  validade?: string;
}

export interface UpdateServicoTuristaDto extends Partial<CreateServicoTuristaDto> {
  status?: StatusEstabelecimento;
}

// ─── Plano de Viagem ──────────────────────────────────────────────────────────
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

// ─── Item Plano Viagem ────────────────────────────────────────────────────────
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

// ─── Cat ──────────────────────────────────────────────────────────────────────
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
  imagensUrl?: string[];
  videoUrl?: string | null;
}

export type UpdateCatDto = Partial<CreateCatDto>;

// ─── CatMovel ─────────────────────────────────────────────────────────────────
/**
 * Shape real retornado pelo backend em GET /cat-movel.
 * Para derivar a mídia ativa, use catMovelMidia() de @/lib/catMovelMidia.
 */
export interface CatMovel {
  id: string;
  titulo: string;
  descricao: string;
  /** URL da imagem (WebP) — exclusivo com videoUrl */
  imagemUrl?: string | null;
  /** URL do vídeo — exclusivo com imagemUrl */
  videoUrl?: string | null;
  /** Galeria de imagens exibida em carrossel ao lado da mídia principal */
  imagensUrl?: string[] | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCatMovelDto {
  titulo: string;
  descricao: string;
}

export type UpdateCatMovelDto = Partial<CreateCatMovelDto>;

// ─── FiquePorDentro ───────────────────────────────────────────────────────────
export interface FiquePorDentro {
  id: string;
  ordem: string;
  imagemUrl: string;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Evento Principal ─────────────────────────────────────────────────────────
export interface EventoPrincipal {
  id: string;
  titulo: string;
  etapa?: string | null;
  data: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEventoPrincipalDto {
  titulo: string;
  etapa?: string;
  data: string;
}

export type UpdateEventoPrincipalDto = Partial<CreateEventoPrincipalDto>;

// ─── Visitas ──────────────────────────────────────────────────────────────────
export interface MinhasVisitas {
  gastronomias: string[];
  atividades: string[];
}

export interface ToggleVisitaResponse {
  status: "adicionado" | "removido";
}

// ─── Casa de Câmbio ───────────────────────────────────────────────────────────
export interface CasaDeCambio {
  id: string;
  nome: string;
  telefone: string;
  instagram?: string | null;
  site?: string | null;
  endereco: string;
  descricao?: string | null;
  cnpj?: string | null;
  moedas?: string | null;
  logoUrl?: string | null;
  fotoUrl?: string | null;
  status: StatusEstabelecimento;
  usuarioId: string;
  usuario?: Pick<User, "id" | "nome" | "email" | "perfil">;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCasaDeCambioDto {
  nome: string;
  telefone: string;
  instagram?: string;
  site?: string;
  endereco: string;
  descricao?: string;
  cnpj?: string;
  moedas?: string;
  logoUrl?: string;
  fotoUrl?: string;
  usuarioId: string;
}

export interface UpdateCasaDeCambioDto extends Partial<CreateCasaDeCambioDto> {
  status?: StatusEstabelecimento;
}

// ─── Secretaria de Turismo ────────────────────────────────────────────────────
export interface SecretariaTurismo {
  id: string;
  textoExplicativo: string;
  videoUrl?: string | null;
  /** Prisma retorna `turistandos` (plural) — use sempre este nome */
  turistandos?: Turistando[];
  projetos?: Projeto[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateSecretariaTurismoDto {
  textoExplicativo: string;
  videoUrl?: string | null;
}

export type UpdateSecretariaTurismoDto = Partial<CreateSecretariaTurismoDto>;

// ─── Turistando ───────────────────────────────────────────────────────────────
export interface Turistando {
  id: string;
  titulo: string;
  texto: string;
  imagensUrl: string[];
  secretariaId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTuristandoDto {
  titulo: string;
  texto: string;
}

export type UpdateTuristandoDto = Partial<CreateTuristandoDto>;

// ─── Projeto ──────────────────────────────────────────────────────────────────
export interface Projeto {
  id: string;
  titulo: string;
  descricao: string;
  imagemUrl?: string | null;
  secretariaId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProjetoDto {
  titulo: string;
  descricao: string;
}

export type UpdateProjetoDto = Partial<CreateProjetoDto>;

// ─── Praias e Lagoas ────────────────────────────────────────────────────────
export type TipoPontoAgua = "PRAIA" | "LAGOA";

export interface PontoAgua {
  id: string;
  tipo: TipoPontoAgua;
  nome: string;
  slug: string;
  descricaoCurta: string;
  descricao: string;
  imagemUrl?: string | null;
  filtros?: string[] | null;
  acessivel: boolean;
  dificuldade?: string | null;
  estacionamento: boolean;
  quiosques: boolean;
  endereco?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePontoAguaDto {
  tipo: TipoPontoAgua;
  nome: string;
  descricaoCurta: string;
  descricao: string;
  filtros?: string[];
  acessivel?: boolean;
  dificuldade?: string;
  estacionamento?: boolean;
  quiosques?: boolean;
  endereco?: string;
  latitude?: number;
  longitude?: number;
}

export type UpdatePontoAguaDto = Partial<CreatePontoAguaDto>;

// ─── Cultura ──────────────────────────────────────────────────────────────────
export interface LocalCultural {
  id: string;
  nome: string;
  descricao: string;
  texto: string;
  imagemUrl?: string | null;
  endereco?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateLocalCulturalDto {
  nome: string;
  descricao: string;
  texto: string;
  endereco?: string;
}

export type UpdateLocalCulturalDto = Partial<CreateLocalCulturalDto>;
