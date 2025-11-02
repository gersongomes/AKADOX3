-- Create approval requests table for students requesting professor/director approval
CREATE TABLE IF NOT EXISTS solicitacoes_aprovacao (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solicitante_id UUID NOT NULL REFERENCES perfis_usuarios(id) ON DELETE CASCADE,
  aprovador_id UUID NOT NULL REFERENCES perfis_usuarios(id) ON DELETE CASCADE,
  documento_id UUID REFERENCES documentos(id) ON DELETE SET NULL,
  mensagem TEXT,
  tag_usada VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(solicitante_id, aprovador_id, status)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_solicitacoes_aprovacao_solicitante ON solicitacoes_aprovacao(solicitante_id);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_aprovacao_aprovador ON solicitacoes_aprovacao(aprovador_id);
CREATE INDEX IF NOT EXISTS idx_solicitacoes_aprovacao_status ON solicitacoes_aprovacao(status);

-- Add nota and feedback columns to documentos if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documentos' AND column_name = 'nota'
  ) THEN
    ALTER TABLE documentos ADD COLUMN nota DECIMAL(4,2) CHECK (nota >= 0 AND nota <= 20);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documentos' AND column_name = 'feedback'
  ) THEN
    ALTER TABLE documentos ADD COLUMN feedback TEXT;
  END IF;
END $$;
