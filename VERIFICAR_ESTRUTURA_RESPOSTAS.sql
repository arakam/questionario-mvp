-- 🔍 Verificação da Estrutura da Tabela Respostas
-- Execute este script para diagnosticar problemas com respostas Sim/Não

-- 1. Verificar estrutura atual da tabela respostas
SELECT 
    'ESTRUTURA ATUAL:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'respostas'
ORDER BY ordinal_position;

-- 2. Verificar se o campo 'resposta' existe e seu tipo
SELECT 
    'CAMPO RESPOSTA:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'respostas' 
AND column_name = 'resposta';

-- 3. Verificar dados de exemplo na tabela respostas
SELECT 
    'DADOS DE EXEMPLO:' as info,
    id,
    pessoa_id,
    pergunta_id,
    questionario_id,
    resposta,
    resposta_texto,
    resposta_escala,
    resposta_multipla,
    tipo_pergunta,
    created_at
FROM respostas 
LIMIT 5;

-- 4. Verificar respostas do tipo sim_nao especificamente
SELECT 
    'RESPOSTAS SIM/NAO:' as info,
    id,
    pergunta_id,
    resposta,
    resposta_texto,
    resposta_escala,
    tipo_pergunta,
    created_at
FROM respostas 
WHERE tipo_pergunta = 'sim_nao'
LIMIT 10;

-- 5. Verificar se há respostas com valores boolean
SELECT 
    'RESPOSTAS BOOLEAN:' as info,
    id,
    pergunta_id,
    resposta,
    pg_typeof(resposta) as tipo_resposta,
    created_at
FROM respostas 
WHERE pg_typeof(resposta) = 'boolean'::regtype
LIMIT 5;

-- 6. Verificar se há respostas com valores text
SELECT 
    'RESPOSTAS TEXT:' as info,
    id,
    pergunta_id,
    resposta,
    pg_typeof(resposta) as tipo_resposta,
    created_at
FROM respostas 
WHERE pg_typeof(resposta) = 'text'::regtype
LIMIT 5;

-- 7. Contar tipos de resposta por tipo de pergunta
SELECT 
    'CONTAGEM POR TIPO:' as info,
    tipo_pergunta,
    COUNT(*) as total,
    COUNT(CASE WHEN resposta IS NOT NULL THEN 1 END) as com_resposta,
    COUNT(CASE WHEN resposta_texto IS NOT NULL THEN 1 END) as com_resposta_texto,
    COUNT(CASE WHEN resposta_escala IS NOT NULL THEN 1 END) as com_resposta_escala,
    COUNT(CASE WHEN resposta_multipla IS NOT NULL THEN 1 END) as com_resposta_multipla
FROM respostas 
GROUP BY tipo_pergunta
ORDER BY tipo_pergunta;
