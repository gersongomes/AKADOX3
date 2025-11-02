export const DOCUMENT_TYPES = {
  apontamento: "Apontamentos",
  exame: "Exames",
  trabalho: "Trabalhos",
  projeto: "Projetos",
  outro: "Outro",
} as const

export const ACADEMIC_YEARS = ["2024/2025", "2023/2024", "2022/2023", "2021/2022", "2020/2021"] as const

export const UNIVERSITIES = [
  { id: "us", nome: "Universidade de Santiago", sigla: "US" },
  { id: "unicv", nome: "Universidade de Cabo Verde", sigla: "Uni-CV" },
  { id: "unipiaget", nome: "Universidade Jean Piaget", sigla: "UniPiaget" },
  { id: "iscee", nome: "Instituto Superior de Ciências Económicas", sigla: "ISCEE" },
  { id: "ulcv", nome: "Universidade Lusófona", sigla: "ULCV" },
] as const

export const POINTS_CONFIG = {
  UPLOAD_APPROVED: 50,
  UPLOAD_RATED_5: 20,
  UPLOAD_RATED_4: 15,
  UPLOAD_RATED_3: 10,
  COMMENT_RECEIVED: 5,
  DOWNLOAD: 2,
} as const

export const BADGE_LEVELS = {
  BRONZE: { min: 0, max: 100, name: "Bronze" },
  PRATA: { min: 101, max: 500, name: "Prata" },
  OURO: { min: 501, max: 1000, name: "Ouro" },
  DIAMANTE: { min: 1001, max: Number.POSITIVE_INFINITY, name: "Diamante" },
} as const
