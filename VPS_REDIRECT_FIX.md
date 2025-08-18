# 🚀 Correção de Redirecionamento para localhost na VPS

## 🔍 **Problema Identificado**

O sistema está redirecionando para `https://localhost:3008/admin/login?error=admin_check` em vez de usar o domínio correto `https://inquiro.unityerp.app`.

## 🛠️ **Correções Implementadas**

### **1. Middleware Corrigido** (`src/middleware.ts`)
- ✅ Agora usa `getBaseUrl()` em vez de `req.nextUrl.clone()`
- ✅ Garante redirecionamentos para a URL correta

### **2. Rota de Login Corrigida** (`src/app/admin/login/action/route.ts`)
- ✅ Remove uso de `req.url` que causava localhost
- ✅ Usa `getBaseUrl()` para URLs de erro

### **3. Função getBaseUrl() Melhorada** (`src/lib/urlUtils.ts`)
- ✅ Validação contra URLs com localhost
- ✅ Logs mais detalhados para debug
- ✅ Fallback seguro para produção

### **4. Configuração Next.js Melhorada** (`next.config.ts`)
- ✅ Headers de segurança para produção
- ✅ Configurações de host para produção

## 🚀 **Passos para Aplicar na VPS**

### **1. Atualizar o Código**
```bash
# Na sua VPS, navegue até o projeto
cd /caminho/para/questionario-mvp

# Faça pull das alterações (se usando Git)
git pull origin main

# OU copie os arquivos corrigidos manualmente
```

### **2. Verificar Variáveis de Ambiente**
Confirme que o `.env.production` contém:
```bash
NEXT_PUBLIC_SITE_URL=https://inquiro.unityerp.app
NEXT_PUBLIC_BASE_URL=https://inquiro.unityerp.app
NODE_ENV=production
```

### **3. Rebuild e Reiniciar**
```bash
# Instalar dependências (se necessário)
npm install

# Build para produção
npm run build

# Reiniciar o servidor
# Se usando PM2:
pm2 restart all

# Se usando npm:
npm start

# Se usando outro processo, pare e inicie novamente
```

## 🧪 **Testes para Verificar a Correção**

### **1. Debug das Variáveis de Ambiente**
Acesse: `https://inquiro.unityerp.app/api/debug-env`

**Resultado esperado:**
```json
{
  "NODE_ENV": "production",
  "NEXT_PUBLIC_SITE_URL": "https://inquiro.unityerp.app",
  "NEXT_PUBLIC_BASE_URL": "https://inquiro.unityerp.app",
  "NEXT_PUBLIC_SUPABASE_URL": "✅ Configurada",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY": "✅ Configurada"
}
```

### **2. Teste de Login**
1. Acesse: `https://inquiro.unityerp.app/admin/login`
2. Digite credenciais incorretas
3. Verifique se o redirecionamento vai para o domínio correto

### **3. Verificar Logs**
Nos logs do servidor, procure por:
```
🔍 getBaseUrl: Servidor, usando NEXT_PUBLIC_SITE_URL: https://inquiro.unityerp.app
🔄 Middleware: Redirecionando para: https://inquiro.unityerp.app/admin/login?redirect=...
```

## 🚨 **Se Ainda Não Funcionar**

### **1. Verificar Configuração do Proxy/Nginx**
Se estiver usando proxy reverso, confirme que está passando o host correto:

```nginx
# Exemplo para Nginx
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
```

### **2. Verificar Configuração do Supabase**
No painel do Supabase, confirme:
- **Site URL**: `https://inquiro.unityerp.app`
- **Redirect URLs**: `https://inquiro.unityerp.app/**`

### **3. Debug Adicional**
Adicione logs temporários no middleware:
```typescript
console.log('🔍 Debug completo:', {
  host: req.headers.get('host'),
  origin: req.headers.get('origin'),
  referer: req.headers.get('referer'),
  url: req.url,
  nextUrl: req.nextUrl.toString()
});
```

## 📊 **Logs Esperados Após Correção**

### **Middleware:**
```
🔍 Middleware - Iniciando verificação: {
  pathname: '/admin',
  host: 'inquiro.unityerp.app'
}
🚫 Middleware: Sem cookies de auth válidos, redirecionando para login
🔄 Middleware: Redirecionando para: https://inquiro.unityerp.app/admin/login?redirect=%2Fadmin
```

### **getBaseUrl:**
```
🔍 getBaseUrl: Servidor, usando NEXT_PUBLIC_SITE_URL: https://inquiro.unityerp.app
```

## 🎯 **Resultado Final**

Após aplicar todas as correções:
- ✅ Login redireciona para `https://inquiro.unityerp.app/admin`
- ✅ Erros redirecionam para `https://inquiro.unityerp.app/admin/login?error=...`
- ✅ Middleware usa sempre a URL base correta
- ❌ Nenhum redirecionamento para localhost

## 📞 **Suporte**

Se ainda houver problemas, compartilhe:
1. Logs do servidor após as correções
2. Resultado da rota `/api/debug-env`
3. Configuração do proxy/nginx (se aplicável)
4. Comportamento específico do redirecionamento
