-- Add professor_tag column to perfis_usuarios for approval requests
ALTER TABLE perfis_usuarios 
ADD COLUMN IF NOT EXISTS professor_tag VARCHAR(100) UNIQUE;

-- Add university_tag column to universidades for common user approval
ALTER TABLE universidades 
ADD COLUMN IF NOT EXISTS university_tag VARCHAR(100) UNIQUE;

-- Create notificacoes table
CREATE TABLE IF NOT EXISTS notificacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES perfis_usuarios(id) ON DELETE CASCADE NOT NULL,
  tipo VARCHAR(50) NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  mensagem TEXT NOT NULL,
  link TEXT,
  lida BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario ON notificacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON notificacoes(lida);

-- Add approval_tag column to documentos for tracking which tag was used
ALTER TABLE documentos 
ADD COLUMN IF NOT EXISTS approval_tag VARCHAR(100);

-- Add approval_request_status for tracking approval workflow
ALTER TABLE documentos 
ADD COLUMN IF NOT EXISTS approval_request_status VARCHAR(50) DEFAULT 'pending';
