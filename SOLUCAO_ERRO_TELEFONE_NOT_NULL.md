# 🚨 SOLUÇÃO URGENTE: Erro "null value in column telefone violates not-null constraint"

## ❌ **Problema Identificado:**

A tabela `pessoas` tem constraints `NOT NULL` em colunas que deveriam ser opcionais:
- `telefone` - Deveria permitir NULL
- `cnpj` - Deveria permitir NULL  
- `empresa` - Deveria permitir NULL
- `qtd_funcionarios` - Deveria permitir NULL
- `ramo_atividade` - Deveria permitir NULL

## ✅ **Solução Imediata:**

### **1. Execute o Script de Correção no Supabase:**

```sql
-- Execute este script no SQL Editor do Supabase
-- CORRECAO_TABELA_PESSOAS.sql

-- Remove constraints NOT NULL das colunas opcionais
ALTER TABLE pessoas ALTER COLUMN telefone DROP NOT NULL;
ALTER TABLE pessoas ALTER COLUMN cnpj DROP NOT NULL;
ALTER TABLE pessoas ALTER COLUMN empresa DROP NOT NULL;
ALTER TABLE pessoas ALTER COLUMN qtd_funcionarios DROP NOT NULL;
ALTER TABLE pessoas ALTER COLUMN ramo_atividade DROP NOT NULL;
```

### **2. Verifique a Estrutura da Tabela:**

```sql
-- Verificar se as constraints foram removidas
SELECT 
    column_name,
    is_nullable,
    CASE 
        WHEN is_nullable = 'NO' THEN 'OBRIGATÓRIO'
        ELSE 'OPCIONAL'
    END as status
FROM information_schema.columns
WHERE table_name = 'pessoas'
ORDER BY ordinal_position;
```

### **3. Resultado Esperado:**

```
column_name        | is_nullable | status
------------------|-------------|----------
id                | NO          | OBRIGATÓRIO
nome              | NO          | OBRIGATÓRIO
email             | NO          | OBRIGATÓRIO
telefone          | YES         | OPCIONAL
cnpj              | YES         | OPCIONAL
empresa           | YES         | OPCIONAL
qtd_funcionarios  | YES         | OPCIONAL
ramo_atividade    | YES         | OPCIONAL
created_at        | YES         | OPCIONAL
updated_at        | YES         | OPCIONAL
```

## 🔧 **O que Foi Corrigido:**

### **API de Pessoas:**
- ✅ **Limpeza de dados** - Remove campos vazios antes da inserção
- ✅ **Validação inteligente** - Só insere campos com valor
- ✅ **Tratamento de tipos** - Converte números corretamente
- ✅ **Logs detalhados** - Facilita debugging

### **Tabela Pessoas:**
- ✅ **Constraints flexíveis** - Campos opcionais permitem NULL
- ✅ **Estrutura correta** - Apenas nome e email são obrigatórios
- ✅ **Compatibilidade** - Aceita campos configuráveis dinamicamente

## 🚀 **Como Testar:**

### **1. Execute o Script SQL no Supabase**
- Acesse o SQL Editor
- Cole e execute `CORRECAO_TABELA_PESSOAS.sql`
- Verifique se não há erros

### **2. Teste a Inserção:**
- Acesse `/q/exemplo`
- Preencha apenas nome e email
- Deixe outros campos vazios
- Clique em "Começar"
- Deve funcionar sem erro

### **3. Verifique os Logs:**
- Console do navegador
- Logs do servidor
- Deve mostrar "✅ Nova pessoa criada"

## 📋 **Campos Obrigatórios vs Opcionais:**

### **OBRIGATÓRIOS (NOT NULL):**
- `nome` - Nome completo da pessoa
- `email` - Email único para identificação

### **OPCIONAIS (NULL):**
- `telefone` - Telefone de contato
- `cnpj` - CNPJ da empresa
- `empresa` - Nome da empresa
- `qtd_funcionarios` - Quantidade de funcionários
- `ramo_atividade` - Ramo de atividade

## 🎯 **Próximos Passos:**

1. **Execute o script SQL** de correção
2. **Teste a inserção** com campos opcionais vazios
3. **Verifique se funciona** sem erros
4. **Configure campos** no questionário conforme necessário

## 🔍 **Se Ainda Houver Problemas:**

### **Verificar Constraints:**
```sql
-- Listar todas as constraints da tabela
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'pessoas';
```

### **Verificar Triggers:**
```sql
-- Listar triggers da tabela
SELECT 
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'pessoas';
```

## ✅ **Resultado Final:**

Após a correção:
- ✅ **Campos opcionais** permitem NULL
- ✅ **API funciona** com campos configuráveis
- ✅ **Questionários** aceitam campos personalizados
- ✅ **Sem erros** de constraint NOT NULL
- ✅ **Sistema flexível** para diferentes configurações

## 📞 **Suporte:**

Se o problema persistir:
1. Verifique se o script SQL foi executado completamente
2. Confirme que as constraints foram removidas
3. Teste com inserção manual no SQL
4. Verifique logs da API para detalhes do erro
