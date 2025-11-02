-- Create seguidores table for follow system
CREATE TABLE IF NOT EXISTS seguidores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seguidor_id UUID NOT NULL REFERENCES perfis_usuarios(id) ON DELETE CASCADE,
  seguido_id UUID NOT NULL REFERENCES perfis_usuarios(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(seguidor_id, seguido_id),
  CHECK (seguidor_id != seguido_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_seguidores_seguidor ON seguidores(seguidor_id);
CREATE INDEX IF NOT EXISTS idx_seguidores_seguido ON seguidores(seguido_id);

-- Add RLS policies
ALTER TABLE seguidores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all follows" ON seguidores
  FOR SELECT USING (true);

CREATE POLICY "Users can follow others" ON seguidores
  FOR INSERT WITH CHECK (auth.uid() = seguidor_id);

CREATE POLICY "Users can unfollow" ON seguidores
  FOR DELETE USING (auth.uid() = seguidor_id);
