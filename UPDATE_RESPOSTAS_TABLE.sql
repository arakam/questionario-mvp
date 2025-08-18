-- 🚀 Atualização da Tabela de Respostas para Suportar Múltiplos Tipos de Pergunta
-- Execute este script no seu banco Supabase para adicionar os novos campos

-- 1. Adicionar novos campos à tabela respostas
ALTER TABLE respostas 
ADD COLUMN IF NOT EXISTS resposta_texto TEXT,
ADD COLUMN IF NOT EXISTS resposta_escala INTEGER,
ADD COLUMN IF NOT EXISTS resposta_multipla JSONB,
ADD COLUMN IF NOT EXISTS tipo_pergunta VARCHAR(50) DEFAULT 'sim_nao';

-- 2. Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_respostas_tipo_pergunta ON respostas(tipo_pergunta);
CREATE INDEX IF NOT EXISTS idx_respostas_escala ON respostas(resposta_escala);

-- 3. Adicionar constraint para validar tipos válidos
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

-- 4. Atualizar respostas existentes para ter tipo padrão
UPDATE respostas 
SET tipo_pergunta = 'sim_nao' 
WHERE tipo_pergunta IS NULL;

-- 5. Adicionar comentários para documentar os campos
COMMENT ON COLUMN respostas.resposta_texto IS 'Resposta para perguntas de texto (curto ou longo)';
COMMENT ON COLUMN respostas.resposta_escala IS 'Valor numérico para perguntas de escala';
COMMENT ON COLUMN respostas.resposta_multipla IS 'JSON com opções selecionadas para múltipla escolha';
COMMENT ON COLUMN respostas.tipo_pergunta IS 'Tipo da pergunta respondida (para compatibilidade)';

-- 6. Verificar se a atualização foi bem-sucedida
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'respostas' 
  AND column_name IN ('resposta_texto', 'resposta_escala', 'resposta_multipla', 'tipo_pergunta')
ORDER BY column_name;

-- 7. Exemplo de dados de teste (opcional)
-- INSERT INTO respostas (pessoa_id, questionario_id, pergunta_id, tipo_pergunta, resposta_escala) VALUES
-- (
--   'uuid-da-pessoa',
--   'uuid-do-questionario', 
--   'uuid-da-pergunta-escala',
--   'escala',
--   8
-- );

-- 8. Verificar estrutura final da tabela
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'respostas'
ORDER BY ordinal_position;
