-- 🔍 Verificação das Colunas da Tabela Respostas
-- Execute este script no Supabase para verificar se as colunas foram criadas

-- 1. Verificar estrutura atual da tabela
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default,
  CASE 
    WHEN column_name IN ('resposta_texto', 'resposta_escala', 'resposta_multipla', 'tipo_pergunta') 
    THEN 'NOVA_COLUNA' 
    ELSE 'COLUNA_EXISTENTE' 
  END as status
FROM information_schema.columns 
WHERE table_name = 'respostas' 
ORDER BY ordinal_position;

-- 2. Verificar se as novas colunas existem
SELECT 
  COUNT(*) as total_colunas,
  COUNT(CASE WHEN column_name = 'resposta_texto' THEN 1 END) as tem_resposta_texto,
  COUNT(CASE WHEN column_name = 'resposta_escala' THEN 1 END) as tem_resposta_escala,
  COUNT(CASE WHEN column_name = 'resposta_multipla' THEN 1 END) as tem_resposta_multipla,
  COUNT(CASE WHEN column_name = 'tipo_pergunta' THEN 1 END) as tem_tipo_pergunta
FROM information_schema.columns 
WHERE table_name = 'respostas';

-- 3. Verificar dados de exemplo (se existirem)
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
  created_at
FROM respostas 
ORDER BY created_at DESC 
LIMIT 5;

-- 4. Verificar se há respostas de escala
SELECT 
  COUNT(*) as total_respostas_escala,
  COUNT(CASE WHEN resposta_escala IS NOT NULL THEN 1 END) as com_valor_escala,
  COUNT(CASE WHEN resposta_escala IS NULL THEN 1 END) as sem_valor_escala
FROM respostas 
WHERE tipo_pergunta = 'escala';

-- 5. Verificar constraint de tipo_pergunta
SELECT 
  constraint_name,
  constraint_type,
  check_clause
FROM information_schema.check_constraints 
WHERE constraint_name LIKE '%tipo_pergunta%';

-- 6. Verificar índices
SELECT 
  indexname,
  tablename,
  indexdef
FROM pg_indexes 
WHERE tablename = 'respostas' 
  AND indexname LIKE '%tipo_pergunta%' 
   OR indexname LIKE '%escala%';

-- 7. Se as colunas não existirem, execute o script de atualização:
-- UPDATE_RESPOSTAS_TABLE.sql
