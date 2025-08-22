# 🚨 SOLUÇÃO URGENTE: Erro "Results contain 4 rows, application/vnd.pgrst.object+json requires 1 row"

## ❌ **Problema Identificado:**

A tabela `pessoas` tem **múltiplos registros** com o mesmo email:
- **Email**: `aramis.bsi@gmail.com`
- **Registros encontrados**: 4
- **Erro**: A API espera 1 registro, mas recebe 4

## ✅ **Solução Implementada:**

### **🔧 Nova Arquitetura: Múltiplos Questionários por Pessoa**

**ANTES (❌ Incorreto):**
- Uma pessoa só podia responder 1 questionário
- Constraint única no email
- Perda de histórico de respostas

**AGORA (✅ Correto):**
- Uma pessoa pode responder **vários questionários**
- Constraint única composta: `(email + questionario_id)`
- Histórico completo mantido

### **📊 Como Funciona Agora:**

```
Pessoa: João Silva (joao@email.com)
├── Questionário A: Respostas salvas ✅
├── Questionário B: Respostas salvas ✅  
├── Questionário C: Respostas salvas ✅
└── Questionário D: Respostas salvas ✅
```

**Regras:**
- ✅ **Mesmo email** em **questionários diferentes** = Permitido
- ❌ **Mesmo email** no **mesmo questionário** = Bloqueado (duplicata)

## 🚀 **Como Resolver:**

### **1. Execute o Script de Correção no Supabase:**

```sql
-- Execute este script no SQL Editor do Supabase
-- CORRECAO_TABELA_PESSOAS_QUESTIONARIO.sql

-- Adiciona questionario_id na tabela pessoas
-- Remove constraint única no email
-- Adiciona constraint única composta (email + questionario_id)
-- Adiciona foreign key para questionarios
```

### **2. Ou Execute Comandos Individuais:**

```sql
-- 1. Adicionar coluna questionario_id
ALTER TABLE pessoas ADD COLUMN IF NOT EXISTS questionario_id UUID;

-- 2. Remover constraint única no email (se existir)
-- (Execute o script para encontrar e remover automaticamente)

-- 3. Adicionar constraint única composta
ALTER TABLE pessoas 
ADD CONSTRAINT pessoas_email_questionario_unique 
UNIQUE (email, questionario_id);

-- 4. Adicionar foreign key
ALTER TABLE pessoas 
ADD CONSTRAINT pessoas_questionario_id_fkey 
FOREIGN KEY (questionario_id) REFERENCES questionarios(id);
```

## 🔧 **O que Foi Corrigido:**

### **API de Pessoas:**
- ✅ **Busca por email + questionario_id** - Não falha com múltiplos registros
- ✅ **Permite múltiplos questionários** - Uma pessoa pode responder vários
- ✅ **Previne duplicatas** - Mesmo email no mesmo questionário é bloqueado
- ✅ **Mantém histórico** - Todas as respostas são preservadas

### **Banco de Dados:**
- ✅ **Coluna questionario_id** - Vincula pessoa ao questionário específico
- ✅ **Constraint única composta** - (email + questionario_id) previne duplicatas
- ✅ **Foreign key** - Garante integridade referencial
- ✅ **Histórico completo** - Todas as respostas são mantidas

## 🎯 **Próximos Passos:**

### **1. Execute o Script SQL no Supabase:**
- Acesse o SQL Editor
- Cole e execute `CORRECAO_TABELA_PESSOAS_QUESTIONARIO.sql`
- Verifique se não há erros

### **2. Teste a Funcionalidade:**
- Acesse `/q/nps-exemplo`
- Preencha os dados pessoais
- Responda o questionário
- **Teste com outro questionário** usando o mesmo email
- Deve funcionar sem erro

### **3. Verifique os Logs:**
- Console do navegador
- Logs do servidor
- Deve mostrar "✅ Pessoa encontrada para este questionário" ou "🆕 Criando nova pessoa para este questionário"

## 📋 **Estrutura Esperada Após Correção:**

### **Tabela Pessoas:**
- **Coluna `questionario_id`** adicionada (UUID)
- **Constraint única composta** em `(email, questionario_id)`
- **Foreign key** para tabela `questionarios`
- **Múltiplos registros** por email (em questionários diferentes)

### **API Funcionando:**
- **Busca por email + questionario_id** retorna 1 registro ou null
- **Criação de pessoas** funciona para cada questionário
- **Prevenção de duplicatas** no mesmo questionário
- **Histórico completo** mantido

## 🔍 **Se Ainda Houver Problemas:**

### **Verificar Estrutura da Tabela:**
```sql
-- Verificar se questionario_id existe
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'pessoas' AND column_name = 'questionario_id';
```

### **Verificar Constraints:**
```sql
-- Verificar constraint única composta
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'pessoas' 
  AND constraint_name = 'pessoas_email_questionario_unique';
```

### **Verificar Foreign Key:**
```sql
-- Verificar foreign key para questionarios
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'pessoas' 
  AND constraint_name = 'pessoas_questionario_id_fkey';
```

## ✅ **Resultado Final:**

Após a correção:
- ✅ **Uma pessoa pode responder múltiplos questionários**
- ✅ **Sem duplicatas** no mesmo questionário
- ✅ **Histórico completo** mantido
- ✅ **API funciona** normalmente
- ✅ **Sistema flexível** para múltiplos questionários

## 🚀 **Prevenção Futura:**

- **Constraint única composta** previne duplicatas email+questionario
- **Foreign key** garante integridade referencial
- **API robusta** lida com múltiplos questionários
- **Histórico preservado** para análise e auditoria

## 🎯 **Benefícios da Nova Arquitetura:**

1. **📊 Histórico Completo** - Todas as respostas são mantidas
2. **🔄 Múltiplos Questionários** - Uma pessoa pode participar de vários
3. **📈 Análise Longitudinal** - Comparar respostas ao longo do tempo
4. **🎯 Segmentação** - Diferentes questionários para diferentes propósitos
5. **📋 Auditoria** - Rastreamento completo de participação

Após executar o script de correção, o sistema permitirá que uma pessoa responda múltiplos questionários mantendo todo o histórico! 🎉
