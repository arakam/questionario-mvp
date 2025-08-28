-- 🔧 Correção da Coluna Email para Permitir NULL
-- Execute este script para permitir questionários sem email

-- 1. Verificar a estrutura atual da tabela pessoas
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'pessoas' 
AND column_name IN ('email', 'telefone')
ORDER BY column_name;

-- 2. Alterar a coluna email para permitir NULL
ALTER TABLE pessoas 
ALTER COLUMN email DROP NOT NULL;

-- 3. Verificar se a alteração foi aplicada
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'pessoas' 
AND column_name IN ('email', 'telefone')
ORDER BY column_name;

-- 4. Verificar se as constraints únicas ainda existem
SELECT 
    constraint_name,
    table_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'pessoas' 
AND constraint_type = 'UNIQUE';

-- 5. Testar inserção com email NULL (opcional)
-- INSERT INTO pessoas (nome, telefone, questionario_id) 
-- VALUES ('Teste', '123456789', '35d4c21d-c40b-49ae-ab94-c0f2a14c01ec')
-- ON CONFLICT (telefone, questionario_id) DO NOTHING;

-- 6. Limpar dados de teste (se necessário)
-- DELETE FROM pessoas WHERE nome = 'Teste';

RAISE NOTICE '✅ Coluna email agora permite NULL';
RAISE NOTICE '✅ Questionários podem funcionar apenas com nome e telefone';
