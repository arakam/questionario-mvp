# 🚨 **Correção: URLs em Produção Apontando para Localhost**

## 🚨 **Problema Identificado**

### **Erro no Console:**
```
Failed to load resource: net::ERR_SSL_PROTOCOL_ERROR
Uncaught TypeError: Failed to fetch
```

### **Causa:**
O sistema está tentando fazer fetch para `localhost:3008` em vez da URL de produção `https://inquiro.unityerp.app`.

## 🔍 **Análise do Problema**

### **1. Verificação do urlUtils.ts:**
O arquivo `src/lib/urlUtils.ts` tem lógica para detectar localhost, mas pode estar falhando em produção.

### **2. Variáveis de Ambiente:**
Verifique se o `.env.production` está configurado corretamente.

### **3. Build de Produção:**
O Next.js pode estar usando configurações de desenvolvimento em produção.

## 🔧 **Soluções Implementadas**

### **1. Correção no urlUtils.ts:**
```typescript
export function getBaseUrl(): string {
  // No cliente, sempre usa window.location.origin
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    console.log('🔍 getBaseUrl: Cliente, usando window.location.origin:', origin);
    return origin;
  }
  
  // No servidor, prioriza variáveis de ambiente
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL.trim();
    console.log('🔍 getBaseUrl: Servidor, usando NEXT_PUBLIC_SITE_URL:', siteUrl);
    
    // Valida se a URL não contém localhost
    if (siteUrl.includes('localhost')) {
      console.warn('⚠️ getBaseUrl: NEXT_PUBLIC_SITE_URL contém localhost, usando fallback seguro');
      return 'https://inquiro.unityerp.app';
    }
    
    return siteUrl;
  }
  
  // Fallback para desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 getBaseUrl: Servidor development, usando localhost:3008');
    return 'http://localhost:3008';
  }
  
  // Fallback para produção - NUNCA deve chegar aqui se NEXT_PUBLIC_SITE_URL estiver configurado
  const fallbackUrl = 'https://inquiro.unityerp.app';
  console.log('🔍 getBaseUrl: Servidor produção, usando fallback:', fallbackUrl);
  console.warn('⚠️ getBaseUrl: Usando fallback - verifique se NEXT_PUBLIC_SITE_URL está configurado');
  return fallbackUrl;
}
```

### **2. Validação de URLs:**
```typescript
// Valida se a URL final não contém localhost
if (fullUrl.includes('localhost')) {
  console.error('❌ createSafeRedirectUrl: URL final contém localhost:', fullUrl);
  throw new Error('URL de redirecionamento contém localhost - configuração incorreta');
}
```

## 🚀 **Passos para Corrigir**

### **1. Verificar Variáveis de Ambiente:**
```bash
# No .env.production, verifique se tem:
NEXT_PUBLIC_SITE_URL=https://inquiro.unityerp.app
NEXT_PUBLIC_BASE_URL=https://inquiro.unityerp.app

# NÃO deve ter:
NEXT_PUBLIC_SITE_URL=http://localhost:3008
```

### **2. Verificar Build de Produção:**
```bash
# No servidor de produção:
cd /caminho/do/projeto
cat .env.production

# Deve mostrar:
NEXT_PUBLIC_SITE_URL=https://inquiro.unityerp.app
NODE_ENV=production
```

### **3. Rebuild da Aplicação:**
```bash
# Pare o servidor atual
pm2 stop questionario-mvp

# Faça o build novamente
npm run build

# Inicie o servidor
pm2 start questionario-mvp
```

### **4. Verificar Logs:**
```bash
# Verifique os logs do PM2
pm2 logs questionario-mvp

# Procure por:
🔍 getBaseUrl: Servidor, usando NEXT_PUBLIC_SITE_URL: https://inquiro.unityerp.app
```

## 🧪 **Testes para Verificar**

### **1. Verificar Console do Navegador:**
```bash
# Acesse: https://inquiro.unityerp.app/admin/perguntas
# Pressione F12 → Console
# Procure por logs como:
🔍 getBaseUrl: Cliente, usando window.location.origin: https://inquiro.unityerp.app
```

### **2. Verificar Logs do Servidor:**
```bash
# No terminal do servidor, procure por:
🔍 getBaseUrl: Servidor, usando NEXT_PUBLIC_SITE_URL: https://inquiro.unityerp.app
```

### **3. Verificar URLs das APIs:**
```bash
# As APIs devem retornar URLs corretas:
# ✅ https://inquiro.unityerp.app/api/...
# ❌ http://localhost:3008/api/...
```

## 📋 **Checklist de Verificação**

### **1. Variáveis de Ambiente:**
- [ ] **`.env.production`** tem `NEXT_PUBLIC_SITE_URL=https://inquiro.unityerp.app`
- [ ] **`NODE_ENV=production`** está definido
- [ ] **Não há** referências a localhost

### **2. Build de Produção:**
- [ ] **`npm run build`** foi executado após mudanças
- [ ] **Servidor foi reiniciado** após rebuild
- [ ] **Logs mostram** URLs corretas

### **3. Funcionalidade:**
- [ ] **APIs funcionam** sem erros SSL
- [ ] **Redirecionamentos** vão para URLs corretas
- [ ] **Fetches** não tentam localhost

## 🚨 **Se Ainda Houver Problemas**

### **1. Verificar Cache do Navegador:**
```bash
# Limpe o cache completamente
# Ctrl+Shift+Delete → Limpar dados de navegação
```

### **2. Verificar DNS:**
```bash
# No servidor, verifique se o domínio resolve:
nslookup inquiro.unityerp.app
ping inquiro.unityerp.app
```

### **3. Verificar Configuração do Nginx/Apache:**
```bash
# Verifique se o proxy está configurado corretamente
# As requisições devem ir para a porta correta
```

## 🎯 **Resultado Esperado**

Após a correção:
- ✅ **URLs apontam** para domínio de produção
- ✅ **APIs funcionam** sem erros SSL
- ✅ **Redirecionamentos** vão para URLs corretas
- ✅ **Logs mostram** URLs de produção
- ✅ **Sistema funciona** completamente em produção

## 🔮 **Próximos Passos**

### **1. Verificar Configuração:**
- **Confirme** variáveis de ambiente
- **Verifique** build de produção
- **Teste** funcionalidades

### **2. Monitoramento:**
- **Observe** logs do servidor
- **Verifique** console do navegador
- **Teste** todas as funcionalidades

### **3. Validação:**
- **Confirme** que não há mais erros SSL
- **Verifique** se URLs estão corretas
- **Teste** redirecionamentos

A correção implementada deve resolver o problema de URLs apontando para localhost em produção! 🚀✨

## 📞 **Compartilhe se Ainda Houver Problemas**

### **Informações Necessárias:**
1. **Conteúdo** do `.env.production`
2. **Logs** do servidor após rebuild
3. **Console** do navegador em produção
4. **Erros específicos** que ainda aparecem
