# 🔍 Implementação de Verificação de Duplicatas por E-mail ou Telefone

## 🎯 **Objetivo**

Permitir que cada questionário escolha entre **e-mail** ou **telefone** como campo de verificação para identificar respostas duplicadas, oferecendo flexibilidade para diferentes tipos de questionários.

## ✨ **Funcionalidades Implementadas**

### **1. Escolha do Campo de Verificação**
- ✅ **E-mail** - Verificação tradicional por endereço de e-mail
- ✅ **Telefone** - Verificação alternativa por número de telefone
- ✅ **Configuração por questionário** - Cada questionário pode ter sua própria configuração
- ✅ **Validação automática** - Apenas um campo pode ser marcado como verificação

### **2. Interface de Configuração**
- ✅ **Checkbox de verificação** - Marcar campos como campo de verificação
- ✅ **Validação visual** - Apenas campos email/telefone podem ser verificados
- ✅ **Feedback claro** - Indicação visual de qual campo está sendo usado
- ✅ **Configuração intuitiva** - Interface simples e direta

### **3. Lógica de Verificação Inteligente**
- ✅ **Detecção automática** - Sistema identifica qual campo usar
- ✅ **Fallback para e-mail** - Se não configurado, usa e-mail por padrão
- ✅ **Validação de obrigatoriedade** - Telefone obrigatório quando é campo de verificação
- ✅ **Logs detalhados** - Rastreamento de qual campo foi usado

## 🗄️ **Banco de Dados**

### **Script SQL** (`UPDATE_VERIFICACAO_DUPLICATAS.sql`)
Execute no Supabase para implementar a funcionalidade:

```sql
-- Execute o script completo:
-- UPDATE_VERIFICACAO_DUPLICATAS.sql
```

### **Novas Estruturas:**

#### **Tabela `questionarios`:**
- **`campos_configuraveis`** - JSONB com configuração dos campos
- **Campo `campoVerificacao`** - Boolean indicando se o campo é usado para verificação

#### **Tabela `pessoas`:**
- **`telefone`** - Campo para armazenar número de telefone
- **Constraints únicas** - (email + questionario_id) e (telefone + questionario_id)

### **Exemplo de Configuração:**
```json
[
  {
    "id": "email",
    "label": "E-mail",
    "tipo": "email",
    "obrigatorio": true,
    "campoVerificacao": true
  },
  {
    "id": "telefone",
    "label": "Telefone",
    "tipo": "telefone",
    "obrigatorio": false,
    "campoVerificacao": false
  }
]
```

## 🛠️ **Componentes Criados/Modificados**

### **1. ConfiguracaoCampos.tsx** (Modificado)
- ✅ **Checkbox de verificação** para campos email/telefone
- ✅ **Validação visual** de campos de verificação
- ✅ **Interface intuitiva** para configuração

### **2. API de Pessoas** (Modificado)
- ✅ **Detecção automática** do campo de verificação
- ✅ **Validação de obrigatoriedade** do telefone
- ✅ **Logs detalhados** de qual campo foi usado
- ✅ **Fallback para e-mail** quando não configurado

### **3. Páginas de Questionários** (Modificadas)
- ✅ **Campos padrão** com configuração de verificação
- ✅ **Interface atualizada** para incluir campoVerificacao
- ✅ **Validações automáticas** implementadas

## 🚀 **Como Implementar**

### **1. Preparação do Banco de Dados**

#### **⚠️ IMPORTANTE: Se você receber erro de constraint única**

Se você receber o erro:
```
ERROR: 23505: could not create unique index "pessoas_telefone_questionario_id_key"
DETAIL: Key (telefone, questionario_id)=(...) is duplicated.
```

**Execute primeiro os scripts de correção:**
```sql
-- 1. Corrigir duplicatas (se houver):
CORRECAO_DUPLICATAS_TELEFONE_SUPER_SIMPLES.sql

-- 2. Permitir email NULL:
CORRECAO_COLUNA_EMAIL_NULL.sql
```

#### **Script Principal:**
```bash
# No painel do Supabase, execute:
UPDATE_VERIFICACAO_DUPLICATAS.sql
```

### **2. Atualizar o Código**
```bash
# Os componentes já foram atualizados automaticamente
# Verifique se as mudanças foram aplicadas corretamente
```

### **3. Testar a Funcionalidade**
```bash
npm run dev
# Acesse /admin/questionarios/novo
# Configure campos com verificação por telefone
# Teste a resposta do questionário
```

## 📱 **Como Usar**

### **1. Configurar Verificação por E-mail (Padrão)**
1. Acesse `/admin/questionarios/novo`
2. Os campos padrão já têm e-mail marcado como verificação
3. Crie o questionário normalmente
4. Sistema verifica duplicatas por e-mail

### **2. Configurar Verificação por Telefone**
1. Acesse `/admin/questionarios/novo`
2. Na seção de campos configuráveis:
   - Desmarque o checkbox de verificação do e-mail
   - Marque o checkbox de verificação do telefone
   - O telefone se torna obrigatório automaticamente
3. Crie o questionário
4. Sistema verifica duplicatas por telefone

### **3. Configurar Questionário Existente**
1. Acesse `/admin/questionarios/[id]/campos`
2. Modifique a configuração dos campos
3. Marque/desmarque campos de verificação conforme necessário
4. Salve as alterações

## 🔧 **Configurações Disponíveis**

### **Campo de Verificação:**
- **E-mail** - Verificação tradicional, sempre obrigatório
- **Telefone** - Verificação alternativa, obrigatório quando configurado

### **Validações Automáticas:**
- ✅ **Apenas um campo** pode ser marcado como verificação
- ✅ **Apenas email/telefone** podem ser campos de verificação
- ✅ **Telefone obrigatório** quando é campo de verificação
- ✅ **Constraints únicas** para ambos os campos

### **Comportamento do Sistema:**
- 🔍 **Detecção automática** do campo de verificação
- 📝 **Logs detalhados** de qual campo foi usado
- ⚠️ **Validações** antes de processar respostas
- 🔄 **Fallback** para e-mail quando não configurado

## 📊 **Exemplos de Uso**

### **Questionário de Satisfação (Verificação por E-mail):**
```json
{
  "id": "email",
  "tipo": "email",
  "campoVerificacao": true
}
```
- Usuários respondem com e-mail
- Sistema verifica duplicatas por e-mail
- E-mail sempre obrigatório

### **Questionário Empresarial (Verificação por Telefone):**
```json
{
  "id": "telefone",
  "tipo": "telefone",
  "campoVerificacao": true
}
```
- Usuários respondem com telefone
- Sistema verifica duplicatas por telefone
- Telefone obrigatório, e-mail opcional

### **Questionário Misto (Verificação por E-mail):**
```json
{
  "id": "email",
  "tipo": "email",
  "campoVerificacao": true
},
{
  "id": "telefone",
  "tipo": "telefone",
  "campoVerificacao": false
}
```
- E-mail é campo de verificação
- Telefone é opcional
- Sistema usa e-mail para verificação

## 🧪 **Testes Recomendados**

### **1. Configuração de Campos:**
- ✅ Marcar e-mail como campo de verificação
- ✅ Marcar telefone como campo de verificação
- ✅ Tentar marcar múltiplos campos como verificação
- ✅ Tentar marcar campo inválido como verificação

### **2. Validações:**
- ✅ Criar questionário sem campo de verificação
- ✅ Criar questionário com telefone obrigatório
- ✅ Testar constraints únicas no banco

### **3. Funcionamento:**
- ✅ Resposta com e-mail (verificação por e-mail)
- ✅ Resposta com telefone (verificação por telefone)
- ✅ Resposta duplicada (deve ser detectada)
- ✅ Resposta em questionários diferentes (deve permitir)

### **4. Interface:**
- ✅ Checkbox de verificação funciona
- ✅ Validações em tempo real
- ✅ Feedback visual correto
- ✅ Responsividade em mobile

## 🚨 **Considerações Importantes**

### **Compatibilidade:**
- ✅ **Questionários existentes** continuam funcionando
- ✅ **Verificação por e-mail** é o padrão
- ✅ **Migração automática** para novos campos
- ✅ **Campos opcionais** não quebram funcionalidade

### **Performance:**
- ✅ **Índices GIN** para consultas JSONB
- ✅ **Constraints únicas** para integridade
- ✅ **Validações eficientes** no banco
- ✅ **Logs otimizados** para debugging

### **Segurança:**
- ✅ **Validação de tipos** no banco
- ✅ **Constraints únicas** para duplicatas
- ✅ **Validação de obrigatoriedade** automática
- ✅ **Triggers** para integridade dos dados

## 🎯 **Próximos Passos**

### **Fase 1 (Atual):**
- ✅ Verificação por e-mail ou telefone
- ✅ Interface de configuração
- ✅ Validações automáticas
- ✅ Constraints únicas
- ✅ Logs detalhados

### **Fase 2 (Futuro):**
- 🔄 **Múltiplos campos** de verificação
- 🔄 **Verificação por CNPJ** ou outros campos
- 🔄 **Regras de verificação** personalizadas
- 🔄 **Histórico de verificações** realizadas

## 🚨 **Troubleshooting**

### **Erro de Constraint Única**
Se você receber o erro:
```
ERROR: 23505: could not create unique index "pessoas_telefone_questionario_id_key"
DETAIL: Key (telefone, questionario_id)=(...) is duplicated.
```

**Solução:**
1. Execute primeiro: `CORRECAO_DUPLICATAS_TELEFONE_SUPER_SIMPLES.sql`
2. Execute depois: `CORRECAO_COLUNA_EMAIL_NULL.sql`
3. Execute por último: `UPDATE_VERIFICACAO_DUPLICATAS.sql`

### **Verificar Duplicatas Manualmente**
```sql
-- Verificar duplicatas de telefone
SELECT telefone, questionario_id, COUNT(*)
FROM pessoas 
WHERE telefone IS NOT NULL 
GROUP BY telefone, questionario_id 
HAVING COUNT(*) > 1;

-- Verificar duplicatas de email
SELECT email, questionario_id, COUNT(*)
FROM pessoas 
GROUP BY email, questionario_id 
HAVING COUNT(*) > 1;
```

### **Remover Duplicatas Manualmente**
```sql
-- Remover duplicatas de telefone (mantém o mais recente)
DELETE FROM pessoas 
WHERE id IN (
    SELECT p1.id
    FROM pessoas p1
    INNER JOIN (
        SELECT telefone, questionario_id, MAX(created_at) as max_created_at
        FROM pessoas
        WHERE telefone IS NOT NULL
        GROUP BY telefone, questionario_id
        HAVING COUNT(*) > 1
    ) p2 ON p1.telefone = p2.telefone 
        AND p1.questionario_id = p2.questionario_id
        AND p1.created_at < p2.max_created_at
);
```

## 📞 **Suporte**

Para implementar ou dúvidas:
1. **Execute o script de correção** se houver erro de constraint
2. **Execute o script principal** no Supabase
3. **Verifique se as tabelas** foram atualizadas
4. **Teste a criação** de questionários com verificação por telefone
5. **Teste a resposta** dos questionários
6. **Verifique os logs** para confirmar funcionamento
7. **Valide constraints** no banco de dados

## 🎉 **Resultado Final**

Após implementar:
- ✅ **Escolha flexível** entre e-mail ou telefone
- ✅ **Configuração por questionário** individual
- ✅ **Validações automáticas** implementadas
- ✅ **Interface intuitiva** para configuração
- ✅ **Logs detalhados** para debugging
- ✅ **Constraints únicas** para integridade
- ✅ **Fallback automático** para e-mail
- ✅ **Compatibilidade** com questionários existentes

## 🔗 **Arquivos Modificados**

- `src/components/ConfiguracaoCampos.tsx` - Checkbox de verificação
- `src/app/api/pessoas/upsert/route.ts` - Lógica de verificação
- `src/app/admin/(protected)/questionarios/novo/page.tsx` - Campos padrão
- `src/app/admin/(protected)/questionarios/[id]/campos/EditarCamposQuestionarioClient.tsx` - Edição
- `UPDATE_VERIFICACAO_DUPLICATAS.sql` - Script SQL principal
- `CORRECAO_DUPLICATAS_TELEFONE_SUPER_SIMPLES.sql` - Script de correção de duplicatas (versão super-simples)
- `CORRECAO_COLUNA_EMAIL_NULL.sql` - Script para permitir email NULL
- `VERIFICACAO_DUPLICATAS_IMPLEMENTACAO.md` - Esta documentação

## 🚀 **Exemplo de Uso Rápido**

### **Para verificação por telefone:**
1. Acesse `/admin/questionarios/novo`
2. Desmarque "🔍 Campo de verificação" do e-mail
3. Marque "🔍 Campo de verificação" do telefone
4. Crie o questionário
5. Sistema agora verifica duplicatas por telefone

### **Para verificação por e-mail (padrão):**
1. Deixe o e-mail marcado como campo de verificação
2. Sistema verifica duplicatas por e-mail automaticamente
3. Telefone se torna opcional
