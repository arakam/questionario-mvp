-- 🔧 Script para criar a tabela admins no Supabase
-- Execute este SQL no SQL Editor do Supabase

-- 1. Cria a tabela admins
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    nome TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Habilita Row Level Security (RLS)
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- 3. Cria políticas de segurança
-- Política para permitir leitura apenas para usuários autenticados
CREATE POLICY "Usuários autenticados podem ler admins" ON public.admins
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para permitir inserção apenas para usuários autenticados
CREATE POLICY "Usuários autenticados podem inserir admins" ON public.admins
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Política para permitir atualização apenas para usuários autenticados
CREATE POLICY "Usuários autenticados podem atualizar admins" ON public.admins
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Política para permitir exclusão apenas para usuários autenticados
CREATE POLICY "Usuários autenticados podem excluir admins" ON public.admins
    FOR DELETE USING (auth.role() = 'authenticated');

-- 4. Insere o primeiro administrador (substitua pelo email correto)
INSERT INTO public.admins (email, nome) 
VALUES ('aramis@unityerp.com.br', 'Aramis')
ON CONFLICT (email) DO NOTHING;

-- 5. Verifica se foi criado
SELECT * FROM public.admins;
