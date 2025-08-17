# 🚀 Configuração de Produção - VPS/Hostinger

## 🔧 Configuração das Variáveis de Ambiente

Para resolver o problema de redirecionamento para localhost, configure as seguintes variáveis de ambiente na sua VPS:

### 1. Arquivo `.env.local` na raiz do projeto:

```bash
# Configurações do Supabase
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase

# ⚠️ IMPORTANTE: URL do site em produção
NEXT_PUBLIC_SITE_URL=https://seudominio.com

# Configurações de ambiente
NODE_ENV=production
```

### 2. Configuração no painel da Hostinger:

Se estiver usando Hostinger, configure as variáveis de ambiente no painel de controle:

1. Acesse o painel da Hostinger
2. Vá para "Sites" → Seu domínio
3. Clique em "Gerenciar"
4. Vá para "Configurações" → "Variáveis de Ambiente"
5. Adicione as variáveis acima

### 3. Configuração via SSH (se disponível):

```bash
# Conecte via SSH na sua VPS
ssh usuario@seudominio.com

# Navegue até o diretório do projeto
cd /caminho/para/questionario-mvp

# Crie/edite o arquivo .env.local
nano .env.local

# Adicione as variáveis e salve
```

## 🐛 Problemas Comuns e Soluções

### Problema: Redirecionamento para localhost
**Solução**: Configure `NEXT_PUBLIC_SITE_URL` com o domínio correto

### Problema: Logout não funciona
**Solução**: Verifique se a rota `/admin/logout` está acessível

### Problema: Acesso não autorizado após logout
**Solução**: O middleware e SessionChecker já estão configurados para resolver isso

## 🔒 Configurações de Segurança

### 1. Headers de Segurança
O `next.config.ts` já está configurado com headers de segurança básicos.

### 2. Middleware de Autenticação
O middleware verifica autenticação em todas as rotas `/admin/*`

### 3. Verificação de Admin
Todas as rotas protegidas verificam se o usuário está na tabela `admins`

## 📱 Testando a Configuração

### 1. Teste de Login:
- Acesse `https://seudominio.com/admin/login`
- Faça login com credenciais válidas
- Deve redirecionar para `https://seudominio.com/admin`

### 2. Teste de Logout:
- Faça login no sistema
- Clique em "Sair"
- Deve redirecionar para `https://seudominio.com/admin/login`

### 3. Teste de Acesso Negado:
- Tente acessar `/admin` sem estar logado
- Deve redirecionar para login com mensagem de erro

## 🚀 Deploy na VPS

### 1. Build do Projeto:
```bash
npm run build
```

### 2. Iniciar em Produção:
```bash
npm start
```

### 3. Usando PM2 (Recomendado):
```bash
# Instalar PM2
npm install -g pm2

# Iniciar aplicação
pm2 start npm --name "inquiro" -- start

# Salvar configuração
pm2 save

# Configurar para iniciar com o sistema
pm2 startup
```

## 📞 Suporte

Se ainda houver problemas:

1. Verifique os logs da aplicação
2. Confirme se as variáveis de ambiente estão corretas
3. Teste o login/logout em modo incógnito
4. Verifique se o domínio está configurado corretamente na Hostinger
