# Diagrama de Sequência - Upload de Documento

Fluxo completo de upload de documento com aprovação baseada no tipo de usuário.

\`\`\`mermaid
sequenceDiagram
    actor User as Utilizador<br/>(Aluno/Professor/Pessoa Comum)
    participant UI as Upload Form<br/>(upload-form.tsx)
    participant Action as uploadFile()<br/>(files.ts)
    participant Auth as Supabase Auth
    participant Storage as Supabase Storage
    participant DB as Supabase Database
    participant Notif as Sistema de<br/>Notificações
    participant Email as Serviço Email
    
    %% Fase 1: Autenticação e Validação
    User->>UI: Acessa /upload
    UI->>Auth: getUser()
    Auth-->>UI: user data
    
    alt Não autenticado
        UI-->>User: Redirect para /login
    end
    
    %% Fase 2: Seleção e Preview do Ficheiro
    User->>UI: Seleciona ficheiro<br/>(drag&drop ou clique)
    UI->>UI: Valida tipo e tamanho<br/>(máx 50MB)
    UI-->>User: Mostra preview
    
    User->>UI: Adiciona thumbnail (opcional)
    UI->>UI: Gera preview da thumbnail
    
    User->>UI: Preenche metadados<br/>(título, descrição, tags, etc.)
    
    alt Aluno ou Pessoa Comum
        User->>UI: Seleciona tag de aprovação<br/>(Professor ou Universidade)
    end
    
    %% Fase 3: Upload e Processamento
    User->>UI: Clica "Carregar"
    UI->>UI: setIsLoading(true)
    UI->>Action: uploadFile(formData)
    
    Action->>Auth: getUser()
    Auth-->>Action: user + session
    
    Action->>DB: SELECT perfil FROM perfis_usuarios<br/>WHERE id = user.id
    DB-->>Action: userProfile (tipo_usuario, universidade_id)
    
    alt Perfil não existe
        Action->>DB: INSERT INTO perfis_usuarios<br/>(id, email, nome, tipo_usuario='pessoa_comum')
        DB-->>Action: Profile criado
    end
    
    %% Upload do Ficheiro Principal
    Action->>Storage: upload('documents', filePath, file)
    Storage-->>Action: publicUrl
    
    %% Upload da Thumbnail (se fornecida)
    alt Thumbnail fornecida
        Action->>Storage: upload('documents', thumbPath, thumbnail)
        Storage-->>Action: thumbnailUrl
    end
    
    %% Obter dados da Universidade
    Action->>DB: SELECT id FROM universidades<br/>WHERE nome = university
    DB-->>Action: universidadeId
    
    %% Determinar Status de Aprovação
    alt userType === 'professor'
        Action->>Action: aprovado = true (Auto-aprovado)
    else userType === 'aluno' OR 'pessoa_comum'
        Action->>Action: aprovado = false (Requer aprovação)
    end
    
    %% Fase 4: Criação do Documento
    Action->>DB: INSERT INTO documentos<br/>(titulo, tipo_arquivo, url_arquivo,<br/>thumbnail_url, autor_id, aprovado, etc.)
    DB-->>Action: document (id, ...)
    
    %% Fase 5: Notificações e Pontos (baseado no tipo de usuário)
    alt userType === 'professor'
        Action->>Notif: createNotification(user.id,<br/>'upload_success', message)
        Notif->>DB: INSERT INTO notificacoes
        DB-->>Notif: OK
        Notif-->>Action: Notificação criada
        
        Note over Action: Professor ganhará 50 pontos<br/>automaticamente via trigger SQL
        
    else userType === 'aluno' AND approvalTag
        Action->>DB: SELECT professor FROM perfis_usuarios<br/>WHERE tag_aprovacao = approvalTag
        DB-->>Action: professor (id, nome_completo)
        
        Action->>DB: UPDATE documentos<br/>SET professor_responsavel_id = professor.id<br/>WHERE id = document.id
        DB-->>Action: OK
        
        par Notificações Paralelas
            Action->>Notif: createNotification(user.id,<br/>'upload_pending', 'Enviado para aprovação')
            Notif->>DB: INSERT INTO notificacoes
            DB-->>Notif: OK
        and
            Action->>Notif: createNotification(professor.id,<br/>'approval_request', 'Novo pedido')
            Notif->>DB: INSERT INTO notificacoes
            DB-->>Notif: OK
            Notif->>Email: sendApprovalRequestEmail(professor)
            Email-->>Notif: Email enviado
        end
        
    else userType === 'pessoa_comum' OR (aluno sem tag)
        Action->>DB: SELECT id, nome FROM universidades<br/>WHERE id = universidadeId
        DB-->>Action: university
        
        Action->>Notif: createNotification(user.id,<br/>'upload_pending', 'Enviado à universidade')
        Notif->>DB: INSERT INTO notificacoes
        DB-->>Notif: OK
        
        Action->>DB: SELECT id FROM perfis_usuarios<br/>WHERE tipo_usuario = 'diretor'<br/>AND universidade_id = universidadeId
        DB-->>Action: directors[]
        
        loop Para cada director
            Action->>Notif: createNotification(director.id,<br/>'approval_request', 'Novo pedido')
            Notif->>DB: INSERT INTO notificacoes
            DB-->>Notif: OK
        end
    end
    
    %% Fase 6: Cache Invalidation
    Action->>Action: revalidatePath('/upload')
    Action->>Action: revalidatePath('/browse')
    
    %% Fase 7: Resposta ao Cliente
    Action-->>UI: { success: true, data: document,<br/>userType, notificationMessage }
    
    UI->>UI: setIsLoading(false)
    UI->>UI: showSuccessToast(message)
    UI->>UI: resetForm()
    UI-->>User: Sucesso! Documento carregado
    
    %% Fluxo de Erro
    alt Erro no upload
        Storage-->>Action: Error
        Action->>Storage: remove(filePath)
        alt Thumbnail foi carregada
            Action->>Storage: remove(thumbPath)
        end
        Action-->>UI: { success: false, error: message }
        UI->>UI: showErrorToast(error)
        UI-->>User: Erro ao carregar ficheiro
    end
\`\`\`

## Casos de Uso por Tipo de Usuário

### 1. Professor Upload (Auto-Aprovado)
\`\`\`
User (Professor) → Upload Form → uploadFile()
    ↓
Supabase Storage (upload ficheiro + thumbnail)
    ↓
Database INSERT (aprovado: true)
    ↓
Notification (upload_success) → Professor
    ↓
SQL Trigger: +50 pontos automaticamente
    ↓
Documento disponível imediatamente em /browse
\`\`\`

### 2. Aluno Upload (Aprovação do Professor)
\`\`\`
User (Aluno) → Upload Form (seleciona tag do professor) → uploadFile()
    ↓
Supabase Storage (upload ficheiro + thumbnail)
    ↓
Database INSERT (aprovado: false, professor_responsavel_id)
    ↓
Notification (upload_pending) → Aluno
Notification (approval_request) + Email → Professor
    ↓
Aguarda aprovação do professor
    ↓
Professor aprova → UPDATE aprovado: true + 50 pontos ao aluno
\`\`\`

### 3. Pessoa Comum Upload (Aprovação do Diretor)
\`\`\`
User (Pessoa Comum) → Upload Form (sem tag) → uploadFile()
    ↓
Supabase Storage (upload ficheiro + thumbnail)
    ↓
Database INSERT (aprovado: false)
    ↓
Notification (upload_pending) → Pessoa Comum
Notifications (approval_request) → Todos os diretores da universidade
    ↓
Aguarda aprovação do diretor
    ↓
Diretor aprova → UPDATE aprovado: true + 50 pontos ao utilizador
\`\`\`

## Pontos de Validação

1. **Autenticação**: Apenas utilizadores autenticados podem fazer upload
2. **Tamanho do Ficheiro**: Máximo 50MB
3. **Tipos Permitidos**: PDF, DOC, DOCX, PPT, PPTX, JPG, PNG, MP4, ZIP, RAR
4. **Metadados Obrigatórios**: Título, Universidade, Disciplina, Tipo de Ficheiro
5. **Tag de Aprovação**: Obrigatória para alunos (professor) e pessoas comuns (universidade)
6. **Perfil Existente**: Cria automaticamente se não existir

## Storage Structure

\`\`\`
/documents
  /uploads
    /{userId}
      /{timestamp}-{random}.{ext}
  /thumbnails
    /{userId}
      /thumb-{timestamp}.{ext}
  /avatars
    /{userId}-{timestamp}.{ext}
