-- Create seguidores (followers) table
CREATE TABLE IF NOT EXISTS seguidores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seguidor_id UUID NOT NULL REFERENCES perfis_usuarios(id) ON DELETE CASCADE,
  seguido_id UUID NOT NULL REFERENCES perfis_usuarios(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(seguidor_id, seguido_id),
  CHECK (seguidor_id != seguido_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_seguidores_seguidor ON seguidores(seguidor_id);
CREATE INDEX IF NOT EXISTS idx_seguidores_seguido ON seguidores(seguido_id);

-- Add professor and diretor tags to perfis_usuarios
ALTER TABLE perfis_usuarios 
ADD COLUMN IF NOT EXISTS tag_aprovacao VARCHAR(50) UNIQUE;

-- Create index on tag
CREATE INDEX IF NOT EXISTS idx_perfis_tag ON perfis_usuarios(tag_aprovacao);
