# 🔧 Configuração do Supabase para o Inquiro

## 📋 Tabela `admins` Necessária

O sistema requer uma tabela `admins` para verificar se um usuário tem permissões de administrador.

### 🗄️ Estrutura da Tabela

```sql
-- Cria a tabela admins
CREATE TABLE IF NOT EXISTS public.admins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    nome TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adiciona políticas de segurança (RLS)
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

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
```

### 👤 Inserir Primeiro Administrador

```sql
-- Insere o primeiro administrador (substitua pelo email correto)
INSERT INTO public.admins (email, nome) 
VALUES ('seu@email.com', 'Seu Nome')
ON CONFLICT (email) DO NOTHING;
```

### 🔍 Verificar Configuração

Após criar a tabela, use a página de debug (`/debug`) para verificar:

1. **🌍 Variáveis de Ambiente**: Confirme que as variáveis do Supabase estão configuradas
2. **🔌 Teste do Supabase**: Verifique a conexão com o banco
3. **🗄️ Estrutura do Banco**: Confirme que a tabela `admins` existe
4. **🔐 Teste de Login**: Teste o login com suas credenciais
5. **👤 Verificar Sessão**: Confirme que você é reconhecido como admin

### 🚨 Problemas Comuns

#### **Tabela `admins` não existe**
- Execute o SQL acima no SQL Editor do Supabase
- Verifique se há erros de sintaxe

#### **Usuário não é reconhecido como admin**
- Verifique se o email está correto na tabela `admins`
- Confirme que o usuário está autenticado no Supabase Auth

#### **Erro de permissão**
- Verifique se as políticas RLS estão configuradas corretamente
- Confirme que o usuário está autenticado

### 📱 Como Acessar o SQL Editor

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá para **SQL Editor** no menu lateral
4. Cole e execute o SQL acima
5. Verifique se não há erros

### 🔐 Configuração de Autenticação

Certifique-se de que:

1. **Email Auth** está habilitado no Supabase
2. **Confirm Email** está configurado conforme necessário
3. **Site URL** está configurado corretamente
4. **Redirect URLs** incluem seu domínio

### 🌐 Variáveis de Ambiente

No arquivo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
NEXT_PUBLIC_SITE_URL=http://localhost:3008
```

### 📞 Suporte

Se continuar com problemas:

1. Use a página de debug (`/debug`) para identificar o problema
2. Verifique os logs do console do navegador
3. Verifique os logs do servidor Next.js
4. Confirme a configuração no Dashboard do Supabase
