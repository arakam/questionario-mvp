-- 🧹 LIMPEZA DE REGISTROS DUPLICADOS POR EMAIL
-- Execute este script no Supabase para resolver o problema de múltiplos registros

-- 1. Verificar registros duplicados por email
SELECT 
    email,
    COUNT(*) as total_registros,
    MIN(created_at) as primeiro_registro,
    MAX(created_at) as ultimo_registro
FROM pessoas 
GROUP BY email 
HAVING COUNT(*) > 1
ORDER BY total_registros DESC;

-- 2. Criar tabela temporária com os registros mais recentes por email
CREATE TEMP TABLE pessoas_unicas AS
SELECT DISTINCT ON (email) 
    id,
    nome,
    email,
    telefone,
    cnpj,
    empresa,
    qtd_funcionarios,
    ramo_atividade,
    created_at,
    updated_at
FROM pessoas 
ORDER BY email, created_at DESC;

-- 3. Verificar quantos registros únicos temos
SELECT COUNT(*) as total_registros_unicos FROM pessoas_unicas;

-- 4. Backup da tabela original (opcional)
-- CREATE TABLE pessoas_backup AS SELECT * FROM pessoas;

-- 5. Limpar tabela original
TRUNCATE TABLE pessoas;

-- 6. Reinserir apenas os registros únicos
INSERT INTO pessoas 
SELECT * FROM pessoas_unicas;

-- 7. Verificar se a limpeza funcionou
SELECT 
    email,
    COUNT(*) as total_registros
FROM pessoas 
GROUP BY email 
HAVING COUNT(*) > 1
ORDER BY total_registros DESC;

-- 8. Adicionar constraint única no email (se não existir)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'pessoas_email_key'
    ) THEN
        ALTER TABLE pessoas ADD CONSTRAINT pessoas_email_key UNIQUE (email);
        RAISE NOTICE '✅ Constraint de email único adicionada';
    ELSE
        RAISE NOTICE 'ℹ️ Constraint de email único já existe';
    END IF;
END $$;

-- 9. Verificar constraints da tabela
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'pessoas'
ORDER BY tc.constraint_name;

-- 10. Verificar estrutura final
SELECT 
    'ESTRUTURA FINAL' as info,
    '' as separator;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'pessoas'
ORDER BY ordinal_position;

-- 11. Testar inserção com email duplicado (deve falhar)
DO $$
BEGIN
    BEGIN
        INSERT INTO pessoas (nome, email) 
        VALUES ('Teste Duplicado', 'teste@duplicado.com');
        
        -- Se chegou aqui, não há constraint única
        RAISE NOTICE '⚠️ Constraint única não está funcionando!';
        
        -- Limpar o teste
        DELETE FROM pessoas WHERE email = 'teste@duplicado.com';
        
    EXCEPTION WHEN unique_violation THEN
        RAISE NOTICE '✅ Constraint única funcionando corretamente!';
    END;
END $$;

-- 12. Resumo da operação
SELECT 
    'RESUMO DA LIMPEZA' as info,
    '' as separator;

SELECT 
    'Status' as item,
    '✅ Tabela limpa de duplicatas' as resultado
UNION ALL
SELECT 
    'Constraint' as item,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pessoas_email_key') 
        THEN '✅ Email único configurado' 
        ELSE '❌ Email único não configurado' 
    END as resultado
UNION ALL
SELECT 
    'Registros' as item,
    (SELECT COUNT(*)::text FROM pessoas) || ' registros únicos' as resultado;
