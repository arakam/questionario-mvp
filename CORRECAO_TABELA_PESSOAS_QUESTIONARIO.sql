-- 🔧 CORREÇÃO DA TABELA PESSOAS PARA SUPORTAR MÚLTIPLOS QUESTIONÁRIOS
-- Execute este script no Supabase para permitir que uma pessoa responda vários questionários

-- 1. Verificar estrutura atual da tabela
SELECT 
  'ESTRUTURA ATUAL' as info,
  '' as separator;

SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'pessoas' 
ORDER BY ordinal_position;

-- 2. Verificar se questionario_id já existe
SELECT 
  'VERIFICACAO QUESTIONARIO_ID' as info,
  '' as separator;

SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'pessoas' AND column_name = 'questionario_id'
    ) THEN '✅ Coluna questionario_id já existe'
    ELSE '❌ Coluna questionario_id não existe - PRECISA CRIAR'
  END as status;

-- 3. Adicionar coluna questionario_id se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'pessoas' AND column_name = 'questionario_id'
  ) THEN
    ALTER TABLE pessoas ADD COLUMN questionario_id UUID;
    RAISE NOTICE '✅ Coluna questionario_id adicionada';
  ELSE
    RAISE NOTICE 'ℹ️ Coluna questionario_id já existe';
  END IF;
END $$;

-- 4. Verificar se há constraint única no email
SELECT 
  'VERIFICACAO CONSTRAINT EMAIL' as info,
  '' as separator;

SELECT 
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'pessoas' 
  AND tc.constraint_type = 'UNIQUE'
  AND kcu.column_name = 'email';

-- 5. Remover constraint única no email se existir (para permitir múltiplos questionários)
-- IMPORTANTE: Remover TODAS as constraints únicas no email
DO $$
DECLARE
  constraint_record RECORD;
BEGIN
  -- Encontrar e remover TODAS as constraints únicas no email
  FOR constraint_record IN
    SELECT tc.constraint_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu 
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.table_name = 'pessoas' 
      AND tc.constraint_type = 'UNIQUE'
      AND kcu.column_name = 'email'
  LOOP
    EXECUTE 'ALTER TABLE pessoas DROP CONSTRAINT ' || quote_ident(constraint_record.constraint_name);
    RAISE NOTICE '✅ Constraint única no email removida: %', constraint_record.constraint_name;
  END LOOP;
  
  IF NOT FOUND THEN
    RAISE NOTICE 'ℹ️ Não há constraints únicas no email para remover';
  END IF;
END $$;

-- 6. Verificar se as constraints foram removidas
SELECT 
  'VERIFICACAO APÓS REMOÇÃO' as info,
  '' as separator;

SELECT 
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'pessoas' 
  AND tc.constraint_type = 'UNIQUE'
  AND kcu.column_name = 'email';

-- 7. Adicionar constraint única composta (email + questionario_id)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'pessoas' 
      AND constraint_name = 'pessoas_email_questionario_unique'
  ) THEN
    ALTER TABLE pessoas 
    ADD CONSTRAINT pessoas_email_questionario_unique 
    UNIQUE (email, questionario_id);
    RAISE NOTICE '✅ Constraint única composta (email + questionario_id) adicionada';
  ELSE
    RAISE NOTICE 'ℹ️ Constraint única composta já existe';
  END IF;
END $$;

-- 8. Adicionar foreign key para questionario_id se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'pessoas' 
      AND constraint_name = 'pessoas_questionario_id_fkey'
  ) THEN
    ALTER TABLE pessoas 
    ADD CONSTRAINT pessoas_questionario_id_fkey 
    FOREIGN KEY (questionario_id) REFERENCES questionarios(id);
    RAISE NOTICE '✅ Foreign key para questionarios adicionada';
  ELSE
    RAISE NOTICE 'ℹ️ Foreign key para questionarios já existe';
  END IF;
END $$;

-- 9. Atualizar registros existentes (se questionario_id for NULL)
-- Para registros existentes, vamos assumir que são do primeiro questionário disponível
DO $$
DECLARE
  primeiro_questionario_id UUID;
BEGIN
  -- Pegar o ID do primeiro questionário
  SELECT id INTO primeiro_questionario_id 
  FROM questionarios 
  ORDER BY created_at ASC 
  LIMIT 1;
  
  IF primeiro_questionario_id IS NOT NULL THEN
    -- Atualizar pessoas existentes sem questionario_id
    UPDATE pessoas 
    SET questionario_id = primeiro_questionario_id 
    WHERE questionario_id IS NULL;
    
    RAISE NOTICE '✅ % registros atualizados com questionario_id: %', 
      (SELECT COUNT(*) FROM pessoas WHERE questionario_id = primeiro_questionario_id),
      primeiro_questionario_id;
  ELSE
    RAISE NOTICE '⚠️ Nenhum questionário encontrado para atualizar registros existentes';
  END IF;
END $$;

-- 10. Verificar estrutura final
SELECT 
  'ESTRUTURA FINAL' as info,
  '' as separator;

SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'pessoas' 
ORDER BY ordinal_position;

-- 11. Verificar constraints finais
SELECT 
  'CONSTRAINTS FINAIS' as info,
  '' as separator;

SELECT 
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  CASE 
    WHEN tc.constraint_type = 'UNIQUE' AND kcu.column_name = 'email' THEN 'email + questionario_id'
    WHEN tc.constraint_type = 'FOREIGN KEY' AND kcu.column_name = 'questionario_id' THEN 'questionarios(id)'
    ELSE kcu.column_name
  END as detalhes
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'pessoas'
ORDER BY tc.constraint_type, tc.constraint_name;

-- 12. Testar inserção de múltiplas pessoas com mesmo email em questionários diferentes
-- Usar UUIDs válidos para teste
DO $$
DECLARE
  test_email text := 'teste@multiplos.com';
  test_questionario_1 UUID;
  test_questionario_2 UUID;
BEGIN
  -- Pegar IDs reais de questionários existentes
  SELECT id INTO test_questionario_1 FROM questionarios ORDER BY created_at ASC LIMIT 1;
  SELECT id INTO test_questionario_2 FROM questionarios ORDER BY created_at ASC LIMIT 1 OFFSET 1;
  
  -- Se não houver 2 questionários, usar o mesmo para teste
  IF test_questionario_2 IS NULL THEN
    test_questionario_2 := test_questionario_1;
  END IF;
  
  -- Limpar dados de teste anteriores (se existirem)
  DELETE FROM pessoas WHERE email = test_email;
  
  -- Tentar inserir pessoa 1 (deve funcionar)
  INSERT INTO pessoas (nome, email, questionario_id) 
  VALUES ('Teste 1', test_email, test_questionario_1);
  RAISE NOTICE '✅ Pessoa 1 inserida com sucesso';
  
  -- Tentar inserir pessoa 2 com mesmo email em questionário diferente (deve funcionar)
  INSERT INTO pessoas (nome, email, questionario_id) 
  VALUES ('Teste 2', test_email, test_questionario_2);
  RAISE NOTICE '✅ Pessoa 2 inserida com sucesso (mesmo email, questionário diferente)';
  
  -- Tentar inserir pessoa 3 com mesmo email no mesmo questionário (deve falhar)
  BEGIN
    INSERT INTO pessoas (nome, email, questionario_id) 
    VALUES ('Teste 3', test_email, test_questionario_1);
    RAISE NOTICE '⚠️ Pessoa 3 inserida (não deveria ter funcionado)';
  EXCEPTION WHEN unique_violation THEN
    RAISE NOTICE '✅ Constraint única funcionando: não permitiu duplicata email+questionario';
  END;
  
  -- Limpar os testes
  DELETE FROM pessoas WHERE email = test_email;
  RAISE NOTICE '🧹 Testes limpos';
END $$;

-- 13. Resumo da correção
SELECT 
  'RESUMO DA CORREÇÃO' as info,
  '' as separator;

SELECT 
  'Coluna questionario_id' as item,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'pessoas' AND column_name = 'questionario_id'
    ) THEN '✅ Coluna questionario_id existe'
    ELSE '❌ Coluna questionario_id não existe'
  END as resultado
UNION ALL
SELECT 
  'Constraint única composta' as item,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE table_name = 'pessoas' 
        AND constraint_name = 'pessoas_email_questionario_unique'
    ) THEN '✅ Constraint única (email + questionario_id) configurada'
    ELSE '❌ Constraint única composta não configurada'
  END as resultado
UNION ALL
SELECT 
  'Foreign key questionarios' as item,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE table_name = 'pessoas' 
        AND constraint_name = 'pessoas_questionario_id_fkey'
    ) THEN '✅ Foreign key para questionarios configurada'
    ELSE '❌ Foreign key para questionarios não configurada'
  END as resultado
UNION ALL
SELECT 
  'Registros com questionario_id' as item,
  (SELECT COUNT(*)::text FROM pessoas WHERE questionario_id IS NOT NULL) || ' registros' as resultado;
