-- 🚀 Atualização da Tabela de Questionários para Suportar Campos Configuráveis
-- Execute este script no seu banco Supabase para adicionar os novos campos

-- 1. Adicionar novos campos à tabela questionarios
ALTER TABLE questionarios 
ADD COLUMN IF NOT EXISTS campos_configuraveis JSONB DEFAULT '[
  {
    "id": "nome",
    "label": "Nome",
    "tipo": "texto",
    "obrigatorio": true,
    "ordem": 1,
    "placeholder": "Digite seu nome completo"
  },
  {
    "id": "email",
    "label": "E-mail",
    "tipo": "email",
    "obrigatorio": true,
    "ordem": 2,
    "placeholder": "seu@email.com"
  },
  {
    "id": "telefone",
    "label": "Telefone",
    "tipo": "texto",
    "obrigatorio": true,
    "ordem": 3,
    "placeholder": "(11) 99999-9999"
  },
  {
    "id": "cnpj",
    "label": "CNPJ",
    "tipo": "texto",
    "obrigatorio": true,
    "ordem": 4,
    "placeholder": "00.000.000/0000-00"
  },
  {
    "id": "empresa",
    "label": "Empresa",
    "tipo": "texto",
    "obrigatorio": false,
    "ordem": 5,
    "placeholder": "Nome da empresa"
  },
  {
    "id": "qtd_funcionarios",
    "label": "Quantidade de funcionários",
    "tipo": "numero",
    "obrigatorio": false,
    "ordem": 6,
    "placeholder": "0"
  },
  {
    "id": "ramo_atividade",
    "label": "Ramo de atividade",
    "tipo": "texto",
    "obrigatorio": false,
    "ordem": 7,
    "placeholder": "Ex: Tecnologia, Saúde, Educação"
  }
]'::jsonb;

-- 2. Criar índice para melhorar performance de consultas
CREATE INDEX IF NOT EXISTS idx_questionarios_campos_configuraveis ON questionarios USING GIN (campos_configuraveis);

-- 3. Adicionar comentários para documentar os campos
COMMENT ON COLUMN questionarios.campos_configuraveis IS 'JSON com configuração dos campos de dados pessoais do questionário';

-- 4. Verificar se a atualização foi bem-sucedida
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns 
WHERE table_name = 'questionarios' 
  AND column_name = 'campos_configuraveis'
ORDER BY column_name;

-- 5. Exemplo de estrutura dos campos configuráveis:
/*
{
  "id": "nome_campo",
  "label": "Nome exibido para o usuário",
  "tipo": "texto|email|numero|telefone|cnpj|select",
  "obrigatorio": true|false,
  "ordem": 1,
  "placeholder": "Texto de exemplo",
  "opcoes": ["opcao1", "opcao2"], // apenas para tipo "select"
  "validacao": {
    "min": 0,        // para números
    "max": 100,      // para números
    "minLength": 3,  // para texto
    "maxLength": 50, // para texto
    "pattern": "^[0-9]{14}$" // regex para validação
  }
}
*/

-- 6. Atualizar questionários existentes para ter campos padrão
UPDATE questionarios 
SET campos_configuraveis = '[
  {
    "id": "nome",
    "label": "Nome",
    "tipo": "texto",
    "obrigatorio": true,
    "ordem": 1,
    "placeholder": "Digite seu nome completo"
  },
  {
    "id": "email",
    "label": "E-mail",
    "tipo": "email",
    "obrigatorio": true,
    "ordem": 2,
    "placeholder": "seu@email.com"
  },
  {
    "id": "telefone",
    "label": "Telefone",
    "tipo": "texto",
    "obrigatorio": true,
    "ordem": 3,
    "placeholder": "(11) 99999-9999"
  },
  {
    "id": "cnpj",
    "label": "CNPJ",
    "tipo": "texto",
    "obrigatorio": true,
    "ordem": 4,
    "placeholder": "00.000.000/0000-00"
  },
  {
    "id": "empresa",
    "label": "Empresa",
    "tipo": "texto",
    "obrigatorio": false,
    "ordem": 5,
    "placeholder": "Nome da empresa"
  },
  {
    "id": "qtd_funcionarios",
    "label": "Quantidade de funcionários",
    "tipo": "numero",
    "obrigatorio": false,
    "ordem": 6,
    "placeholder": "0"
  },
  {
    "id": "ramo_atividade",
    "label": "Ramo de atividade",
    "tipo": "texto",
    "obrigatorio": false,
    "ordem": 7,
    "placeholder": "Ex: Tecnologia, Saúde, Educação"
  }
]'::jsonb
WHERE campos_configuraveis IS NULL;
