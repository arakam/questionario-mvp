# 🔧 Troubleshooting - Problema de Login

## 🐛 **Problema Atual**
- ✅ Login bem-sucedido (autenticação funciona)
- ❌ Não consegue acessar a área administrativa
- 🔄 Fica em loop na tela de login

## 🔍 **Diagnóstico Passo a Passo**

### **1. Acesse a Página de Debug**
```
http://localhost:3008/debug
```

### **2. Execute os Testes na Ordem**

#### **🌍 Variáveis de Ambiente**
- Clique em "Testar Variáveis de Ambiente"
- **Resultado esperado**: Supabase URL e Key configuradas

#### **🔌 Teste do Supabase**
- Clique em "Verificar Conexão"
- **Resultado esperado**: Conectado com sucesso

#### **🗄️ Estrutura do Banco**
- Clique em "Verificar Estrutura do Banco"
- **Resultado esperado**: Tabela `admins` existe

#### **🔐 Teste de Login**
- Digite suas credenciais e clique em "Testar Login"
- **Resultado esperado**: Login bem-sucedido

#### **👤 Verificar Sessão**
- Clique em "Verificar Sessão Atual"
- **Resultado esperado**: Usuário logado e é admin

#### **🏗️ Teste do Layout**
- Clique em "Verificar Layout Admin"
- **Resultado esperado**: Acesso permitido

## 🚨 **Possíveis Causas e Soluções**

### **Causa 1: Tabela `admins` não existe**
**Sintoma**: Erro ao verificar admin ou tabela não encontrada
**Solução**: 
1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Vá para **SQL Editor**
3. Execute o SQL do arquivo `SUPABASE_SETUP.md`

### **Causa 2: Usuário não está na tabela `admins`**
**Sintoma**: Login funciona mas `isAdmin = false`
**Solução**:
```sql
INSERT INTO public.admins (email, nome) 
VALUES ('aramis@unityerp.com.br', 'Aramis')
ON CONFLICT (email) DO NOTHING;
```

### **Causa 3: Problema com cookies de sessão**
**Sintoma**: Sessão não persiste entre requisições
**Solução**: 
1. Verifique se o navegador aceita cookies
2. Limpe cookies e cache
3. Tente em modo incógnito

### **Causa 4: Problema com políticas RLS**
**Sintoma**: Erro de permissão ao acessar tabela
**Solução**: Verifique se as políticas RLS estão configuradas corretamente

## 📋 **Checklist de Verificação**

- [ ] Variáveis de ambiente configuradas
- [ ] Supabase conectando corretamente
- [ ] Tabela `admins` existe
- [ ] Usuário está na tabela `admins`
- [ ] Login funciona
- [ ] Sessão persiste
- [ ] Verificação de admin funciona
- [ ] Layout admin permite acesso

## 🔄 **Teste de Login Completo**

1. **Faça logout** (se estiver logado)
2. **Acesse** `/admin/login`
3. **Digite credenciais** válidas
4. **Clique em "Entrar"**
5. **Verifique logs** do servidor
6. **Use a página de debug** para verificar cada etapa

## 📊 **Logs para Verificar**

No terminal do servidor, procure por:
```
🔍 Verificando layout admin...
📊 Resultado da verificação: { hasUser: true, userEmail: '...', isAdmin: true }
✅ Acesso permitido - renderizando layout admin
```

Se vir:
```
❌ Acesso negado - redirecionando para login
```

O problema está na verificação de admin.

## 🆘 **Se Nada Funcionar**

1. **Verifique logs** do servidor para erros específicos
2. **Use a página de debug** para identificar onde falha
3. **Verifique configuração** do Supabase
4. **Confirme estrutura** da tabela `admins`
5. **Teste em navegador diferente** ou modo incógnito

## 📞 **Suporte**

Compartilhe os resultados da página de debug para diagnóstico preciso.
