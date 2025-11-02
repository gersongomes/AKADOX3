-- Create contact messages table
CREATE TABLE IF NOT EXISTS mensagens_contacto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  lida BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add RLS policies
ALTER TABLE mensagens_contacto ENABLE ROW LEVEL SECURITY;

-- Users can insert their own messages
CREATE POLICY "Users can insert their own contact messages"
  ON mensagens_contacto
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = usuario_id);

-- Users can view their own messages
CREATE POLICY "Users can view their own contact messages"
  ON mensagens_contacto
  FOR SELECT
  TO authenticated
  USING (auth.uid() = usuario_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_mensagens_contacto_usuario ON mensagens_contacto(usuario_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_contacto_created ON mensagens_contacto(created_at DESC);
