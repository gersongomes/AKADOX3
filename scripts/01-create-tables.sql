-- Criar tabelas para o Repositório Universitário de Cabo Verde

-- Tabela de universidades
CREATE TABLE IF NOT EXISTS universidades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo VARCHAR(10) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  logo_url TEXT,
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de cursos
CREATE TABLE IF NOT EXISTS cursos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  universidade_id UUID REFERENCES universidades(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  codigo VARCHAR(20) NOT NULL,
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de disciplinas
CREATE TABLE IF NOT EXISTS disciplinas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  curso_id UUID REFERENCES cursos(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  codigo VARCHAR(20) NOT NULL,
  ano_letivo INTEGER NOT NULL,
  semestre INTEGER CHECK (semestre IN (1, 2)),
  creditos INTEGER DEFAULT 0,
  ativa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Estender a tabela de usuários do Supabase com perfis personalizados
CREATE TABLE IF NOT EXISTS perfis_usuarios (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  nome_completo VARCHAR(255) NOT NULL,
  tipo_usuario VARCHAR(50) CHECK (tipo_usuario IN ('pessoa_comum', 'aluno', 'professor', 'diretor', 'admin')) NOT NULL,
  universidade_id UUID REFERENCES universidades(id),
  curso_id UUID REFERENCES cursos(id),
  ano_ingresso INTEGER,
  pontos INTEGER DEFAULT 0,
  nivel INTEGER DEFAULT 1,
  avatar_url TEXT,
  bio TEXT,
  ativo BOOLEAN DEFAULT true,
  aprovado BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de arquivos/documentos
CREATE TABLE IF NOT EXISTS documentos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descricao TEXT,
  tipo_arquivo VARCHAR(50) NOT NULL,
  tamanho_arquivo BIGINT,
  url_arquivo TEXT NOT NULL,
  thumbnail_url TEXT,
  universidade_id UUID REFERENCES universidades(id),
  curso_id UUID REFERENCES cursos(id),
  disciplina_id UUID REFERENCES disciplinas(id),
  autor_id UUID REFERENCES perfis_usuarios(id) ON DELETE CASCADE,
  ano_publicacao INTEGER NOT NULL,
  tags TEXT[],
  categoria VARCHAR(100),
  confidencial BOOLEAN DEFAULT false,
  aprovado BOOLEAN DEFAULT false,
  aprovado_por UUID REFERENCES perfis_usuarios(id),
  aprovado_em TIMESTAMP WITH TIME ZONE,
  downloads INTEGER DEFAULT 0,
  visualizacoes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de avaliações
CREATE TABLE IF NOT EXISTS avaliacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  documento_id UUID REFERENCES documentos(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES perfis_usuarios(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comentario TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(documento_id, usuario_id)
);

-- Tabela de comentários
CREATE TABLE IF NOT EXISTS comentarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  documento_id UUID REFERENCES documentos(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES perfis_usuarios(id) ON DELETE CASCADE,
  comentario_pai_id UUID REFERENCES comentarios(id),
  conteudo TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  dislikes INTEGER DEFAULT 0,
  aprovado BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de favoritos
CREATE TABLE IF NOT EXISTS favoritos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES perfis_usuarios(id) ON DELETE CASCADE,
  documento_id UUID REFERENCES documentos(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(usuario_id, documento_id)
);

-- Tabela de badges/conquistas
CREATE TABLE IF NOT EXISTS badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT NOT NULL,
  icone VARCHAR(100) NOT NULL,
  cor VARCHAR(50) NOT NULL,
  raridade VARCHAR(20) CHECK (raridade IN ('bronze', 'prata', 'ouro', 'diamante')) NOT NULL,
  pontos_necessarios INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de badges dos usuários
CREATE TABLE IF NOT EXISTS usuario_badges (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES perfis_usuarios(id) ON DELETE CASCADE,
  badge_id UUID REFERENCES badges(id) ON DELETE CASCADE,
  conquistado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(usuario_id, badge_id)
);

-- Tabela de relatórios
CREATE TABLE IF NOT EXISTS relatorios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES perfis_usuarios(id) ON DELETE CASCADE,
  documento_id UUID REFERENCES documentos(id),
  comentario_id UUID REFERENCES comentarios(id),
  tipo_relatorio VARCHAR(50) CHECK (tipo_relatorio IN ('spam', 'conteudo_inadequado', 'violacao_direitos', 'outro')) NOT NULL,
  descricao TEXT NOT NULL,
  status VARCHAR(20) CHECK (status IN ('pendente', 'analisando', 'resolvido', 'rejeitado')) DEFAULT 'pendente',
  resolvido_por UUID REFERENCES perfis_usuarios(id),
  resolvido_em TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_documentos_universidade ON documentos(universidade_id);
CREATE INDEX IF NOT EXISTS idx_documentos_curso ON documentos(curso_id);
CREATE INDEX IF NOT EXISTS idx_documentos_disciplina ON documentos(disciplina_id);
CREATE INDEX IF NOT EXISTS idx_documentos_autor ON documentos(autor_id);
CREATE INDEX IF NOT EXISTS idx_documentos_aprovado ON documentos(aprovado);
CREATE INDEX IF NOT EXISTS idx_perfis_universidade ON perfis_usuarios(universidade_id);
CREATE INDEX IF NOT EXISTS idx_perfis_tipo ON perfis_usuarios(tipo_usuario);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_documento ON avaliacoes(documento_id);
CREATE INDEX IF NOT EXISTS idx_comentarios_documento ON comentarios(documento_id);
CREATE INDEX IF NOT EXISTS idx_favoritos_usuario ON favoritos(usuario_id);
