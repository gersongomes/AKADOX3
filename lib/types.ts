// Database types for Supabase tables
export type UserType = "admin" | "diretor" | "professor" | "aluno" | "pessoa_comum"

export interface UserProfile {
  id: string
  nome_completo: string
  email: string
  avatar_url?: string
  tipo_usuario: UserType
  universidade_id?: string
  curso?: string
  pontos: number
  nivel: number
  created_at: string
  updated_at: string
  tag_aprovacao?: string // Tag for approval requests
}

export interface Document {
  id: string
  titulo: string
  descricao?: string
  tipo_documento: "apontamento" | "exame" | "trabalho" | "projeto" | "outro"
  disciplina: string
  curso: string
  universidade_id: string
  ano_academico: string
  autor_id: string
  file_url: string
  file_name: string
  file_size: number
  downloads: number
  visualizacoes: number
  avaliacao_media: number
  total_avaliacoes: number
  status: "pendente" | "aprovado" | "rejeitado"
  aprovado_por?: string
  nota?: number // Grade from professor (0-20)
  feedback?: string // Feedback from professor
  tags?: string[]
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  usuario_id: string
  tipo: "comentario" | "avaliacao" | "badge" | "pontos" | "aprovacao" | "nota" | "seguidor"
  titulo: string
  mensagem: string
  link?: string
  lida: boolean
  created_at: string
}

export interface Badge {
  id: string
  nome: string
  descricao: string
  icone: string
  requisito_pontos: number
}

export interface UserBadge {
  id: string
  usuario_id: string
  badge_id: string
  conquistado_em: string
}

export interface Follow {
  id: string
  seguidor_id: string
  seguindo_id: string
  created_at: string
}

export interface Favorite {
  id: string
  usuario_id: string
  documento_id: string
  created_at: string
}

export interface Comment {
  id: string
  documento_id: string
  usuario_id: string
  conteudo: string
  created_at: string
}

export interface Rating {
  id: string
  documento_id: string
  usuario_id: string
  estrelas: number // 1-5
  created_at: string
}

export interface ApprovalRequest {
  id: string
  documento_id: string
  solicitante_id: string
  aprovador_id: string
  tipo_aprovador: "professor" | "diretor"
  status: "pendente" | "aprovado" | "rejeitado"
  tag_usada?: string
  created_at: string
  updated_at: string
}

export interface UniversityRequest {
  id: string
  usuario_id: string
  universidade_id: string
  status: "pendente" | "aprovado" | "rejeitado"
  mensagem?: string
  created_at: string
  updated_at: string
}

export interface University {
  id: string
  nome: string
  sigla: string
  logo_url?: string
  created_at: string
}
