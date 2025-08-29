-- 🔧 Correção da Estrutura da Tabela Respostas
-- Execute este script para corrigir problemas com respostas Sim/Não

-- 1. Adicionar campo 'resposta' se não existir
-- Este campo será usado para armazenar respostas boolean (true/false) para perguntas Sim/Não
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'respostas' AND column_name = 'resposta'
    ) THEN
        ALTER TABLE respostas ADD COLUMN resposta BOOLEAN;
        RAISE NOTICE 'Campo "resposta" adicionado com sucesso';
    ELSE
        RAISE NOTICE 'Campo "resposta" já existe';
    END IF;
END $$;

-- 2. Verificar se o campo foi criado
SELECT 
    'VERIFICAÇÃO:' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'respostas' 
AND column_name = 'resposta';

-- 3. Atualizar respostas existentes do tipo sim_nao
-- Se houver respostas em resposta_texto com "sim"/"não", converter para boolean
UPDATE respostas 
SET resposta = CASE 
    WHEN resposta_texto ILIKE 'sim' OR resposta_texto ILIKE 'true' OR resposta_texto = '1' THEN true
    WHEN resposta_texto ILIKE 'não' OR resposta_texto ILIKE 'nao' OR resposta_texto ILIKE 'false' OR resposta_texto = '0' THEN false
    ELSE NULL
END
WHERE tipo_pergunta = 'sim_nao' 
AND resposta IS NULL 
AND resposta_texto IS NOT NULL;

-- 4. Atualizar respostas existentes do tipo sim_nao
-- Se houver respostas em resposta_escala com 1/0, converter para boolean
UPDATE respostas 
SET resposta = CASE 
    WHEN resposta_escala = 1 THEN true
    WHEN resposta_escala = 0 THEN false
    ELSE NULL
END
WHERE tipo_pergunta = 'sim_nao' 
AND resposta IS NULL 
AND resposta_escala IS NOT NULL;

-- 5. Verificar quantas respostas foram atualizadas
SELECT 
    'RESULTADO DA ATUALIZAÇÃO:' as info,
    tipo_pergunta,
    COUNT(*) as total,
    COUNT(CASE WHEN resposta IS NOT NULL THEN 1 END) as com_resposta_boolean,
    COUNT(CASE WHEN resposta_texto IS NOT NULL THEN 1 END) as com_resposta_texto,
    COUNT(CASE WHEN resposta_escala IS NOT NULL THEN 1 END) as com_resposta_escala
FROM respostas 
WHERE tipo_pergunta = 'sim_nao'
GROUP BY tipo_pergunta;

-- 6. Verificar algumas respostas atualizadas
SELECT 
    'EXEMPLOS ATUALIZADOS:' as info,
    id,
    pergunta_id,
    resposta,
    resposta_texto,
    resposta_escala,
    tipo_pergunta,
    created_at
FROM respostas 
WHERE tipo_pergunta = 'sim_nao'
AND resposta IS NOT NULL
LIMIT 10;

-- 7. Criar índice para melhorar performance de consultas por resposta
CREATE INDEX IF NOT EXISTS idx_respostas_resposta ON respostas(resposta) WHERE resposta IS NOT NULL;

-- 8. Verificar estrutura final
SELECT 
    'ESTRUTURA FINAL:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'respostas'
ORDER BY ordinal_position;

-- 9. Mensagem de conclusão
SELECT 
    '🎉 CORREÇÃO CONCLUÍDA!' as status,
    '✅ Campo resposta adicionado' as campo,
    '✅ Respostas existentes atualizadas' as dados,
    '✅ Índices criados' as indices,
    '✅ Sistema pronto para exibir respostas Sim/Não' as resultado;
