# 🌐 Correção de Redirecionamento para localhost em Produção

## 🚨 **Problema Identificado**

### **Situação:**
- ✅ **Login funciona** (autenticação bem-sucedida)
- ❌ **Redirecionamento incorreto**: vai para `https://localhost:3008/admin`
- 🎯 **Deveria ir para**: `https://inquito.unityerp.app/admin`

### **Causa Raiz:**
O sistema estava usando `req.url` para construir URLs de redirecionamento, que em produção continha `localhost` em vez do domínio real.

## 🔧 **Soluções Implementadas**

### **1. Arquivo `urlUtils.ts` Corrigido**
```typescript
// ANTES (causava problema):
return 'http://localhost:3000'; // ❌ Porta incorreta

// DEPOIS (corrigido):
return 'http://localhost:3008'; // ✅ Porta correta
```

### **2. Rota de Login Corrigida**
```typescript
// ANTES (causava problema):
const res = NextResponse.redirect(new URL(redirect, req.url));
// req.url podia conter localhost em produção

// DEPOIS (corrigido):
const baseUrl = getBaseUrl();
const finalUrl = `${baseUrl}${redirect}`;
const res = NextResponse.redirect(finalUrl);
// Sempre usa a URL base correta
```

### **3. Função `getBaseUrl()` Inteligente**
```typescript
export function getBaseUrl(): string {
  // 1. Prioriza variável de ambiente
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  
  // 2. Desenvolvimento: localhost:3008
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3008';
  }
  
  // 3. Cliente: URL atual do navegador
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // 4. Servidor: Vercel ou domínio padrão
  return process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}`
    : 'https://inquito.unityerp.app';
}
```

## 🧪 **Para Testar em Produção**

### **1. Configure as Variáveis de Ambiente**

#### **Na sua VPS, crie/edite o arquivo `.env.production`:**
```bash
# URL do site em produção
NEXT_PUBLIC_SITE_URL=https://inquito.unityerp.app

# Outras variáveis necessárias
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_do_supabase
```

#### **Ou configure no sistema:**
```bash
export NEXT_PUBLIC_SITE_URL=https://inquito.unityerp.app
```

### **2. Reinicie o Servidor**
```bash
# Se usando PM2
pm2 restart all

# Se usando npm
npm run build
npm start
```

### **3. Teste o Login**
1. Acesse `https://inquito.unityerp.app/admin/login`
2. Digite suas credenciais
3. **Verifique os logs** para ver:
   ```
   🔍 Debug redirecionamento: {
     baseUrl: 'https://inquito.unityerp.app',
     finalUrl: 'https://inquito.unityerp.app/admin'
   }
   ```

## 📊 **Logs Esperados**

### **Se Funcionar:**
```
🔍 Debug redirecionamento: {
  baseUrl: 'https://inquito.unityerp.app',
  finalUrl: 'https://inquito.unityerp.app/admin'
}
✅ Redirecionamento criado: https://inquito.unityerp.app/admin
```

### **Se Ainda Falhar:**
```
🔍 Debug redirecionamento: {
  baseUrl: 'http://localhost:3008', // ❌ Ainda localhost
  finalUrl: 'http://localhost:3008/admin'
}
```

## 🚀 **Próximos Passos**

1. **Configure `NEXT_PUBLIC_SITE_URL`** na sua VPS
2. **Reinicie o servidor**
3. **Teste o login** e verifique os logs
4. **Compartilhe os resultados** para confirmar a correção

## 🆘 **Se Ainda Não Funcionar**

### **Verificações Adicionais:**
1. **Variáveis de ambiente**: Confirme que `NEXT_PUBLIC_SITE_URL` está configurada
2. **Cache do navegador**: Limpe cookies e cache
3. **Configuração do Supabase**: Verifique Site URL e Redirect URLs
4. **Logs do servidor**: Verifique se a variável está sendo carregada

### **Debug Adicional:**
1. **Verifique logs** do servidor para ver a URL base
2. **Confirme variáveis** de ambiente estão carregadas
3. **Teste em modo incógnito** para evitar cache

## 📞 **Suporte**

Compartilhe:
- Configuração da variável `NEXT_PUBLIC_SITE_URL`
- Logs do servidor após configuração
- Comportamento do redirecionamento
- Qualquer erro observado
