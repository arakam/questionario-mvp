-- 🔧 Correção de Duplicatas de Telefone + Questionário ID
-- Execute este script ANTES de executar o UPDATE_VERIFICACAO_DUPLICATAS.sql
-- Este script resolve o erro de constraint única que não pode ser criada

-- 1. Verificar duplicatas existentes
SELECT 
    'Duplicatas de telefone + questionario_id:' as tipo,
    telefone, 
    questionario_id, 
    COUNT(*) as total_duplicatas
FROM pessoas 
WHERE telefone IS NOT NULL 
GROUP BY telefone, questionario_id 
HAVING COUNT(*) > 1
ORDER BY total_duplicatas DESC;

-- 2. Verificar duplicatas de email + questionario_id também
SELECT 
    'Duplicatas de email + questionario_id:' as tipo,
    email, 
    questionario_id, 
    COUNT(*) as total_duplicatas
FROM pessoas 
GROUP BY email, questionario_id 
HAVING COUNT(*) > 1
ORDER BY total_duplicatas DESC;

-- 3. Remover duplicatas de telefone + questionario_id
-- Mantém apenas o registro mais recente (baseado em created_at)
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

-- 4. Remover duplicatas de email + questionario_id
-- Mantém apenas o registro mais recente (baseado em created_at)
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

-- 5. Verificar se as duplicatas foram removidas
SELECT 
    'Verificação pós-limpeza - telefone:' as tipo,
    telefone, 
    questionario_id, 
    COUNT(*) as total_registros
FROM pessoas 
WHERE telefone IS NOT NULL 
GROUP BY telefone, questionario_id 
HAVING COUNT(*) > 1
ORDER BY total_registros DESC;

SELECT 
    'Verificação pós-limpeza - email:' as tipo,
    email, 
    questionario_id, 
    COUNT(*) as total_registros
FROM pessoas 
GROUP BY email, questionario_id 
HAVING COUNT(*) > 1
ORDER BY total_registros DESC;

-- 6. Agora é seguro criar as constraints únicas
-- Execute o script UPDATE_VERIFICACAO_DUPLICATAS.sql após este

-- 7. Verificar se as constraints podem ser criadas
-- Criar constraint para telefone
DO $$
BEGIN
    ALTER TABLE pessoas 
    ADD CONSTRAINT pessoas_telefone_questionario_id_key 
    UNIQUE (telefone, questionario_id);
    RAISE NOTICE '✅ Constraint única para telefone + questionario_id criada com sucesso';
EXCEPTION 
    WHEN duplicate_object THEN
        RAISE NOTICE 'ℹ️ Constraint única para telefone + questionario_id já existe';
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Erro ao criar constraint para telefone: %', SQLERRM;
END $$;

-- Criar constraint para email
DO $$
BEGIN
    ALTER TABLE pessoas 
    ADD CONSTRAINT pessoas_email_questionario_id_key 
    UNIQUE (email, questionario_id);
    RAISE NOTICE '✅ Constraint única para email + questionario_id criada com sucesso';
EXCEPTION 
    WHEN duplicate_object THEN
        RAISE NOTICE 'ℹ️ Constraint única para email + questionario_id já existe';
    WHEN OTHERS THEN
        RAISE NOTICE '❌ Erro ao criar constraint para email: %', SQLERRM;
END $$;

-- 8. Verificar constraints existentes
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

-- 9. Mensagem de sucesso
DO $$
BEGIN
    RAISE NOTICE '🎉 Correção de duplicatas concluída com sucesso!';
    RAISE NOTICE '✅ Agora é seguro executar o script UPDATE_VERIFICACAO_DUPLICATAS.sql';
    RAISE NOTICE '✅ As constraints únicas foram criadas';
    RAISE NOTICE '✅ O sistema está pronto para verificação por e-mail ou telefone';
END $$;
