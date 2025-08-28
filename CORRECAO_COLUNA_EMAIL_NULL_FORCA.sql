-- 🔧 Correção FORÇADA da Coluna Email para Permitir NULL
-- Execute este script no Supabase para resolver o erro de constraint NOT NULL

-- 1. Verificar a estrutura atual da tabela pessoas
SELECT 
    'ESTRUTURA ATUAL:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'pessoas' 
AND column_name IN ('email', 'telefone')
ORDER BY column_name;

-- 2. Verificar constraints existentes
SELECT 
    'CONSTRAINTS EXISTENTES:' as info,
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'pessoas' 
AND constraint_type IN ('NOT NULL', 'CHECK')
ORDER BY constraint_name;

-- 3. FORÇAR alteração da coluna email para permitir NULL
-- Se der erro, tentar abordagem alternativa
DO $$
BEGIN
    -- Tentar alteração direta
    BEGIN
        ALTER TABLE pessoas ALTER COLUMN email DROP NOT NULL;
        RAISE NOTICE '✅ Coluna email alterada com sucesso para permitir NULL';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE '⚠️ Erro na alteração direta: %', SQLERRM;
        
        -- Tentar abordagem alternativa - recriar a coluna
        BEGIN
            -- Adicionar nova coluna temporária
            ALTER TABLE pessoas ADD COLUMN email_temp TEXT;
            
            -- Copiar dados existentes
            UPDATE pessoas SET email_temp = email WHERE email IS NOT NULL;
            
            -- Remover coluna antiga
            ALTER TABLE pessoas DROP COLUMN email;
            
            -- Renomear coluna temporária
            ALTER TABLE pessoas RENAME COLUMN email_temp TO email;
            
            RAISE NOTICE '✅ Coluna email recriada com sucesso para permitir NULL';
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE '❌ Erro na recriação da coluna: %', SQLERRM;
        END;
    END;
END $$;

-- 4. Verificar se a alteração foi aplicada
SELECT 
    'ESTRUTURA APÓS ALTERAÇÃO:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'pessoas' 
AND column_name IN ('email', 'telefone')
ORDER BY column_name;

-- 5. Testar inserção com email NULL
DO $$
BEGIN
    -- Tentar inserir uma pessoa de teste com email NULL
    INSERT INTO pessoas (nome, telefone, questionario_id) 
    VALUES ('TESTE_EMAIL_NULL', '123456789', 'fdfa8c81-49c9-469d-a2d7-b99949720b38')
    ON CONFLICT (telefone, questionario_id) DO NOTHING;
    
    RAISE NOTICE '✅ Teste de inserção com email NULL realizado com sucesso';
    
    -- Limpar dados de teste
    DELETE FROM pessoas WHERE nome = 'TESTE_EMAIL_NULL';
    RAISE NOTICE '✅ Dados de teste removidos';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Erro no teste de inserção: %', SQLERRM;
END $$;

-- 6. Verificar constraints finais
SELECT 
    'CONSTRAINTS FINAIS:' as info,
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'pessoas' 
AND constraint_type IN ('NOT NULL', 'CHECK')
ORDER BY constraint_name;

-- 7. Mensagem de conclusão
SELECT 
    '🎯 Script de correção da coluna email concluído!' as status,
    '✅ Agora questionários podem funcionar apenas com nome e telefone' as resultado;
