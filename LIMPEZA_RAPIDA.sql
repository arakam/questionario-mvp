-- 🧹 LIMPEZA RÁPIDA DO BANCO DE DADOS
-- ⚠️ ATENÇÃO: Este script REMOVE TODOS os dados!
-- Execute apenas se tiver certeza de que quer limpar tudo!

-- 1. LIMPEZA RÁPIDA (remove todos os dados, mantém estrutura)
TRUNCATE TABLE respostas CASCADE;
TRUNCATE TABLE pessoas CASCADE;
TRUNCATE TABLE questionarios CASCADE;
TRUNCATE TABLE perguntas CASCADE;
TRUNCATE TABLE categorias CASCADE;
TRUNCATE TABLE admins CASCADE;

-- 2. RESETAR SEQUÊNCIAS (se houver)
-- ALTER SEQUENCE IF EXISTS categorias_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS perguntas_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS questionarios_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS pessoas_id_seq RESTART WITH 1;
-- ALTER SEQUENCE IF EXISTS respostas_id_seq RESTART WITH 1;

-- 3. VERIFICAR LIMPEZA
SELECT 
    'DADOS APÓS LIMPEZA:' as info,
    'pessoas' as tabela,
    COUNT(*) as total_registros
FROM pessoas
UNION ALL
SELECT 
    'DADOS APÓS LIMPEZA:' as info,
    'respostas' as tabela,
    COUNT(*) as total_registros
FROM respostas
UNION ALL
SELECT 
    'DADOS APÓS LIMPEZA:' as info,
    'questionarios' as tabela,
    COUNT(*) as total_registros
FROM questionarios
UNION ALL
SELECT 
    'DADOS APÓS LIMPEZA:' as info,
    'perguntas' as tabela,
    COUNT(*) as total_registros
FROM perguntas
UNION ALL
SELECT 
    'DADOS APÓS LIMPEZA:' as info,
    'categorias' as tabela,
    COUNT(*) as total_registros
FROM categorias;

-- 4. MENSAGEM DE CONCLUSÃO
SELECT 
    '🎉 LIMPEZA RÁPIDA REALIZADA!' as status,
    '✅ Todos os dados foram removidos' as resultado,
    '✅ Estrutura das tabelas mantida' as estrutura,
    '✅ Banco limpo e pronto para uso' as final;
