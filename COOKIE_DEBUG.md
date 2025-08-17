# 🍪 Debug de Cookies - Problema de Autenticação

## 🚨 **Problema Identificado**

### **Situação Atual:**
- ✅ **Login funciona** (autenticação bem-sucedida)
- ✅ **Cookie existe**: `sb-fjnozsebkevhhxlcdzpp-auth-token`
- ❌ **Middleware falha**: Não reconhece o cookie de autenticação
- 🔄 **Resultado**: Loop infinito de redirecionamento

### **Causa Raiz:**
O middleware estava procurando por cookies que **contêm** `access-token` ou `refresh-token`, mas o Supabase usa um formato diferente:

**Formato Real do Supabase:**
```
sb-{project-ref}-auth-token
```

**Exemplo:**
```
sb-fjnozsebkevhhxlcdzpp-auth-token
```

## 🔧 **Solução Implementada**

### **1. Middleware Corrigido**
```typescript
// ANTES (incorreto):
cookie.name.includes('access-token') || cookie.name.includes('refresh-token')

// DEPOIS (correto):
cookie.name.endsWith('-auth-token') && cookie.value
```

### **2. Lógica de Verificação**
```typescript
const hasAuthCookies = req.cookies.getAll().some(cookie => 
  cookie.name.startsWith('sb-') && 
  cookie.name.endsWith('-auth-token') &&
  cookie.value // Verifica se o cookie tem valor
);
```

## 🧪 **Para Testar Agora**

### **1. Reinicie o Servidor:**
```bash
npm run dev
```

### **2. Teste o Login:**
1. Acesse `/admin/login`
2. Digite suas credenciais
3. **Verifique os logs** para ver:
   ```
   🔓 Middleware: Cookies de auth encontrados, permitindo acesso
   ```

### **3. Use a Página de Debug:**
1. Acesse `/debug`
2. Execute **🍪 Teste de Cookies**
3. Execute **🔄 Teste de Redirecionamento**

## 📊 **Logs Esperados**

### **Se Funcionar:**
```
🔓 Middleware: Cookies de auth encontrados, permitindo acesso
```

### **Se Ainda Falhar:**
```
🚫 Middleware: Sem cookies de auth, redirecionando para login
🍪 Cookies disponíveis: [lista de cookies]
```

## 🔍 **Análise dos Cookies**

### **Cookie Encontrado:**
```
sb-fjnozsebkevhhxlcdzpp-auth-token
```

**Estrutura:**
- `sb-` → Prefixo do Supabase
- `fjnozsebkevhhxlcdzpp` → ID do projeto
- `-auth-token` → Sufixo do token de autenticação

### **Verificação:**
- ✅ **Starts with**: `sb-` ✓
- ✅ **Ends with**: `-auth-token` ✓
- ✅ **Has value**: Sim ✓

## 🚀 **Próximos Passos**

1. **Reinicie o servidor**
2. **Teste o login** e verifique os logs
3. **Execute os testes de debug**
4. **Compartilhe os resultados** para confirmar a correção

## 🆘 **Se Ainda Não Funcionar**

### **Possíveis Causas:**
1. **Cache do navegador**: Limpe cookies e cache
2. **Configuração do Supabase**: Verifique Site URL e Redirect URLs
3. **Variáveis de ambiente**: Confirme `.env.local`
4. **Problema de CORS**: Verifique configurações do navegador

### **Debug Adicional:**
1. **Verifique console do navegador** para erros
2. **Use modo incógnito** para testar
3. **Teste em navegador diferente**
4. **Verifique extensões** que possam interferir

## 📞 **Suporte**

Compartilhe:
- Logs do terminal após reiniciar o servidor
- Resultados dos testes de debug
- Qualquer erro no console do navegador
- Comportamento observado durante o login
