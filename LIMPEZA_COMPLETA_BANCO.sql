-- 🧹 LIMPEZA COMPLETA DO BANCO DE DADOS
-- ⚠️ ATENÇÃO: Este script REMOVE TODOS os dados e recria as tabelas do zero
-- Execute apenas se tiver certeza de que quer limpar tudo!

-- 1. Verificar tabelas existentes antes da limpeza
SELECT 
    'TABELAS EXISTENTES ANTES DA LIMPEZA:' as info,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 2. Verificar dados existentes antes da limpeza
SELECT 
    'DADOS EXISTENTES ANTES DA LIMPEZA:' as info,
    'pessoas' as tabela,
    COUNT(*) as total_registros
FROM pessoas
UNION ALL
SELECT 
    'DADOS EXISTENTES ANTES DA LIMPEZA:' as info,
    'respostas' as tabela,
    COUNT(*) as total_registros
FROM respostas
UNION ALL
SELECT 
    'DADOS EXISTENTES ANTES DA LIMPEZA:' as info,
    'questionarios' as tabela,
    COUNT(*) as total_registros
FROM questionarios
UNION ALL
SELECT 
    'DADOS EXISTENTES ANTES DA LIMPEZA:' as info,
    'perguntas' as tabela,
    COUNT(*) as total_registros
FROM perguntas
UNION ALL
SELECT 
    'DADOS EXISTENTES ANTES DA LIMPEZA:' as info,
    'categorias' as tabela,
    COUNT(*) as total_registros
FROM categorias;

-- 3. DESATIVAR TRIGGERS E CONSTRAINTS (para evitar erros)
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Desativar todos os triggers
    FOR r IN (SELECT trigger_name, event_object_table 
              FROM information_schema.triggers 
              WHERE trigger_schema = 'public') 
    LOOP
        EXECUTE format('ALTER TABLE %I DISABLE TRIGGER ALL', r.event_object_table);
    END LOOP;
    
    RAISE NOTICE '✅ Todos os triggers foram desativados';
END $$;

-- 4. REMOVER TODAS AS TABELAS (ordem correta para evitar dependências)
DROP TABLE IF EXISTS respostas CASCADE;
DROP TABLE IF EXISTS pessoas CASCADE;
DROP TABLE IF EXISTS questionarios CASCADE;
DROP TABLE IF EXISTS perguntas CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;
DROP TABLE IF EXISTS admins CASCADE;

-- 5. REMOVER FUNÇÕES E TRIGGERS CUSTOMIZADOS
DROP FUNCTION IF EXISTS validar_campo_verificacao() CASCADE;

-- 6. VERIFICAR SE AS TABELAS FORAM REMOVIDAS
SELECT 
    'TABELAS APÓS REMOÇÃO:' as info,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 7. RECRIAR TABELAS DO ZERO (estrutura limpa)

-- Tabela categorias
CREATE TABLE categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela perguntas
CREATE TABLE perguntas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    categoria_id UUID REFERENCES categorias(id) ON DELETE CASCADE,
    texto TEXT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    opcoes JSONB,
    obrigatoria BOOLEAN DEFAULT false,
    ordem INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela questionarios
CREATE TABLE questionarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    slug VARCHAR(255) UNIQUE NOT NULL,
    ativo BOOLEAN DEFAULT true,
    campos_configuraveis JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela pessoas
CREATE TABLE pessoas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255), -- Agora permite NULL
    telefone VARCHAR(50),
    cnpj VARCHAR(18),
    empresa VARCHAR(255),
    qtd_funcionarios INTEGER,
    ramo_atividade VARCHAR(255),
    questionario_id UUID REFERENCES questionarios(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela respostas
CREATE TABLE respostas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pessoa_id UUID REFERENCES pessoas(id) ON DELETE CASCADE,
    pergunta_id UUID REFERENCES perguntas(id) ON DELETE CASCADE,
    questionario_id UUID REFERENCES questionarios(id) ON DELETE CASCADE,
    valor TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela admins (se existir)
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_pessoas_questionario_id ON pessoas(questionario_id);
CREATE INDEX IF NOT EXISTS idx_pessoas_email ON pessoas(email) WHERE email IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_pessoas_telefone ON pessoas(telefone) WHERE telefone IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_respostas_pessoa_id ON respostas(pessoa_id);
CREATE INDEX IF NOT EXISTS idx_respostas_pergunta_id ON respostas(pergunta_id);
CREATE INDEX IF NOT EXISTS idx_respostas_questionario_id ON respostas(questionario_id);
CREATE INDEX IF NOT EXISTS idx_perguntas_categoria_id ON perguntas(categoria_id);
CREATE INDEX IF NOT EXISTS idx_questionarios_slug ON questionarios(slug);
CREATE INDEX IF NOT EXISTS idx_questionarios_campos_configuraveis ON questionarios USING GIN(campos_configuraveis);

-- 9. CRIAR CONSTRAINTS ÚNICAS
ALTER TABLE pessoas ADD CONSTRAINT pessoas_email_questionario_id_key UNIQUE (email, questionario_id);
ALTER TABLE pessoas ADD CONSTRAINT pessoas_telefone_questionario_id_key UNIQUE (telefone, questionario_id);

-- 10. CRIAR FUNÇÃO E TRIGGER PARA VALIDAÇÃO DE CAMPOS
CREATE OR REPLACE FUNCTION validar_campo_verificacao()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar se apenas um campo está marcado como verificação
    IF (
        SELECT COUNT(*) 
        FROM jsonb_array_elements(NEW.campos_configuraveis) AS campo 
        WHERE (campo->>'campoVerificacao')::boolean = true
    ) > 1 THEN
        RAISE EXCEPTION 'Apenas um campo pode ser marcado como verificação';
    END IF;
    
    -- Verificar se o campo de verificação é email ou telefone
    IF EXISTS (
        SELECT 1 
        FROM jsonb_array_elements(NEW.campos_configuraveis) AS campo 
        WHERE (campo->>'campoVerificacao')::boolean = true 
        AND campo->>'tipo' NOT IN ('email', 'telefone')
    ) THEN
        RAISE EXCEPTION 'Apenas campos do tipo email ou telefone podem ser marcados como verificação';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_validar_campo_verificacao
    BEFORE INSERT OR UPDATE ON questionarios
    FOR EACH ROW
    EXECUTE FUNCTION validar_campo_verificacao();

-- 11. VERIFICAR ESTRUTURA FINAL
SELECT 
    'ESTRUTURA FINAL APÓS RECRIAÇÃO:' as info,
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- 12. VERIFICAR CONSTRAINTS E TRIGGERS
SELECT 
    'CONSTRAINTS FINAIS:' as info,
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_schema = 'public' 
AND table_name IN ('pessoas', 'questionarios', 'perguntas', 'categorias', 'respostas')
ORDER BY table_name, constraint_type;

SELECT 
    'TRIGGERS FINAIS:' as info,
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 13. MENSAGEM DE CONCLUSÃO
SELECT 
    '🎉 LIMPEZA COMPLETA REALIZADA COM SUCESSO!' as status,
    '✅ Banco de dados limpo e recriado do zero' as resultado,
    '✅ Todas as tabelas foram removidas e recriadas' as detalhes,
    '✅ Estrutura limpa e otimizada' as estrutura,
    '✅ Pronto para uso como novo' as final;
