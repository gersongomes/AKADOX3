-- Create notifications table
CREATE TABLE IF NOT EXISTS notificacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES perfis_usuarios(id) ON DELETE CASCADE NOT NULL,
  tipo VARCHAR(50) NOT NULL, -- 'avaliacao', 'aprovacao', 'comentario', 'badge', 'sistema'
  titulo VARCHAR(255) NOT NULL,
  mensagem TEXT NOT NULL,
  link TEXT,
  lida BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create private grades table (professor to student evaluations)
CREATE TABLE IF NOT EXISTS avaliacoes_privadas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  documento_id UUID REFERENCES documentos(id) ON DELETE CASCADE NOT NULL,
  aluno_id UUID REFERENCES perfis_usuarios(id) ON DELETE CASCADE NOT NULL,
  professor_id UUID REFERENCES perfis_usuarios(id) ON DELETE CASCADE NOT NULL,
  nota DECIMAL(4,2) CHECK (nota >= 0 AND nota <= 20) NOT NULL,
  comentario_privado TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(documento_id, aluno_id, professor_id)
);

-- Add professor_responsavel_id to documentos table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documentos' AND column_name = 'professor_responsavel_id'
  ) THEN
    ALTER TABLE documentos ADD COLUMN professor_responsavel_id UUID REFERENCES perfis_usuarios(id);
  END IF;
END $$;

-- Add status column to perfis_usuarios if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'perfis_usuarios' AND column_name = 'status'
  ) THEN
    ALTER TABLE perfis_usuarios ADD COLUMN status VARCHAR(50) DEFAULT 'active';
  END IF;
END $$;

-- Add aprovado_por and aprovado_em columns if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'perfis_usuarios' AND column_name = 'aprovado_por'
  ) THEN
    ALTER TABLE perfis_usuarios ADD COLUMN aprovado_por UUID REFERENCES perfis_usuarios(id);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'perfis_usuarios' AND column_name = 'aprovado_em'
  ) THEN
    ALTER TABLE perfis_usuarios ADD COLUMN aprovado_em TIMESTAMP WITH TIME ZONE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'perfis_usuarios' AND column_name = 'motivo_rejeicao'
  ) THEN
    ALTER TABLE perfis_usuarios ADD COLUMN motivo_rejeicao TEXT;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario ON notificacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON notificacoes(lida);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_privadas_aluno ON avaliacoes_privadas(aluno_id);
CREATE INDEX IF NOT EXISTS idx_avaliacoes_privadas_professor ON avaliacoes_privadas(professor_id);
CREATE INDEX IF NOT EXISTS idx_documentos_professor_responsavel ON documentos(professor_responsavel_id);
