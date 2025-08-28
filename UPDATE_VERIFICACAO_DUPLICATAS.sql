-- 🚀 Atualização para Suporte à Verificação de Duplicatas por E-mail ou Telefone
-- Execute este script no seu banco Supabase para adicionar suporte à escolha do campo de verificação

-- 0. Diagnóstico inicial - verificar dados duplicados existentes
DO $$
BEGIN
    RAISE NOTICE '🔍 Iniciando diagnóstico do banco de dados...';
    
    -- Verificar duplicatas de email + questionario_id
    IF EXISTS (
        SELECT email, questionario_id, COUNT(*)
        FROM pessoas 
        GROUP BY email, questionario_id 
        HAVING COUNT(*) > 1
    ) THEN
        RAISE NOTICE '⚠️ ATENÇÃO: Existem duplicatas de email + questionario_id';
        RAISE NOTICE '   Serão removidas automaticamente mantendo o registro mais recente';
    ELSE
        RAISE NOTICE '✅ Nenhuma duplicata de email + questionario_id encontrada';
    END IF;
    
    -- Verificar duplicatas de telefone + questionario_id
    IF EXISTS (
        SELECT telefone, questionario_id, COUNT(*)
        FROM pessoas 
        WHERE telefone IS NOT NULL 
        GROUP BY telefone, questionario_id 
        HAVING COUNT(*) > 1
    ) THEN
        RAISE NOTICE '⚠️ ATENÇÃO: Existem duplicatas de telefone + questionario_id';
        RAISE NOTICE '   Serão removidas automaticamente mantendo o registro mais recente';
    ELSE
        RAISE NOTICE '✅ Nenhuma duplicata de telefone + questionario_id encontrada';
    END IF;
    
    RAISE NOTICE '🔍 Diagnóstico concluído. Prosseguindo com a atualização...';
END $$;

-- 0.1. Criar backup das tabelas antes de modificar (OPCIONAL)
-- Descomente as linhas abaixo se quiser criar um backup
/*
CREATE TABLE IF NOT EXISTS pessoas_backup_$(date +%Y%m%d_%H%M%S) AS SELECT * FROM pessoas;
CREATE TABLE IF NOT EXISTS questionarios_backup_$(date +%Y%m%d_%H%M%S) AS SELECT * FROM questionarios;
RAISE NOTICE '💾 Backup das tabelas criado com sucesso';
*/

-- 1. Verificar se a coluna campos_configuraveis já existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'questionarios' 
        AND column_name = 'campos_configuraveis'
    ) THEN
        -- Adicionar coluna se não existir
        ALTER TABLE questionarios 
        ADD COLUMN campos_configuraveis JSONB DEFAULT '[]'::jsonb;
        
        RAISE NOTICE '✅ Coluna campos_configuraveis adicionada à tabela questionarios';
    ELSE
        RAISE NOTICE 'ℹ️ Coluna campos_configuraveis já existe na tabela questionarios';
    END IF;
END $$;

-- 2. Criar índice para performance (se não existir)
CREATE INDEX IF NOT EXISTS idx_questionarios_campos_configuraveis 
ON questionarios USING GIN (campos_configuraveis);

-- 3. Verificar se a coluna telefone existe na tabela pessoas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pessoas' 
        AND column_name = 'telefone'
    ) THEN
        -- Adicionar coluna telefone se não existir
        ALTER TABLE pessoas 
        ADD COLUMN telefone TEXT;
        
        RAISE NOTICE '✅ Coluna telefone adicionada à tabela pessoas';
    ELSE
        RAISE NOTICE 'ℹ️ Coluna telefone já existe na tabela pessoas';
    END IF;
END $$;

-- 4. Verificar se a constraint única composta (email + questionario_id) existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'pessoas' 
        AND constraint_name = 'pessoas_email_questionario_id_key'
    ) THEN
        -- Verificar se há dados duplicados antes de criar a constraint
        IF EXISTS (
            SELECT email, questionario_id, COUNT(*)
            FROM pessoas 
            WHERE email IS NOT NULL 
            GROUP BY email, questionario_id 
            HAVING COUNT(*) > 1
        ) THEN
            RAISE NOTICE '⚠️ Existem dados duplicados para email + questionario_id. Removendo duplicatas...';
            
            -- Remover duplicatas mantendo apenas o registro mais recente
            DELETE FROM pessoas 
            WHERE id IN (
                SELECT p1.id
                FROM pessoas p1
                INNER JOIN (
                    SELECT email, questionario_id, MAX(created_at) as max_created_at
                    FROM pessoas
                    GROUP BY email, questionario_id
                    HAVING COUNT(*) > 1
                ) p2 ON p1.email = p2.email 
                    AND p1.questionario_id = p2.questionario_id
                    AND p1.created_at < p2.max_created_at
            );
            
            RAISE NOTICE '✅ Duplicatas removidas. Agora criando constraint única...';
        END IF;
        
        -- Adicionar constraint única composta
        ALTER TABLE pessoas 
        ADD CONSTRAINT pessoas_email_questionario_id_key 
        UNIQUE (email, questionario_id);
        
        RAISE NOTICE '✅ Constraint única composta (email + questionario_id) adicionada';
    ELSE
        RAISE NOTICE 'ℹ️ Constraint única composta (email + questionario_id) já existe';
    END IF;
END $$;

-- 5. Verificar se a constraint única composta (telefone + questionario_id) existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'pessoas' 
        AND constraint_name = 'pessoas_telefone_questionario_id_key'
    ) THEN
        -- Verificar se há dados duplicados antes de criar a constraint
        IF EXISTS (
            SELECT telefone, questionario_id, COUNT(*)
            FROM pessoas 
            WHERE telefone IS NOT NULL 
            GROUP BY telefone, questionario_id 
            HAVING COUNT(*) > 1
        ) THEN
            RAISE NOTICE '⚠️ Existem dados duplicados para telefone + questionario_id. Removendo duplicatas...';
            
            -- Remover duplicatas mantendo apenas o registro mais recente
            DELETE FROM pessoas 
            WHERE id IN (
                SELECT p1.id
                FROM pessoas p1
                INNER JOIN (
                    SELECT telefone, questionario_id, MAX(created_at) as max_created_at
                    FROM pessoas
                    WHERE telefone IS NOT NULL
                    GROUP BY telefone, questionario_id
                    HAVING COUNT(*) > 1
                ) p2 ON p1.telefone = p2.telefone 
                    AND p1.questionario_id = p2.questionario_id
                    AND p1.created_at < p2.max_created_at
            );
            
            RAISE NOTICE '✅ Duplicatas removidas. Agora criando constraint única...';
        END IF;
        
        -- Adicionar constraint única composta para telefone
        ALTER TABLE pessoas 
        ADD CONSTRAINT pessoas_telefone_questionario_id_key 
        UNIQUE (telefone, questionario_id);
        
        RAISE NOTICE '✅ Constraint única composta (telefone + questionario_id) adicionada';
    ELSE
        RAISE NOTICE 'ℹ️ Constraint única composta (telefone + questionario_id) já existe';
    END IF;
END $$;

-- 6. Atualizar questionários existentes com configuração padrão de verificação por email
UPDATE questionarios 
SET campos_configuraveis = COALESCE(
    campos_configuraveis, 
    '[]'::jsonb
) || '[
  {
    "id": "nome",
    "label": "Nome",
    "tipo": "texto",
    "obrigatorio": true,
    "ordem": 1,
    "placeholder": "Digite seu nome completo",
    "campoVerificacao": false
  },
  {
    "id": "email",
    "label": "E-mail",
    "tipo": "email",
    "obrigatorio": true,
    "ordem": 2,
    "placeholder": "seu@email.com",
    "campoVerificacao": true
  },
  {
    "id": "telefone",
    "label": "Telefone",
    "tipo": "telefone",
    "obrigatorio": false,
    "ordem": 3,
    "placeholder": "(11) 99999-9999",
    "campoVerificacao": false
  },
  {
    "id": "cnpj",
    "label": "CNPJ",
    "tipo": "texto",
    "obrigatorio": false,
    "ordem": 4,
    "placeholder": "00.000.000/0000-00",
    "campoVerificacao": false
  },
  {
    "id": "empresa",
    "label": "Empresa",
    "tipo": "texto",
    "obrigatorio": false,
    "ordem": 5,
    "placeholder": "Nome da empresa",
    "campoVerificacao": false
  },
  {
    "id": "qtd_funcionarios",
    "label": "Quantidade de funcionários",
    "tipo": "numero",
    "obrigatorio": false,
    "ordem": 6,
    "placeholder": "0",
    "campoVerificacao": false
  },
  {
    "id": "ramo_atividade",
    "label": "Ramo de atividade",
    "tipo": "texto",
    "obrigatorio": false,
    "ordem": 7,
    "placeholder": "Ex: Tecnologia, Saúde, Educação",
    "campoVerificacao": false
  }
]'::jsonb
WHERE campos_configuraveis IS NULL OR jsonb_array_length(campos_configuraveis) = 0;

-- 7. Verificar se a atualização foi bem-sucedida
SELECT 
    id,
    nome,
    jsonb_array_length(campos_configuraveis) as total_campos,
    campos_configuraveis
FROM questionarios 
ORDER BY created_at DESC 
LIMIT 5;

-- 8. Verificar estrutura da tabela pessoas
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'pessoas' 
  AND column_name IN ('email', 'telefone', 'questionario_id')
ORDER BY column_name;

-- 9. Verificar constraints da tabela pessoas
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'pessoas'
  AND tc.constraint_type IN ('UNIQUE', 'FOREIGN KEY')
ORDER BY tc.constraint_name;

-- 10. Comentários para documentar as mudanças
COMMENT ON COLUMN questionarios.campos_configuraveis IS 'JSON com configuração dos campos de dados pessoais e verificação de duplicatas do questionário';
COMMENT ON COLUMN pessoas.telefone IS 'Número de telefone para verificação de duplicatas (alternativo ao email)';

-- 11. Função para validar campos de verificação
CREATE OR REPLACE FUNCTION validar_campo_verificacao()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar se apenas um campo está marcado como campoVerificacao
    IF (
        SELECT COUNT(*) 
        FROM jsonb_array_elements(NEW.campos_configuraveis) AS campo
        WHERE (campo->>'campoVerificacao')::boolean = true
    ) > 1 THEN
        RAISE EXCEPTION 'Apenas um campo pode ser marcado como campo de verificação';
    END IF;
    
    -- Verificar se o campo de verificação é email ou telefone
    IF EXISTS (
        SELECT 1 
        FROM jsonb_array_elements(NEW.campos_configuraveis) AS campo
        WHERE (campo->>'campoVerificacao')::boolean = true
        AND campo->>'tipo' NOT IN ('email', 'telefone')
    ) THEN
        RAISE EXCEPTION 'Apenas campos do tipo email ou telefone podem ser marcados como campo de verificação';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 12. Trigger para validar campos de verificação
DROP TRIGGER IF EXISTS trigger_validar_campo_verificacao ON questionarios;
CREATE TRIGGER trigger_validar_campo_verificacao
    BEFORE INSERT OR UPDATE ON questionarios
    FOR EACH ROW
    EXECUTE FUNCTION validar_campo_verificacao();

-- 13. Mensagem de sucesso
DO $$
BEGIN
    RAISE NOTICE '🎉 Atualização concluída com sucesso!';
    RAISE NOTICE '✅ Sistema agora suporta verificação de duplicatas por e-mail ou telefone';
    RAISE NOTICE '✅ Campos configuráveis incluem opção de campo de verificação';
    RAISE NOTICE '✅ Validações automáticas implementadas';
    RAISE NOTICE '✅ Constraints únicas para email e telefone por questionário';
END $$;
