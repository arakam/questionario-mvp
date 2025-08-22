-- 🔧 CORREÇÃO FINAL DA TABELA RESPOSTAS
-- Execute este script no Supabase para corrigir o campo 'resposta' e permitir diferentes tipos

-- 1. Verificar estrutura atual da tabela respostas
SELECT 
  'ESTRUTURA ATUAL RESPOSTAS' as info,
  '' as separator;

SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'respostas' 
ORDER BY ordinal_position;

-- 2. Verificar constraints da tabela respostas
SELECT 
  'CONSTRAINTS ATUAIS RESPOSTAS' as info,
  '' as separator;

SELECT 
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'respostas'
ORDER BY tc.constraint_type, tc.constraint_name;

-- 3. CORREÇÃO: Alterar o tipo do campo 'resposta' para TEXT
-- Isso permitirá armazenar strings, números como string, etc.
DO $$
BEGIN
  -- Verificar se o campo resposta é BOOLEAN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'respostas' 
      AND column_name = 'resposta' 
      AND data_type = 'boolean'
  ) THEN
    -- Alterar de BOOLEAN para TEXT
    ALTER TABLE respostas ALTER COLUMN resposta TYPE TEXT;
    RAISE NOTICE '✅ Campo resposta alterado de BOOLEAN para TEXT';
  ELSE
    RAISE NOTICE 'ℹ️ Campo resposta já não é BOOLEAN';
  END IF;
END $$;

-- 4. Verificar se a alteração foi aplicada
SELECT 
  'VERIFICACAO APÓS ALTERAÇÃO' as info,
  '' as separator;

SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'respostas' 
  AND column_name = 'resposta';

-- 5. Verificar se as colunas específicas existem
SELECT 
  'VERIFICACAO COLUNAS ESPECÍFICAS' as info,
  '' as separator;

SELECT 
  'resposta_texto' as coluna,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'respostas' AND column_name = 'resposta_texto'
    ) THEN '✅ Existe'
    ELSE '❌ Não existe'
  END as status
UNION ALL
SELECT 
  'resposta_escala' as coluna,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'respostas' AND column_name = 'resposta_escala'
    ) THEN '✅ Existe'
    ELSE '❌ Não existe'
  END as status
UNION ALL
SELECT 
  'resposta_multipla' as coluna,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'respostas' AND column_name = 'resposta_multipla'
    ) THEN '✅ Existe'
    ELSE '❌ Não existe'
  END as status
UNION ALL
SELECT 
  'tipo_pergunta' as coluna,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'respostas' AND column_name = 'tipo_pergunta'
    ) THEN '✅ Existe'
    ELSE '❌ Não existe'
  END as status;

-- 6. Adicionar colunas específicas se não existirem
DO $$
BEGIN
  -- Adicionar resposta_texto se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'respostas' AND column_name = 'resposta_texto'
  ) THEN
    ALTER TABLE respostas ADD COLUMN resposta_texto TEXT;
    RAISE NOTICE '✅ Coluna resposta_texto adicionada';
  ELSE
    RAISE NOTICE 'ℹ️ Coluna resposta_texto já existe';
  END IF;
  
  -- Adicionar resposta_escala se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'respostas' AND column_name = 'resposta_escala'
  ) THEN
    ALTER TABLE respostas ADD COLUMN resposta_escala INTEGER;
    RAISE NOTICE '✅ Coluna resposta_escala adicionada';
  ELSE
    RAISE NOTICE 'ℹ️ Coluna resposta_escala já existe';
  END IF;
  
  -- Adicionar resposta_multipla se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'respostas' AND column_name = 'resposta_multipla'
  ) THEN
    ALTER TABLE respostas ADD COLUMN resposta_multipla TEXT[];
    RAISE NOTICE '✅ Coluna resposta_multipla adicionada';
  ELSE
    RAISE NOTICE 'ℹ️ Coluna resposta_multipla já existe';
  END IF;
  
  -- Adicionar tipo_pergunta se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'respostas' AND column_name = 'tipo_pergunta'
  ) THEN
    ALTER TABLE respostas ADD COLUMN tipo_pergunta TEXT;
    RAISE NOTICE '✅ Coluna tipo_pergunta adicionada';
  ELSE
    RAISE NOTICE 'ℹ️ Coluna tipo_pergunta já existe';
  END IF;
END $$;

-- 7. Adicionar constraint CHECK para tipo_pergunta se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'respostas' 
      AND constraint_name = 'respostas_tipo_pergunta_check'
  ) THEN
    ALTER TABLE respostas 
    ADD CONSTRAINT respostas_tipo_pergunta_check 
    CHECK (tipo_pergunta IN ('sim_nao', 'escala', 'texto_curto', 'texto_longo', 'multipla_escolha_unica', 'multipla_escolha_multipla'));
    RAISE NOTICE '✅ Constraint CHECK para tipo_pergunta adicionada';
  ELSE
    RAISE NOTICE 'ℹ️ Constraint CHECK para tipo_pergunta já existe';
  END IF;
END $$;

-- 8. Testar inserção de diferentes tipos de resposta
SELECT 
  'TESTE DE INSERÇÃO' as info,
  '' as separator;

-- Primeiro, vamos pegar IDs válidos para teste
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
    -- Testar inserção de resposta tipo escala
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
    RAISE NOTICE '✅ Teste de inserção tipo escala: SUCESSO';
    
    -- Limpar teste
    DELETE FROM respostas WHERE pessoa_id = test_pessoa_id AND questionario_id = test_questionario_id AND pergunta_id = test_pergunta_id;
    RAISE NOTICE '🧹 Teste limpo';
  ELSE
    RAISE NOTICE '⚠️ Não foi possível executar teste - dados insuficientes';
  END IF;
END $$;

-- 9. Estrutura final da tabela
SELECT 
  'ESTRUTURA FINAL RESPOSTAS' as info,
  '' as separator;

SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'respostas' 
ORDER BY ordinal_position;

-- 10. Resumo da correção
SELECT 
  'RESUMO DA CORREÇÃO RESPOSTAS' as info,
  '' as separator;

SELECT 
  'Campo resposta é TEXT' as item,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'respostas' 
        AND column_name = 'resposta' 
        AND data_type = 'text'
    ) THEN '✅ Campo resposta é TEXT'
    ELSE '❌ Campo resposta ainda não é TEXT'
  END as resultado
UNION ALL
SELECT 
  'Coluna resposta_texto' as item,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'respostas' AND column_name = 'resposta_texto'
    ) THEN '✅ Coluna resposta_texto existe'
    ELSE '❌ Coluna resposta_texto não existe'
  END as resultado
UNION ALL
SELECT 
  'Coluna resposta_escala' as item,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'respostas' AND column_name = 'resposta_escala'
    ) THEN '✅ Coluna resposta_escala existe'
    ELSE '❌ Coluna resposta_escala não existe'
  END as resultado
UNION ALL
SELECT 
  'Coluna resposta_multipla' as item,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'respostas' AND column_name = 'resposta_multipla'
    ) THEN '✅ Coluna resposta_multipla existe'
    ELSE '❌ Coluna resposta_multipla não existe'
  END as resultado
UNION ALL
SELECT 
  'Coluna tipo_pergunta' as item,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'respostas' AND column_name = 'tipo_pergunta'
    ) THEN '✅ Coluna tipo_pergunta existe'
    ELSE '❌ Coluna tipo_pergunta não existe'
  END as resultado;
