# 🚨 Correção para Next.js 15 - URLs Relativas Não Suportadas

## 🔍 **Problema Identificado**

O Next.js 15 **não aceita mais URLs relativas** no `NextResponse.redirect()`. Ele exige URLs absolutas.

### **Erro encontrado:**
```
Error: URL is malformed "/admin". Please use only absolute URLs - https://nextjs.org/docs/messages/middleware-relative-urls
```

## 🛠️ **Correções Implementadas**

### **1. Rota de Login** (`src/app/admin/login/action/route.ts`)
**ANTES (❌):**
```typescript
return NextResponse.redirect('/admin/login?error=auth');
return NextResponse.redirect('/admin/login?error=admin_check');
return NextResponse.redirect('/admin/login?error=not_admin');
return NextResponse.redirect('/admin/login?error=content');
```

**DEPOIS (✅):**
```typescript
return NextResponse.redirect(`${getBaseUrl()}/admin/login?error=auth`);
return NextResponse.redirect(`${getBaseUrl()}/admin/login?error=admin_check`);
return NextResponse.redirect(`${getBaseUrl()}/admin/login?error=not_admin`);
return NextResponse.redirect(`${getBaseUrl()}/admin/login?error=content`);
```

### **2. Rota de Logout** (`src/app/admin/(protected)/logout/route.ts`)
**ANTES (❌):**
```typescript
const res = NextResponse.redirect('/admin/login');
```

**DEPOIS (✅):**
```typescript
const res = NextResponse.redirect(`${getBaseUrl()}/admin/login`);
```

### **3. Redirecionamento Principal de Login**
**ANTES (❌):**
```typescript
const res = NextResponse.redirect(redirect); // redirect = '/admin'
```

**DEPOIS (✅):**
```typescript
const baseUrl = getBaseUrl();
const absoluteRedirect = `${baseUrl}${redirect}`;
const res = NextResponse.redirect(absoluteRedirect);
```

## 🚀 **Para Aplicar na VPS**

### **1. Atualizar o Código**
```bash
# Na sua VPS, navegue até o projeto
cd /caminho/para/questionario-mvp

# Faça pull das alterações (se usando Git)
git pull origin main

# OU copie os arquivos corrigidos manualmente
```

### **2. Rebuild e Reiniciar**
```bash
# Build para produção
npm run build

# Reiniciar o servidor
# Se usando PM2:
pm2 restart all

# Se usando npm:
npm start
```

## 🧪 **Testes para Verificar a Correção**

### **1. Teste de Login**
1. Acesse: `https://inquiro.unityerp.app/admin/login`
2. Digite credenciais incorretas
3. Verifique se não há mais erro de "URL malformada"

### **2. Teste de Logout**
1. Faça login com credenciais corretas
2. Acesse logout
3. Verifique se redireciona corretamente

### **3. Verificar Logs**
Nos logs do servidor, procure por:
```
🔍 Redirecionando para URL absoluta: https://inquiro.unityerp.app/admin
✅ Redirecionamento criado: https://inquiro.unityerp.app/admin
```

## 📊 **Logs Esperados Após Correção**

### **Login bem-sucedido:**
```
🔍 Redirecionando para URL absoluta: https://inquiro.unityerp.app/admin
✅ Redirecionamento criado: https://inquiro.unityerp.app/admin
```

### **Erros de login:**
```
🔄 Redirecionando para erro usando URL base: https://inquiro.unityerp.app/admin/login?error=admin_check
```

## 🚨 **Importante**

- **Next.js 15 exige URLs absolutas** para `NextResponse.redirect()`
- **URLs relativas** como `/admin` não são mais aceitas
- **Sempre use** `getBaseUrl()` + caminho para construir URLs absolutas
- **Teste em desenvolvimento** antes de fazer deploy em produção

## 📞 **Se Ainda Houver Problemas**

Compartilhe:
1. Logs do servidor após as correções
2. Qualquer erro relacionado a URLs
3. Comportamento específico do redirecionamento

## 🎯 **Resultado Final**

Após aplicar essas correções:
- ✅ Login funciona sem erro de "URL malformada"
- ✅ Redirecionamentos usam URLs absolutas corretas
- ✅ Sistema funciona tanto em desenvolvimento quanto em produção
- ❌ Nenhum erro de URL relativa
