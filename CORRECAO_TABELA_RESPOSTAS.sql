-- 🔧 CORREÇÃO DA TABELA RESPOSTAS
-- Execute este script no Supabase para resolver o problema de constraint NOT NULL

-- 1. Verificar estrutura atual da tabela
SELECT 
  'ESTRUTURA ATUAL' as info,
  '' as separator;

SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default,
  CASE 
    WHEN column_name = 'resposta' THEN 'CAMPO_PRINCIPAL'
    WHEN column_name IN ('resposta_texto', 'resposta_escala', 'resposta_multipla') THEN 'CAMPO_ESPECIFICO'
    ELSE 'OUTRO'
  END as tipo_campo
FROM information_schema.columns 
WHERE table_name = 'respostas' 
ORDER BY ordinal_position;

-- 2. Verificar constraints da tabela
SELECT 
  'CONSTRAINTS ATUAIS' as info,
  '' as separator;

SELECT 
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.check_constraints cc 
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'respostas'
ORDER BY tc.constraint_type, tc.constraint_name;

-- 3. Verificar se o campo 'resposta' tem constraint NOT NULL
SELECT 
  'VERIFICACAO NOT NULL' as info,
  '' as separator;

SELECT 
  column_name,
  is_nullable,
  CASE 
    WHEN is_nullable = 'NO' THEN '❌ TEM NOT NULL - PRECISA CORRIGIR'
    WHEN is_nullable = 'YES' THEN '✅ ACEITA NULL - OK'
    ELSE '❓ INDEFINIDO'
  END as status
FROM information_schema.columns 
WHERE table_name = 'respostas' 
  AND column_name = 'resposta';

-- 4. CORREÇÃO: Tornar o campo 'resposta' nullable se necessário
DO $$
BEGIN
  -- Verificar se o campo resposta tem constraint NOT NULL
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'respostas' 
      AND column_name = 'resposta' 
      AND is_nullable = 'NO'
  ) THEN
    -- Remover constraint NOT NULL
    ALTER TABLE respostas ALTER COLUMN resposta DROP NOT NULL;
    RAISE NOTICE '✅ Constraint NOT NULL removida do campo resposta';
  ELSE
    RAISE NOTICE 'ℹ️ Campo resposta já aceita NULL';
  END IF;
END $$;

-- 5. Verificar se as colunas específicas existem
SELECT 
  'VERIFICACAO COLUNAS ESPECIFICAS' as info,
  '' as separator;

SELECT 
  COUNT(*) as total_colunas,
  COUNT(CASE WHEN column_name = 'resposta_texto' THEN 1 END) as tem_resposta_texto,
  COUNT(CASE WHEN column_name = 'resposta_escala' THEN 1 END) as tem_resposta_escala,
  COUNT(CASE WHEN column_name = 'resposta_multipla' THEN 1 END) as tem_resposta_multipla,
  COUNT(CASE WHEN column_name = 'tipo_pergunta' THEN 1 END) as tem_tipo_pergunta
FROM information_schema.columns 
WHERE table_name = 'respostas';

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
    ALTER TABLE respostas ADD COLUMN resposta_multipla JSONB;
    RAISE NOTICE '✅ Coluna resposta_multipla adicionada';
  ELSE
    RAISE NOTICE 'ℹ️ Coluna resposta_multipla já existe';
  END IF;

  -- Adicionar tipo_pergunta se não existir
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'respostas' AND column_name = 'tipo_pergunta'
  ) THEN
    ALTER TABLE respostas ADD COLUMN tipo_pergunta VARCHAR(50) DEFAULT 'sim_nao';
    RAISE NOTICE '✅ Coluna tipo_pergunta adicionada';
  ELSE
    RAISE NOTICE 'ℹ️ Coluna tipo_pergunta já existe';
  END IF;
END $$;

-- 7. Adicionar constraint para validar tipos válidos se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.check_constraints 
    WHERE constraint_name = 'check_tipo_pergunta_valido'
  ) THEN
    ALTER TABLE respostas 
    ADD CONSTRAINT check_tipo_pergunta_valido 
    CHECK (tipo_pergunta IN (
      'sim_nao',
      'multipla_escolha_unica', 
      'multipla_escolha_multipla',
      'escala',
      'texto_curto',
      'texto_longo'
    ));
    RAISE NOTICE '✅ Constraint de tipo_pergunta válido adicionada';
  ELSE
    RAISE NOTICE 'ℹ️ Constraint de tipo_pergunta já existe';
  END IF;
END $$;

-- 8. Atualizar respostas existentes para ter tipo padrão
UPDATE respostas 
SET tipo_pergunta = 'sim_nao' 
WHERE tipo_pergunta IS NULL;

-- 9. Verificar estrutura final
SELECT 
  'ESTRUTURA FINAL' as info,
  '' as separator;

SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default,
  CASE 
    WHEN column_name = 'resposta' THEN 'CAMPO_PRINCIPAL'
    WHEN column_name IN ('resposta_texto', 'resposta_escala', 'resposta_multipla') THEN 'CAMPO_ESPECIFICO'
    ELSE 'OUTRO'
  END as tipo_campo
FROM information_schema.columns 
WHERE table_name = 'respostas' 
ORDER BY ordinal_position;

-- 10. Verificar constraints finais
SELECT 
  'CONSTRAINTS FINAIS' as info,
  '' as separator;

SELECT 
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.check_constraints cc 
  ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'respostas'
ORDER BY tc.constraint_type, tc.constraint_name;

-- 11. Testar inserção de resposta de escala
DO $$
DECLARE
  test_pessoa_id UUID := '00000000-0000-0000-0000-000000000000';
  test_questionario_id UUID := '00000000-0000-0000-0000-000000000000';
  test_pergunta_id UUID := '00000000-0000-0000-0000-000000000000';
BEGIN
  -- Tentar inserir resposta de escala (deve funcionar agora)
  BEGIN
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
      '5', -- resposta como string
      5    -- resposta_escala como integer
    );
    
    RAISE NOTICE '✅ Teste de inserção de escala funcionou!';
    
    -- Limpar o teste
    DELETE FROM respostas WHERE pessoa_id = test_pessoa_id;
    
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Teste falhou: %', SQLERRM;
  END;
END $$;

-- 12. Resumo da correção
SELECT 
  'RESUMO DA CORREÇÃO' as info,
  '' as separator;

SELECT 
  'Status' as item,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'respostas' 
        AND column_name = 'resposta' 
        AND is_nullable = 'YES'
    ) THEN '✅ Campo resposta aceita NULL'
    ELSE '❌ Campo resposta ainda tem NOT NULL'
  END as resultado
UNION ALL
SELECT 
  'Colunas específicas' as item,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'respostas' 
        AND column_name IN ('resposta_texto', 'resposta_escala', 'resposta_multipla')
    ) THEN '✅ Todas as colunas específicas existem'
    ELSE '❌ Faltam colunas específicas'
  END as resultado
UNION ALL
SELECT 
  'Constraint tipo_pergunta' as item,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.check_constraints 
      WHERE constraint_name = 'check_tipo_pergunta_valido'
    ) THEN '✅ Constraint de tipo válido configurada'
    ELSE '❌ Constraint de tipo não configurada'
  END as resultado;
