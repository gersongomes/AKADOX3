-- Inserir dados iniciais

-- Inserir universidades de Cabo Verde
INSERT INTO universidades (codigo, nome, descricao, ativa) VALUES
('US', 'Universidade de Santiago', 'Principal universidade de Cabo Verde, localizada em Santiago', true),
('UNICV', 'Universidade de Cabo Verde', 'Universidade pública nacional de Cabo Verde', true),
('UTA', 'Universidade Técnica do Atlântico', 'Universidade técnica especializada', true),
('ISCEE', 'Instituto Superior de Ciências Económicas e Empresariais', 'Instituto de ensino superior em economia e gestão', true),
('ISE', 'Instituto Superior de Educação', 'Instituto de formação de professores', true),
('ISECMAR', 'Instituto Superior de Engenharia e Ciências do Mar', 'Instituto especializado em ciências marítimas', true)
ON CONFLICT (codigo) DO NOTHING;

-- Inserir cursos exemplo para US
INSERT INTO cursos (universidade_id, nome, codigo) 
SELECT u.id, 'Engenharia Informática', 'EI'
FROM universidades u WHERE u.codigo = 'US'
ON CONFLICT DO NOTHING;

INSERT INTO cursos (universidade_id, nome, codigo) 
SELECT u.id, 'Gestão e Administração', 'GA'
FROM universidades u WHERE u.codigo = 'US'
ON CONFLICT DO NOTHING;

INSERT INTO cursos (universidade_id, nome, codigo) 
SELECT u.id, 'Direito', 'DIR'
FROM universidades u WHERE u.codigo = 'US'
ON CONFLICT DO NOTHING;

-- Inserir badges do sistema de gamificação
INSERT INTO badges (nome, descricao, icone, cor, raridade, pontos_necessarios) VALUES
('Primeiro Upload', 'Partilhou o primeiro documento', 'Upload', 'bronze', 'bronze', 0),
('Colaborador Ativo', 'Partilhou 10 documentos', 'Star', 'prata', 'prata', 100),
('Especialista', 'Partilhou 50 documentos', 'Award', 'ouro', 'ouro', 500),
('Mestre do Conhecimento', 'Partilhou 100 documentos', 'Crown', 'diamante', 'diamante', 1000),
('Comentador', 'Fez 25 comentários úteis', 'MessageCircle', 'bronze', 'bronze', 50),
('Avaliador', 'Avaliou 50 documentos', 'ThumbsUp', 'prata', 'prata', 150),
('Top Contributor', 'Entre os 10 melhores contribuidores', 'Trophy', 'ouro', 'ouro', 2000)
ON CONFLICT DO NOTHING;
