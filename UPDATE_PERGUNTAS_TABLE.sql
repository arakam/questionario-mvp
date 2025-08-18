-- 🚀 Atualização da Tabela de Perguntas para Suportar Múltiplos Tipos
-- Execute este script no seu banco Supabase para adicionar os novos campos

-- 1. Adicionar novos campos à tabela perguntas
ALTER TABLE perguntas 
ADD COLUMN IF NOT EXISTS tipo VARCHAR(50) DEFAULT 'sim_nao',
ADD COLUMN IF NOT EXISTS opcoes JSONB,
ADD COLUMN IF NOT EXISTS config_escala JSONB;

-- 2. Criar índice para melhorar performance de consultas por tipo
CREATE INDEX IF NOT EXISTS idx_perguntas_tipo ON perguntas(tipo);

-- 3. Adicionar constraint para validar tipos válidos
ALTER TABLE perguntas 
ADD CONSTRAINT check_tipo_valido 
CHECK (tipo IN (
  'sim_nao',
  'multipla_escolha_unica', 
  'multipla_escolha_multipla',
  'escala',
  'texto_curto',
  'texto_longo'
));

-- 4. Atualizar perguntas existentes para ter tipo padrão
UPDATE perguntas 
SET tipo = 'sim_nao' 
WHERE tipo IS NULL;

-- 5. Adicionar comentários para documentar os campos
COMMENT ON COLUMN perguntas.tipo IS 'Tipo da pergunta: sim_nao, multipla_escolha_unica, multipla_escolha_multipla, escala, texto_curto, texto_longo';
COMMENT ON COLUMN perguntas.opcoes IS 'JSON com opções para perguntas de múltipla escolha';
COMMENT ON COLUMN perguntas.config_escala IS 'JSON com configuração de escala (min, max, passo)';

-- 6. Verificar se a atualização foi bem-sucedida
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'perguntas' 
  AND column_name IN ('tipo', 'opcoes', 'config_escala')
ORDER BY column_name;

-- 7. Exemplo de dados de teste (opcional)
-- INSERT INTO perguntas (texto, peso, ativa, tipo, opcoes, config_escala) VALUES
-- (
--   'Qual sua satisfação com o serviço?',
--   2,
--   true,
--   'escala',
--   NULL,
--   '{"escalaMin": 1, "escalaMax": 10, "escalaPasso": 1}'::jsonb
-- ),
-- (
--   'Quais recursos você mais utiliza?',
--   1,
--   true,
--   'multipla_escolha_multipla',
--   '[{"id": "1", "texto": "Relatórios", "valor": "relatorios"}, {"id": "2", "texto": "Dashboard", "valor": "dashboard"}]'::jsonb,
--   NULL
-- );
