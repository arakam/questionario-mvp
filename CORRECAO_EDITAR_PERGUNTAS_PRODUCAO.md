# 🚨 **Correção: Edição de Perguntas em Produção Apontando para Localhost**

## 🚨 **Problema Identificado**

### **Erro no Console:**
```
PUT https://localhost:3008/admin/perguntas net::ERR_SSL_PROTOCOL_ERROR
Uncaught TypeError: Failed to fetch
```

### **Causa:**
A página de edição de perguntas está tentando fazer fetch para `https://localhost:3008/admin/perguntas` em vez de usar URLs relativas ou a URL de produção.

## 🔍 **Análise do Problema**

### **1. Localização do Erro:**
- **Página**: `/admin/perguntas/[id]` (edição de perguntas)
- **Função**: `handleSubmit` que faz fetch para `/api/admin/perguntas/${pergunta.id}`
- **Problema**: URL está sendo construída incorretamente

### **2. Possíveis Causas:**
- **Configuração do Next.js** forçando URLs absolutas
- **Variáveis de ambiente** não sendo carregadas corretamente
- **Build de produção** usando configurações de desenvolvimento

## 🔧 **Soluções Implementadas**

### **1. Correção no next.config.ts:**
```typescript
// Configurações para produção
...(process.env.NODE_ENV === 'production' && {
  // Força o uso de HTTPS em produção
  assetPrefix: process.env.NEXT_PUBLIC_SITE_URL,
  // Força URLs absolutas em produção
  basePath: '',
  // Configuração para evitar localhost em produção
  env: {
    NODE_ENV: 'production',
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },
}),
```

### **2. Validação no urlUtils.ts:**
```typescript
// Valida se a origem não contém localhost
if (origin.includes('localhost')) {
  console.warn('⚠️ getBaseUrl: Cliente detectou localhost, usando fallback seguro');
  return 'https://inquiro.unityerp.app';
}
```

## 🚀 **Passos para Corrigir**

### **1. Verificar Variáveis de Ambiente:**
```bash
# No servidor de produção:
cd /caminho/do/projeto
cat .env.production

# Deve ter:
NEXT_PUBLIC_SITE_URL=https://inquiro.unityerp.app
NODE_ENV=production
```

### **2. Rebuild Completo da Aplicação:**
```bash
# Pare o servidor
pm2 stop questionario-mvp

# Limpe o cache do Next.js
rm -rf .next

# Faça o build novamente
npm run build

# Inicie o servidor
pm2 start questionario-mvp
```

### **3. Verificar Logs:**
```bash
# Verifique os logs:
pm2 logs questionario-mvp

# Procure por:
🔍 getBaseUrl: Servidor, usando NEXT_PUBLIC_SITE_URL: https://inquiro.unityerp.app
```

## 🧪 **Testes para Verificar**

### **1. Teste de Edição de Pergunta:**
```bash
# 1. Acesse: https://inquiro.unityerp.app/admin/perguntas
# 2. Clique em "Editar" em uma pergunta
# 3. Modifique algo e clique em "Salvar"
# 4. Verifique o console do navegador
```

### **2. Logs Esperados:**
```bash
# Console deve mostrar:
🔍 getBaseUrl: Cliente, usando window.location.origin: https://inquiro.unityerp.app

# NÃO deve mostrar:
❌ PUT https://localhost:3008/admin/perguntas
```

### **3. Verificar Network Tab:**
```bash
# No DevTools → Network
# As requisições devem ir para:
# ✅ https://inquiro.unityerp.app/api/admin/perguntas/...
# ❌ https://localhost:3008/api/admin/perguntas/...
```

## 📋 **Checklist de Verificação**

### **1. Variáveis de Ambiente:**
- [ ] **`.env.production`** tem URL correta
- [ ] **`NODE_ENV=production`** está definido
- [ ] **Não há** referências a localhost

### **2. Build de Produção:**
- [ ] **Cache foi limpo** (rm -rf .next)
- [ ] **`npm run build`** foi executado
- [ ] **Servidor foi reiniciado**
- [ ] **Logs mostram** URLs corretas

### **3. Funcionalidade:**
- [ ] **Edição de perguntas** funciona
- [ ] **APIs funcionam** sem erros SSL
- [ ] **URLs apontam** para domínio de produção

## 🚨 **Se Ainda Houver Problemas**

### **1. Verificar Cache do Navegador:**
```bash
# Limpe o cache completamente
# Ctrl+Shift+Delete → Limpar dados de navegação
```

### **2. Verificar Configuração do Nginx/Apache:**
```bash
# Verifique se o proxy está configurado corretamente
# As requisições devem ir para a porta correta
```

### **3. Verificar Build:**
```bash
# Verifique se o build foi feito corretamente:
ls -la .next/
cat .next/BUILD_ID
```

## 🎯 **Resultado Esperado**

Após a correção:
- ✅ **Edição de perguntas** funciona sem erros
- ✅ **APIs funcionam** sem erros SSL
- ✅ **URLs apontam** para domínio de produção
- ✅ **Logs mostram** URLs de produção
- ✅ **Sistema funciona** completamente em produção

## 🔮 **Próximos Passos**

### **1. Aplicar Correções:**
- **Verifique** variáveis de ambiente
- **Limpe** cache do Next.js
- **Rebuild** da aplicação
- **Reinicie** servidor

### **2. Teste Imediato:**
- **Acesse** página de edição de perguntas
- **Tente** editar uma pergunta
- **Verifique** se não há mais erros SSL

### **3. Monitoramento:**
- **Observe** logs do servidor
- **Verifique** console do navegador
- **Teste** todas as funcionalidades

A correção implementada deve resolver o problema de URLs apontando para localhost na edição de perguntas! 🚀✨

## 📞 **Compartilhe se Ainda Houver Problemas**

### **Informações Necessárias:**
1. **Conteúdo** do `.env.production`
2. **Logs** do servidor após rebuild
3. **Console** do navegador em produção
4. **Erros específicos** que ainda aparecem
5. **Resultado** do comando `ls -la .next/`
