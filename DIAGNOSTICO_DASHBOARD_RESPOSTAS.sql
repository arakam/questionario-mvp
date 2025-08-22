-- 🔍 DIAGNÓSTICO: Por que a Dashboard não conta respostas?
-- Execute este script no Supabase para investigar o problema

-- 1. VERIFICAR ESTRUTURA DA TABELA RESPOSTAS
SELECT 
  'ESTRUTURA TABELA RESPOSTAS' as info,
  '' as separator;

SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'respostas' 
ORDER BY ordinal_position;

-- 2. VERIFICAR SE EXISTEM RESPOSTAS NO BANCO
SELECT 
  'CONTAGEM DE RESPOSTAS' as info,
  '' as separator;

SELECT 
  'Total de registros na tabela respostas' as descricao,
  COUNT(*) as total
FROM respostas
UNION ALL
SELECT 
  'Respostas com pessoa_id preenchido' as descricao,
  COUNT(*) as total
FROM respostas 
WHERE pessoa_id IS NOT NULL
UNION ALL
SELECT 
  'Respostas com questionario_id preenchido' as descricao,
  COUNT(*) as total
FROM respostas 
WHERE questionario_id IS NOT NULL
UNION ALL
SELECT 
  'Respostas com pergunta_id preenchido' as descricao,
  COUNT(*) as total
FROM respostas 
WHERE pergunta_id IS NOT NULL;

-- 3. VERIFICAR EXEMPLOS DE RESPOSTAS
SELECT 
  'EXEMPLOS DE RESPOSTAS' as info,
  '' as separator;

SELECT 
  id,
  pessoa_id,
  questionario_id,
  pergunta_id,
  tipo_pergunta,
  resposta,
  resposta_texto,
  resposta_escala,
  resposta_multipla,
  respondido_em
FROM respostas 
LIMIT 5;

-- 4. VERIFICAR SE AS RESPOSTAS TÊM RELACIONAMENTOS VÁLIDOS
SELECT 
  'VERIFICAÇÃO DE RELACIONAMENTOS' as info,
  '' as separator;

SELECT 
  'Respostas com pessoa válida' as descricao,
  COUNT(*) as total
FROM respostas r
JOIN pessoas p ON r.pessoa_id = p.id
UNION ALL
SELECT 
  'Respostas com questionário válido' as descricao,
  COUNT(*) as total
FROM respostas r
JOIN questionarios q ON r.questionario_id = q.id
UNION ALL
SELECT 
  'Respostas com pergunta válida' as descricao,
  COUNT(*) as total
FROM respostas r
JOIN perguntas p ON r.pergunta_id = p.id;

-- 5. VERIFICAR SE HÁ PROBLEMAS DE JOIN
SELECT 
  'PROBLEMAS DE JOIN' as info,
  '' as separator;

SELECT 
  'Respostas sem pessoa correspondente' as descricao,
  COUNT(*) as total
FROM respostas r
LEFT JOIN pessoas p ON r.pessoa_id = p.id
WHERE p.id IS NULL
UNION ALL
SELECT 
  'Respostas sem questionário correspondente' as descricao,
  COUNT(*) as total
FROM respostas r
LEFT JOIN questionarios q ON r.questionario_id = q.id
WHERE q.id IS NULL
UNION ALL
SELECT 
  'Respostas sem pergunta correspondente' as descricao,
  COUNT(*) as total
FROM respostas r
LEFT JOIN perguntas p ON r.pergunta_id = p.id
WHERE p.id IS NULL;

-- 6. VERIFICAR A QUERY EXATA DA DASHBOARD
SELECT 
  'QUERY DA DASHBOARD - SIMULAÇÃO' as info,
  '' as separator;

-- Simular exatamente a query da dashboard
SELECT 
  'Total de respostas (COUNT simples)' as tipo_contagem,
  COUNT(*) as total
FROM respostas
UNION ALL
SELECT 
  'Total de respostas (COUNT com head: true)' as tipo_contagem,
  COUNT(*) as total
FROM respostas;

-- 7. VERIFICAR SE HÁ PROBLEMAS DE PERMISSÕES
SELECT 
  'VERIFICAÇÃO DE PERMISSÕES' as info,
  '' as separator;

-- Verificar se o usuário atual tem acesso à tabela
SELECT 
  table_name,
  privilege_type
FROM information_schema.table_privileges 
WHERE table_name = 'respostas'
  AND grantee = current_user;

-- 8. VERIFICAR SE HÁ TRIGGERS OU CONSTRAINTS PROBLEMÁTICOS
SELECT 
  'TRIGGERS E CONSTRAINTS' as info,
  '' as separator;

SELECT 
  trigger_name,
  event_manipulation,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'respostas';

-- 9. VERIFICAR SE HÁ DADOS DE TESTE
SELECT 
  'DADOS DE TESTE' as info,
  '' as separator;

-- Tentar inserir uma resposta de teste
DO $$
DECLARE
  test_pessoa_id UUID;
  test_questionario_id UUID;
  test_pergunta_id UUID;
BEGIN
  -- Pegar IDs válidos para teste
  SELECT id INTO test_pessoa_id FROM pessoas LIMIT 1;
  SELECT id INTO test_questionario_id FROM questionarios LIMIT 1;
  SELECT id INTO test_pergunta_id FROM perguntas LIMIT 1;
  
  IF test_pessoa_id IS NOT NULL AND test_questionario_id IS NOT NULL AND test_pergunta_id IS NOT NULL THEN
    -- Verificar se já existe resposta de teste
    IF NOT EXISTS (
      SELECT 1 FROM respostas 
      WHERE pessoa_id = test_pessoa_id 
        AND questionario_id = test_questionario_id 
        AND pergunta_id = test_pergunta_id
    ) THEN
      -- Inserir resposta de teste
      INSERT INTO respostas (
        pessoa_id, 
        questionario_id, 
        pergunta_id, 
        tipo_pergunta, 
        resposta, 
        resposta_escala
      ) VALUES (
        test_pessoa_id, 
        test_questionario_id, 
        test_pergunta_id, 
        'escala', 
        '5', 
        5
      );
      RAISE NOTICE '✅ Resposta de teste inserida com sucesso';
    ELSE
      RAISE NOTICE 'ℹ️ Resposta de teste já existe';
    END IF;
  ELSE
    RAISE NOTICE '⚠️ Não foi possível executar teste - dados insuficientes';
  END IF;
END $$;

-- 10. VERIFICAR APÓS INSERÇÃO DE TESTE
SELECT 
  'VERIFICAÇÃO APÓS TESTE' as info,
  '' as separator;

SELECT 
  'Total de respostas após teste' as descricao,
  COUNT(*) as total
FROM respostas;

-- 11. RESUMO DO DIAGNÓSTICO
SELECT 
  'RESUMO DO DIAGNÓSTICO' as info,
  '' as separator;

SELECT 
  'Status' as item,
  CASE 
    WHEN (SELECT COUNT(*) FROM respostas) > 0 THEN '✅ Existem respostas no banco'
    ELSE '❌ Nenhuma resposta encontrada'
  END as resultado
UNION ALL
SELECT 
  'Estrutura da tabela' as item,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'respostas' 
        AND column_name IN ('pessoa_id', 'questionario_id', 'pergunta_id')
    ) THEN '✅ Estrutura básica OK'
    ELSE '❌ Estrutura básica com problema'
  END as resultado
UNION ALL
SELECT 
  'Relacionamentos' as item,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM respostas r
      JOIN pessoas p ON r.pessoa_id = p.id
      JOIN questionarios q ON r.questionario_id = q.id
      JOIN perguntas pe ON r.pergunta_id = pe.id
      LIMIT 1
    ) THEN '✅ Relacionamentos OK'
    ELSE '❌ Problemas nos relacionamentos'
  END as resultado;
