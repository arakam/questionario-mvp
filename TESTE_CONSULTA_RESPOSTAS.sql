-- 🧪 Teste da Consulta Exata do Código TypeScript
-- Execute este script para verificar se a consulta está retornando os dados corretos

-- Simular a consulta exata do código:
-- admin.from('respostas').select('pergunta_id, resposta, resposta_texto, resposta_escala, resposta_multipla, tipo_pergunta, respondido_em')

-- 1. Testar consulta básica (substitua os IDs pelos reais)
-- Substitua 'PESSOA_ID_AQUI' e 'QUESTIONARIO_ID_AQUI' pelos IDs reais
SELECT 
    'CONSULTA EXATA DO CÓDIGO:' as info,
    pergunta_id,
    resposta,
    pg_typeof(resposta) as tipo_resposta,
    resposta_texto,
    resposta_escala,
    resposta_multipla,
    tipo_pergunta,
    respondido_em
FROM respostas 
WHERE pessoa_id = 'PESSOA_ID_AQUI'  -- Substitua pelo ID real
AND questionario_id = 'QUESTIONARIO_ID_AQUI'  -- Substitua pelo ID real
ORDER BY pergunta_id;

-- 2. Testar consulta sem filtros para ver todas as respostas
SELECT 
    'TODAS AS RESPOSTAS:' as info,
    pergunta_id,
    pessoa_id,
    questionario_id,
    resposta,
    pg_typeof(resposta) as tipo_resposta,
    tipo_pergunta,
    created_at
FROM respostas 
ORDER BY created_at DESC
LIMIT 20;

-- 3. Testar consulta específica para sim_nao
SELECT 
    'RESPOSTAS SIM/NAO:' as info,
    pergunta_id,
    pessoa_id,
    questionario_id,
    resposta,
    pg_typeof(resposta) as tipo_resposta,
    tipo_pergunta,
    created_at
FROM respostas 
WHERE tipo_pergunta = 'sim_nao'
ORDER BY created_at DESC
LIMIT 20;

-- 4. Verificar se há respostas com valores boolean válidos
SELECT 
    'RESPOSTAS BOOLEAN VÁLIDAS:' as info,
    pergunta_id,
    pessoa_id,
    questionario_id,
    resposta,
    CASE 
        WHEN resposta = true THEN '✅ SIM (true)'
        WHEN resposta = false THEN '❌ NÃO (false)'
        WHEN resposta IS NULL THEN '⚠️ NULL'
        ELSE '❓ OUTRO: ' || resposta::text
    END as resposta_formatada,
    tipo_pergunta,
    created_at
FROM respostas 
WHERE tipo_pergunta = 'sim_nao'
AND resposta IS NOT NULL
ORDER BY created_at DESC;

-- 5. Verificar se há respostas com valores NULL
SELECT 
    'RESPOSTAS NULL:' as info,
    pergunta_id,
    pessoa_id,
    questionario_id,
    resposta,
    tipo_pergunta,
    created_at
FROM respostas 
WHERE tipo_pergunta = 'sim_nao'
AND resposta IS NULL
ORDER BY created_at DESC;

-- 6. Testar JOIN com perguntas para ver o contexto completo
SELECT 
    'JOIN COM PERGUNTAS:' as info,
    r.id as resposta_id,
    r.pergunta_id,
    r.pessoa_id,
    r.questionario_id,
    r.resposta,
    CASE 
        WHEN r.resposta = true THEN '✅ SIM'
        WHEN r.resposta = false THEN '❌ NÃO'
        WHEN r.resposta IS NULL THEN '⚠️ NULL'
        ELSE '❓ OUTRO: ' || r.resposta::text
    END as resposta_formatada,
    p.texto as pergunta_texto,
    p.tipo as pergunta_tipo,
    r.tipo_pergunta as resposta_tipo,
    r.created_at
FROM respostas r
JOIN perguntas p ON r.pergunta_id = p.id
WHERE r.tipo_pergunta = 'sim_nao'
ORDER BY r.created_at DESC
LIMIT 20;

-- 7. Verificar se há problemas de tipo de dados
SELECT 
    'VERIFICAÇÃO DE TIPOS DE DADOS:' as info,
    'resposta' as campo,
    pg_typeof(resposta) as tipo_atual,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN resposta = true THEN 1 END) as valores_true,
    COUNT(CASE WHEN resposta = false THEN 1 END) as valores_false,
    COUNT(CASE WHEN resposta IS NULL THEN 1 END) as valores_null
FROM respostas 
WHERE tipo_pergunta = 'sim_nao'
GROUP BY pg_typeof(resposta);

-- 8. Testar consulta com LIMIT para simular o comportamento real
SELECT 
    'CONSULTA COM LIMIT:' as info,
    pergunta_id,
    resposta,
    pg_typeof(resposta) as tipo_resposta,
    tipo_pergunta,
    created_at
FROM respostas 
WHERE tipo_pergunta = 'sim_nao'
ORDER BY created_at DESC
LIMIT 10;
