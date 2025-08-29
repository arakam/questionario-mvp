-- 🔍 Debug Específico das Respostas Sim/Não
-- Execute este script para verificar exatamente o que está acontecendo

-- 1. Verificar estrutura da tabela respostas
SELECT 
    'ESTRUTURA:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'respostas'
ORDER BY ordinal_position;

-- 2. Verificar TODAS as respostas do tipo sim_nao
SELECT 
    'TODAS RESPOSTAS SIM/NAO:' as info,
    id,
    pessoa_id,
    pergunta_id,
    questionario_id,
    resposta,
    pg_typeof(resposta) as tipo_resposta,
    resposta_texto,
    resposta_escala,
    tipo_pergunta,
    created_at
FROM respostas 
WHERE tipo_pergunta = 'sim_nao'
ORDER BY created_at DESC;

-- 3. Verificar respostas com valores específicos
SELECT 
    'RESPOSTAS COM VALORES:' as info,
    id,
    pergunta_id,
    resposta,
    CASE 
        WHEN resposta = true THEN 'SIM (true)'
        WHEN resposta = false THEN 'NÃO (false)'
        WHEN resposta IS NULL THEN 'NULL'
        ELSE 'OUTRO: ' || resposta::text
    END as resposta_formatada,
    pg_typeof(resposta) as tipo_resposta,
    created_at
FROM respostas 
WHERE tipo_pergunta = 'sim_nao'
ORDER BY created_at DESC;

-- 4. Verificar se há respostas duplicadas ou conflitantes
SELECT 
    'VERIFICAÇÃO DE DUPLICATAS:' as info,
    pergunta_id,
    pessoa_id,
    questionario_id,
    COUNT(*) as total_respostas,
    COUNT(CASE WHEN resposta = true THEN 1 END) as respostas_sim,
    COUNT(CASE WHEN resposta = false THEN 1 END) as respostas_nao,
    COUNT(CASE WHEN resposta IS NULL THEN 1 END) as respostas_null
FROM respostas 
WHERE tipo_pergunta = 'sim_nao'
GROUP BY pergunta_id, pessoa_id, questionario_id
HAVING COUNT(*) > 1
ORDER BY total_respostas DESC;

-- 5. Verificar respostas por questionário específico
-- Substitua 'QUESTIONARIO_ID_AQUI' pelo ID real do questionário
SELECT 
    'RESPOSTAS POR QUESTIONARIO:' as info,
    r.id,
    r.pergunta_id,
    r.pessoa_id,
    r.resposta,
    CASE 
        WHEN r.resposta = true THEN '✅ SIM'
        WHEN r.resposta = false THEN '❌ NÃO'
        WHEN r.resposta IS NULL THEN '⚠️ NULL'
        ELSE '❓ OUTRO: ' || r.resposta::text
    END as resposta_formatada,
    p.texto as pergunta_texto,
    p.tipo as pergunta_tipo,
    r.created_at
FROM respostas r
JOIN perguntas p ON r.pergunta_id = p.id
WHERE r.tipo_pergunta = 'sim_nao'
-- AND r.questionario_id = 'QUESTIONARIO_ID_AQUI'  -- Descomente e substitua
ORDER BY r.created_at DESC;

-- 6. Verificar se há problemas de constraint ou tipo
SELECT 
    'VERIFICAÇÃO DE TIPOS:' as info,
    'resposta' as campo,
    pg_typeof(resposta) as tipo_atual,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN resposta IS NOT NULL THEN 1 END) as nao_nulos,
    COUNT(CASE WHEN resposta IS NULL THEN 1 END) as nulos
FROM respostas 
WHERE tipo_pergunta = 'sim_nao'
GROUP BY pg_typeof(resposta);

-- 7. Verificar respostas mais recentes para debug
SELECT 
    'RESPOSTAS RECENTES:' as info,
    id,
    pergunta_id,
    pessoa_id,
    resposta,
    pg_typeof(resposta) as tipo_resposta,
    tipo_pergunta,
    created_at
FROM respostas 
WHERE tipo_pergunta = 'sim_nao'
ORDER BY created_at DESC
LIMIT 20;

-- 8. Verificar se há respostas em outros campos
SELECT 
    'RESPOSTAS EM OUTROS CAMPOS:' as info,
    id,
    pergunta_id,
    resposta,
    resposta_texto,
    resposta_escala,
    tipo_pergunta,
    created_at
FROM respostas 
WHERE tipo_pergunta = 'sim_nao'
AND (resposta_texto IS NOT NULL OR resposta_escala IS NOT NULL)
ORDER BY created_at DESC;
