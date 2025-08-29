-- 🔧 Correção da Estrutura da Tabela Respostas
-- Execute este script para corrigir o tipo do campo 'resposta'

-- 1. Verificar estrutura atual
SELECT 
    'ESTRUTURA ATUAL:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'respostas'
ORDER BY ordinal_position;

-- 2. Verificar dados existentes no campo resposta
SELECT 
    'DADOS EXISTENTES:' as info,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN resposta IS NOT NULL THEN 1 END) as com_resposta,
    COUNT(CASE WHEN resposta IS NULL THEN 1 END) as sem_resposta,
    COUNT(CASE WHEN resposta = 'true' THEN 1 END) as valor_true_text,
    COUNT(CASE WHEN resposta = 'false' THEN 1 END) as valor_false_text,
    COUNT(CASE WHEN resposta = 'sim' THEN 1 END) as valor_sim,
    COUNT(CASE WHEN resposta = 'não' THEN 1 END) as valor_nao,
    COUNT(CASE WHEN resposta = 'nao' THEN 1 END) as valor_nao_sem_acento
FROM respostas;

-- 3. Verificar alguns exemplos de dados
SELECT 
    'EXEMPLOS DE DADOS:' as info,
    id,
    pergunta_id,
    resposta,
    tipo_pergunta,
    respondido_em
FROM respostas 
WHERE resposta IS NOT NULL
ORDER BY respondido_em DESC
LIMIT 10;

-- 4. Criar campo temporário para backup
ALTER TABLE respostas ADD COLUMN IF NOT EXISTS resposta_backup TEXT;

-- 5. Fazer backup dos dados existentes
UPDATE respostas 
SET resposta_backup = resposta 
WHERE resposta IS NOT NULL;

-- 6. Alterar o tipo do campo resposta de TEXT para BOOLEAN
-- Primeiro, remover a constraint NOT NULL temporariamente
ALTER TABLE respostas ALTER COLUMN resposta DROP NOT NULL;

-- 7. Converter dados existentes para boolean
UPDATE respostas 
SET resposta = CASE 
    WHEN resposta_backup ILIKE 'true' OR resposta_backup ILIKE 'sim' OR resposta_backup = '1' THEN 'true'
    WHEN resposta_backup ILIKE 'false' OR resposta_backup ILIKE 'não' OR resposta_backup ILIKE 'nao' OR resposta_backup = '0' THEN 'false'
    ELSE NULL
END
WHERE resposta_backup IS NOT NULL;

-- 8. Alterar o tipo da coluna para BOOLEAN
ALTER TABLE respostas ALTER COLUMN resposta TYPE BOOLEAN USING resposta::boolean;

-- 9. Restaurar constraint NOT NULL
ALTER TABLE respostas ALTER COLUMN resposta SET NOT NULL;

-- 10. Verificar se a conversão foi bem-sucedida
SELECT 
    'VERIFICAÇÃO PÓS-CONVERSÃO:' as info,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN resposta = true THEN 1 END) as respostas_true,
    COUNT(CASE WHEN resposta = false THEN 1 END) as respostas_false,
    COUNT(CASE WHEN resposta IS NULL THEN 1 END) as respostas_null
FROM respostas;

-- 11. Verificar estrutura final
SELECT 
    'ESTRUTURA FINAL:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'respostas'
ORDER BY ordinal_position;

-- 12. Verificar alguns exemplos convertidos
SELECT 
    'EXEMPLOS CONVERTIDOS:' as info,
    id,
    pergunta_id,
    resposta,
    pg_typeof(resposta) as tipo_atual,
    tipo_pergunta,
    respondido_em
FROM respostas 
WHERE resposta IS NOT NULL
ORDER BY respondido_em DESC
LIMIT 10;

-- 13. Limpar campo de backup (opcional)
-- ALTER TABLE respostas DROP COLUMN resposta_backup;

-- 14. Mensagem de conclusão
SELECT 
    '🎉 CORREÇÃO CONCLUÍDA!' as status,
    '✅ Campo resposta convertido para BOOLEAN' as campo,
    '✅ Dados existentes convertidos automaticamente' as dados,
    '✅ Sistema pronto para exibir respostas Sim/Não' as resultado;
