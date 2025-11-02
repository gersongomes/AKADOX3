-- Migration script for approval system enhancements
-- This script adds necessary fields and indexes for the approval workflow

-- Add approval-related columns if they don't exist
DO $$ 
BEGIN
    -- Add status column for tracking approval states
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'perfis_usuarios' AND column_name = 'status') THEN
        ALTER TABLE perfis_usuarios ADD COLUMN status VARCHAR(50) DEFAULT 'active' 
        CHECK (status IN ('active', 'pending_approval', 'suspended', 'rejected'));
    END IF;

    -- Add approved_by column to track who approved the user
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'perfis_usuarios' AND column_name = 'aprovado_por') THEN
        ALTER TABLE perfis_usuarios ADD COLUMN aprovado_por UUID REFERENCES perfis_usuarios(id);
    END IF;

    -- Add approved_at timestamp
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'perfis_usuarios' AND column_name = 'aprovado_em') THEN
        ALTER TABLE perfis_usuarios ADD COLUMN aprovado_em TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Add rejection reason for audit trail
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'perfis_usuarios' AND column_name = 'motivo_rejeicao') THEN
        ALTER TABLE perfis_usuarios ADD COLUMN motivo_rejeicao TEXT;
    END IF;
END $$;

-- Create approval requests table for better tracking
CREATE TABLE IF NOT EXISTS pedidos_aprovacao (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID REFERENCES perfis_usuarios(id) ON DELETE CASCADE,
    tipo_pedido VARCHAR(50) NOT NULL CHECK (tipo_pedido IN ('diretor', 'admin', 'upgrade')),
    status VARCHAR(50) DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
    solicitado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processado_em TIMESTAMP WITH TIME ZONE,
    processado_por UUID REFERENCES perfis_usuarios(id),
    observacoes TEXT,
    dados_adicionais JSONB -- For storing additional request data
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_perfis_status ON perfis_usuarios(status);
CREATE INDEX IF NOT EXISTS idx_perfis_aprovado ON perfis_usuarios(aprovado);
CREATE INDEX IF NOT EXISTS idx_perfis_tipo_aprovado ON perfis_usuarios(tipo_usuario, aprovado);
CREATE INDEX IF NOT EXISTS idx_pedidos_status ON pedidos_aprovacao(status);
CREATE INDEX IF NOT EXISTS idx_pedidos_tipo ON pedidos_aprovacao(tipo_pedido);
CREATE INDEX IF NOT EXISTS idx_pedidos_usuario ON pedidos_aprovacao(usuario_id);

-- Update existing users to have proper status
UPDATE perfis_usuarios 
SET status = CASE 
    WHEN tipo_usuario IN ('diretor', 'admin') AND aprovado = false THEN 'pending_approval'
    WHEN tipo_usuario = 'pessoa_comum' AND aprovado = false THEN 'pending_approval'
    ELSE 'active'
END
WHERE status IS NULL OR status = 'active';

-- Make trigger function run with elevated privileges to bypass RLS
CREATE OR REPLACE FUNCTION create_approval_request()
RETURNS TRIGGER 
SECURITY DEFINER -- This allows the function to bypass RLS
SET search_path = public
AS $$
BEGIN
    -- Create approval request for director and admin users
    IF NEW.tipo_usuario IN ('diretor', 'admin') AND NEW.aprovado = false THEN
        INSERT INTO pedidos_aprovacao (usuario_id, tipo_pedido, dados_adicionais)
        VALUES (
            NEW.id, 
            NEW.tipo_usuario,
            jsonb_build_object(
                'nome', NEW.nome_completo,
                'email', NEW.email,
                'universidade_id', NEW.universidade_id,
                'created_at', NEW.created_at
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically create approval requests
DROP TRIGGER IF EXISTS trigger_create_approval_request ON perfis_usuarios;
CREATE TRIGGER trigger_create_approval_request
    AFTER INSERT ON perfis_usuarios
    FOR EACH ROW
    EXECUTE FUNCTION create_approval_request();

-- Create function to update approval status
CREATE OR REPLACE FUNCTION update_approval_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update user profile when approval request is processed
    IF NEW.status != OLD.status AND NEW.status IN ('aprovado', 'rejeitado') THEN
        UPDATE perfis_usuarios 
        SET 
            aprovado = (NEW.status = 'aprovado'),
            status = CASE 
                WHEN NEW.status = 'aprovado' THEN 'active'
                ELSE 'rejected'
            END,
            aprovado_por = NEW.processado_por,
            aprovado_em = NEW.processado_em,
            updated_at = NOW()
        WHERE id = NEW.usuario_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to sync approval status
DROP TRIGGER IF EXISTS trigger_update_approval_status ON pedidos_aprovacao;
CREATE TRIGGER trigger_update_approval_status
    AFTER UPDATE ON pedidos_aprovacao
    FOR EACH ROW
    EXECUTE FUNCTION update_approval_status();

-- Add RLS (Row Level Security) policies for approval system
ALTER TABLE pedidos_aprovacao ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own approval requests
CREATE POLICY "Users can view own approval requests" ON pedidos_aprovacao
    FOR SELECT USING (usuario_id = auth.uid());

-- Policy: Admins can view and manage all approval requests
CREATE POLICY "Admins can manage all approval requests" ON pedidos_aprovacao
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM perfis_usuarios 
            WHERE id = auth.uid() 
            AND tipo_usuario = 'admin'
            AND aprovado = true
        )
    );

-- Add policy to allow trigger function to insert (SECURITY DEFINER handles this)
-- No additional policy needed since SECURITY DEFINER bypasses RLS

-- Add helpful views for admin dashboard
CREATE OR REPLACE VIEW vw_pending_approvals AS
SELECT 
    p.id,
    p.email,
    p.nome_completo,
    p.tipo_usuario,
    p.universidade_id,
    p.created_at,
    p.aprovado,
    p.status,
    pa.id as pedido_id,
    pa.solicitado_em,
    pa.observacoes
FROM perfis_usuarios p
LEFT JOIN pedidos_aprovacao pa ON p.id = pa.usuario_id
WHERE p.tipo_usuario IN ('diretor', 'admin') 
AND p.aprovado = false 
AND p.status = 'pending_approval'
ORDER BY p.created_at DESC;

-- Create view for approval statistics
CREATE OR REPLACE VIEW vw_approval_stats AS
SELECT 
    COUNT(*) FILTER (WHERE status = 'pendente') as pendentes,
    COUNT(*) FILTER (WHERE status = 'aprovado') as aprovados,
    COUNT(*) FILTER (WHERE status = 'rejeitado') as rejeitados,
    COUNT(*) as total
FROM pedidos_aprovacao;

-- Grant necessary permissions
GRANT SELECT ON vw_pending_approvals TO authenticated;
GRANT SELECT ON vw_approval_stats TO authenticated;
GRANT SELECT, INSERT, UPDATE ON pedidos_aprovacao TO authenticated;

-- Add comments for documentation
COMMENT ON TABLE pedidos_aprovacao IS 'Tabela para rastrear pedidos de aprovação de utilizadores especiais';
COMMENT ON COLUMN pedidos_aprovacao.tipo_pedido IS 'Tipo de pedido: diretor, admin, ou upgrade';
COMMENT ON COLUMN pedidos_aprovacao.dados_adicionais IS 'Dados JSON com informações adicionais do pedido';
COMMENT ON VIEW vw_pending_approvals IS 'Vista para aprovações pendentes com dados do utilizador';
COMMENT ON VIEW vw_approval_stats IS 'Estatísticas de aprovações para dashboard administrativo';
