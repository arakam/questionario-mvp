-- 🚀 Atualização da Tabela de Pessoas para Suportar Campos Configuráveis
-- Execute este script no seu banco Supabase para permitir campos dinâmicos

-- 1. Verificar se a tabela pessoas existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'pessoas') THEN
        -- Criar tabela se não existir
        CREATE TABLE pessoas (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            nome TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            telefone TEXT,
            cnpj TEXT,
            empresa TEXT,
            qtd_funcionarios INTEGER,
            ramo_atividade TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Criar índices para performance
        CREATE INDEX IF NOT EXISTS idx_pessoas_email ON pessoas(email);
        CREATE INDEX IF NOT EXISTS idx_pessoas_cnpj ON pessoas(cnpj);
        CREATE INDEX IF NOT EXISTS idx_pessoas_created_at ON pessoas(created_at);
        
        RAISE NOTICE 'Tabela pessoas criada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela pessoas já existe';
    END IF;
END $$;

-- 2. Adicionar colunas que podem estar faltando (se a tabela já existir)
ALTER TABLE pessoas 
ADD COLUMN IF NOT EXISTS telefone TEXT,
ADD COLUMN IF NOT EXISTS cnpj TEXT,
ADD COLUMN IF NOT EXISTS empresa TEXT,
ADD COLUMN IF NOT EXISTS qtd_funcionarios INTEGER,
ADD COLUMN IF NOT EXISTS ramo_atividade TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 3. Adicionar constraint de email único se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'pessoas_email_key'
    ) THEN
        ALTER TABLE pessoas ADD CONSTRAINT pessoas_email_key UNIQUE (email);
        RAISE NOTICE 'Constraint de email único adicionada';
    ELSE
        RAISE NOTICE 'Constraint de email único já existe';
    END IF;
END $$;

-- 4. Criar função para atualizar o timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Criar trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_pessoas_updated_at ON pessoas;
CREATE TRIGGER update_pessoas_updated_at
    BEFORE UPDATE ON pessoas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 6. Verificar a estrutura final da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'pessoas'
ORDER BY ordinal_position;

-- 7. Inserir dados de exemplo (opcional)
-- INSERT INTO pessoas (nome, email, telefone, cnpj, empresa, qtd_funcionarios, ramo_atividade)
-- VALUES 
--     ('João Silva', 'joao@exemplo.com', '(11) 99999-9999', '12.345.678/0001-90', 'Empresa A', 50, 'Tecnologia'),
--     ('Maria Santos', 'maria@exemplo.com', '(11) 88888-8888', '98.765.432/0001-10', 'Empresa B', 25, 'Saúde')
-- ON CONFLICT (email) DO NOTHING;

-- 8. Comentários para documentar a tabela
COMMENT ON TABLE pessoas IS 'Tabela para armazenar dados pessoais dos respondentes dos questionários';
COMMENT ON COLUMN pessoas.nome IS 'Nome completo da pessoa';
COMMENT ON COLUMN pessoas.email IS 'Email único da pessoa (usado para identificação)';
COMMENT ON COLUMN pessoas.telefone IS 'Telefone de contato';
COMMENT ON COLUMN pessoas.cnpj IS 'CNPJ da empresa (opcional)';
COMMENT ON COLUMN pessoas.empresa IS 'Nome da empresa (opcional)';
COMMENT ON COLUMN pessoas.qtd_funcionarios IS 'Quantidade de funcionários (opcional)';
COMMENT ON COLUMN pessoas.ramo_atividade IS 'Ramo de atividade (opcional)';

-- 9. Verificar se tudo foi criado corretamente
SELECT 
    'Tabela pessoas' as item,
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'pessoas') 
        THEN '✅ Criada' 
        ELSE '❌ Não criada' 
    END as status
UNION ALL
SELECT 
    'Constraint email único' as item,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'pessoas_email_key') 
        THEN '✅ Existe' 
        ELSE '❌ Não existe' 
    END as status
UNION ALL
SELECT 
    'Trigger updated_at' as item,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_pessoas_updated_at') 
        THEN '✅ Existe' 
        ELSE '❌ Não existe' 
    END as status;
