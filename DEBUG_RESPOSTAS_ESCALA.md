# 🚨 **Debug: Respostas de Escala Não Estão Sendo Salvas**

## 🚨 **Problema Reportado**

As respostas de perguntas do tipo "escala" não parecem estar sendo salvas no banco de dados.

## 🔍 **Passos para Debug**

### **1. Verificar Console do Navegador**
```bash
# 1. Acesse: /q/nps-exemplo
# 2. Pressione F12 → Console
# 3. Responda uma pergunta de escala
# 4. Procure por logs com emojis:
🎯 Respondendo pergunta: {...}
📤 Enviando dados para API: {...}
```

### **2. Verificar Console do Servidor**
```bash
# No terminal onde está rodando npm run dev
# Procure por logs como:
📥 Dados recebidos na API de respostas: {...}
✅ Dados validados: {...}
📝 Mapeando resposta escala: {...}
🚀 Dados finais para inserção: {...}
✅ Resposta salva com sucesso: {...}
```

### **3. Verificar Banco de Dados**
```bash
# Execute o script: VERIFICAR_COLUNAS_RESPOSTAS.sql
# Verifique se as colunas foram criadas corretamente
```

## 🔧 **Possíveis Causas**

### **1. Colunas Não Criadas no Banco**
- ❌ **`resposta_escala`** não existe
- ❌ **`tipo_pergunta`** não existe
- ❌ **Script SQL** não foi executado

### **2. Erro na API**
- ❌ **Validação** falhando
- ❌ **Mapeamento** incorreto
- ❌ **Erro** no upsert

### **3. Dados Não Chegando**
- ❌ **Frontend** não enviando dados
- ❌ **Tipo incorreto** da resposta
- ❌ **Estrutura** dos dados errada

## 🧪 **Testes para Identificar o Problema**

### **Teste 1: Verificar Logs do Frontend**
```bash
# Se não aparecer "🎯 Respondendo pergunta":
# - Problema na função responder
# - Verifique se o componente está sendo chamado
```

### **Teste 2: Verificar Logs da API**
```bash
# Se não aparecer "📥 Dados recebidos na API":
# - Problema na comunicação frontend → API
# - Verifique se a URL está correta
```

### **Teste 3: Verificar Validação**
```bash
# Se aparecer "❌ Erro de validação":
# - Problema no schema Zod
# - Verifique se os tipos estão corretos
```

### **Teste 4: Verificar Banco**
```bash
# Se aparecer "❌ Erro ao salvar no banco":
# - Problema no Supabase
# - Verifique se as colunas existem
```

## 🚀 **Soluções**

### **1. Se as Colunas Não Existem**
```sql
-- Execute no Supabase:
UPDATE_RESPOSTAS_TABLE.sql

-- Ou manualmente:
ALTER TABLE respostas 
ADD COLUMN IF NOT EXISTS resposta_escala INTEGER,
ADD COLUMN IF NOT EXISTS resposta_texto TEXT,
ADD COLUMN IF NOT EXISTS resposta_multipla JSONB,
ADD COLUMN IF NOT EXISTS tipo_pergunta VARCHAR(50) DEFAULT 'sim_nao';
```

### **2. Se a API Está Falhando**
```bash
# Verifique os logs do servidor
# Procure por erros específicos
# Verifique se o Supabase está acessível
```

### **3. Se os Dados Não Estão Chegando**
```bash
# Verifique se o tipo está correto
# Verifique se a resposta é um número
# Verifique se a estrutura está correta
```

## 📋 **Checklist de Verificação**

### **1. Frontend:**
- [ ] **Console mostra** "🎯 Respondendo pergunta"
- [ ] **Dados estão corretos** (tipo, resposta)
- [ ] **API é chamada** com dados corretos

### **2. API:**
- [ ] **Logs aparecem** no servidor
- [ ] **Validação passa** sem erros
- [ ] **Mapeamento** está correto
- [ ] **Upsert** é executado com sucesso

### **3. Banco:**
- [ ] **Colunas existem** na tabela respostas
- [ ] **Dados são inseridos** corretamente
- [ ] **Constraints** não estão bloqueando

## 🎯 **Resultado Esperado**

Após corrigir:
- ✅ **Frontend envia** dados corretos
- ✅ **API processa** e valida dados
- ✅ **Banco salva** resposta na coluna correta
- ✅ **Logs mostram** sucesso em todas as etapas

## 📞 **Se Ainda Houver Problemas**

### **Compartilhe:**
1. **Logs do frontend** (console do navegador)
2. **Logs do servidor** (terminal npm run dev)
3. **Resultado do script** VERIFICAR_COLUNAS_RESPOSTAS.sql

### **Descreva:**
- **Qual pergunta** está sendo respondida?
- **Qual valor** está sendo enviado?
- **Em qual etapa** para de funcionar?

### **Verifique:**
- ✅ **Colunas foram criadas** no banco?
- ✅ **API está funcionando** para outros tipos?
- ✅ **Supabase está acessível** e funcionando?

Com essas informações, poderemos identificar e corrigir o problema rapidamente! 🚀✨

## 🔮 **Próximos Passos**

### **1. Execute os Testes:**
- Responda uma pergunta de escala
- Verifique todos os logs
- Identifique onde está falhando

### **2. Execute o Script SQL:**
- Verifique se as colunas existem
- Corrija se necessário

### **3. Teste Novamente:**
- Verifique se as respostas são salvas
- Confirme no banco de dados

### **4. Se Funcionar:**
- Teste outros tipos de pergunta
- Verifique se todas as funcionalidades estão OK
