-- 🚨 CORREÇÃO URGENTE: Remover Constraints NOT NULL da Tabela Pessoas
-- Execute este script no Supabase para permitir campos opcionais

-- 1. Verificar a estrutura atual da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    CASE 
        WHEN c.constraint_type = 'NOT NULL' THEN 'NOT NULL'
        ELSE 'NULLABLE'
    END as constraint_info
FROM information_schema.columns c
LEFT JOIN information_schema.table_constraints tc ON 
    tc.table_name = c.table_name AND 
    tc.constraint_type = 'NOT NULL'
WHERE c.table_name = 'pessoas'
ORDER BY c.ordinal_position;

-- 2. Remover constraints NOT NULL das colunas opcionais
-- (mantendo apenas nome e email como obrigatórios)

-- Remover NOT NULL do telefone se existir
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pessoas' 
        AND column_name = 'telefone' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE pessoas ALTER COLUMN telefone DROP NOT NULL;
        RAISE NOTICE 'Constraint NOT NULL removida da coluna telefone';
    ELSE
        RAISE NOTICE 'Coluna telefone já permite NULL';
    END IF;
END $$;

-- Remover NOT NULL do cnpj se existir
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pessoas' 
        AND column_name = 'cnpj' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE pessoas ALTER COLUMN cnpj DROP NOT NULL;
        RAISE NOTICE 'Constraint NOT NULL removida da coluna cnpj';
    ELSE
        RAISE NOTICE 'Coluna cnpj já permite NULL';
    END IF;
END $$;

-- Remover NOT NULL da empresa se existir
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pessoas' 
        AND column_name = 'empresa' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE pessoas ALTER COLUMN empresa DROP NOT NULL;
        RAISE NOTICE 'Constraint NOT NULL removida da coluna empresa';
    ELSE
        RAISE NOTICE 'Coluna empresa já permite NULL';
    END IF;
END $$;

-- Remover NOT NULL da qtd_funcionarios se existir
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pessoas' 
        AND column_name = 'qtd_funcionarios' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE pessoas ALTER COLUMN qtd_funcionarios DROP NOT NULL;
        RAISE NOTICE 'Constraint NOT NULL removida da coluna qtd_funcionarios';
    ELSE
        RAISE NOTICE 'Coluna qtd_funcionarios já permite NULL';
    END IF;
END $$;

-- Remover NOT NULL da ramo_atividade se existir
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pessoas' 
        AND column_name = 'ramo_atividade' 
        AND is_nullable = 'NO'
    ) THEN
        ALTER TABLE pessoas ALTER COLUMN ramo_atividade DROP NOT NULL;
        RAISE NOTICE 'Constraint NOT NULL removida da coluna ramo_atividade';
    ELSE
        RAISE NOTICE 'Coluna ramo_atividade já permite NULL';
    END IF;
END $$;

-- 3. Adicionar colunas que podem estar faltando
ALTER TABLE pessoas 
ADD COLUMN IF NOT EXISTS telefone TEXT,
ADD COLUMN IF NOT EXISTS cnpj TEXT,
ADD COLUMN IF NOT EXISTS empresa TEXT,
ADD COLUMN IF NOT EXISTS qtd_funcionarios INTEGER,
ADD COLUMN IF NOT EXISTS ramo_atividade TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 4. Garantir que apenas nome e email sejam obrigatórios
-- (verificar se já estão como NOT NULL)
DO $$
BEGIN
    -- Garantir que nome seja NOT NULL
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pessoas' 
        AND column_name = 'nome' 
        AND is_nullable = 'YES'
    ) THEN
        ALTER TABLE pessoas ALTER COLUMN nome SET NOT NULL;
        RAISE NOTICE 'Coluna nome definida como NOT NULL';
    ELSE
        RAISE NOTICE 'Coluna nome já é NOT NULL';
    END IF;
    
    -- Garantir que email seja NOT NULL
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'pessoas' 
        AND column_name = 'email' 
        AND is_nullable = 'YES'
    ) THEN
        ALTER TABLE pessoas ALTER COLUMN email SET NOT NULL;
        RAISE NOTICE 'Coluna email definida como NOT NULL';
    ELSE
        RAISE NOTICE 'Coluna email já é NOT NULL';
    END IF;
END $$;

-- 5. Adicionar constraint de email único se não existir
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

-- 6. Verificar a estrutura final da tabela
SELECT 
    'ESTRUTURA FINAL DA TABELA PESSOAS' as info,
    '' as separator;

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    CASE 
        WHEN is_nullable = 'NO' THEN 'OBRIGATÓRIO'
        ELSE 'OPCIONAL'
    END as status
FROM information_schema.columns
WHERE table_name = 'pessoas'
ORDER BY ordinal_position;

-- 7. Testar inserção com campos opcionais
DO $$
BEGIN
    -- Tentar inserir uma pessoa com apenas nome e email
    INSERT INTO pessoas (nome, email) 
    VALUES ('Teste Campos Opcionais', 'teste@campos-opcionais.com')
    ON CONFLICT (email) DO NOTHING;
    
    RAISE NOTICE '✅ Teste de inserção com campos opcionais realizado com sucesso';
    
    -- Limpar o teste
    DELETE FROM pessoas WHERE email = 'teste@campos-opcionais.com';
    RAISE NOTICE '🧹 Dados de teste removidos';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE '❌ Erro no teste: %', SQLERRM;
END $$;

-- 8. Resumo das alterações
SELECT 
    'RESUMO DAS ALTERAÇÕES' as info,
    '' as separator;

SELECT 
    'Colunas obrigatórias' as tipo,
    'nome, email' as colunas
UNION ALL
SELECT 
    'Colunas opcionais' as tipo,
    'telefone, cnpj, empresa, qtd_funcionarios, ramo_atividade' as colunas
UNION ALL
SELECT 
    'Status' as tipo,
    '✅ Tabela corrigida para aceitar campos configuráveis' as colunas;
