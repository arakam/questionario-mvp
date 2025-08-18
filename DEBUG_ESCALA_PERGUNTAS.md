# 🔍 Debug: Problema com Salvamento de Escala

## 🚨 **Problema Reportado**

Ao selecionar o tipo de pergunta "Escala", os valores mínimos e máximos não estão sendo salvos corretamente.

## 🔧 **Correções Implementadas**

### **1. Logs de Debug Adicionados**

#### **Página de Nova Pergunta:**
- ✅ **Logs de mudança de tipo** - Mostra quando o tipo muda
- ✅ **Logs de configuração de escala** - Mostra quando os valores mudam
- ✅ **Logs antes do envio** - Mostra os dados que serão enviados
- ✅ **Validação adicional** - Verifica se todos os campos estão preenchidos

#### **Componente ConfiguracaoEscala:**
- ✅ **Logs de mudança** - Mostra cada alteração nos campos
- ✅ **Estado anterior vs novo** - Compara configurações

#### **API de Criação:**
- ✅ **Logs de dados recebidos** - Mostra o que a API recebe
- ✅ **Logs de validação** - Mostra se a validação passa
- ✅ **Logs de salvamento** - Mostra o que é salvo no banco

## 🧪 **Como Testar e Debugar**

### **1. Abra o Console do Navegador**
```bash
# Pressione F12 ou clique com botão direito → Inspecionar
# Vá para a aba "Console"
```

### **2. Crie uma Nova Pergunta de Escala**
```bash
# Acesse: /admin/perguntas/nova
# Selecione tipo: "Escala/Nota"
```

### **3. Configure os Valores da Escala**
```bash
# Preencha:
# - Valor Mínimo: 1
# - Valor Máximo: 10
# - Passo: 1
```

### **4. Verifique os Logs no Console**
Você deve ver algo como:

```
🔄 Tipo de pergunta alterado para: escala
📊 Estado atual da escala: {escalaMin: 1, escalaMax: 5, escalaPasso: 1}
📈 Configuração de escala atualizada: {escalaMin: 1, escalaMax: 10, escalaPasso: 1}
🔍 Salvando configuração de escala: {escalaMin: 1, escalaMax: 10, escalaPasso: 1}
📤 Dados do formulário: {tipo: "escala", opcoes: null, config_escala: {...}}
```

### **5. Envie o Formulário**
```bash
# Clique em "💾 Salvar Pergunta"
# Verifique os logs da API no console
```

## 🔍 **Logs Esperados da API**

### **Dados Recebidos:**
```json
🔍 API - Dados recebidos: {
  "texto": "Qual sua satisfação?",
  "peso": 1,
  "categoria_id": null,
  "ativa": true,
  "tipo": "escala",
  "opcoes": null,
  "config_escala": {
    "escalaMin": 1,
    "escalaMax": 10,
    "escalaPasso": 1
  }
}
```

### **Dados Salvos no Banco:**
```json
💾 Salvando pergunta no banco: {
  "texto": "Qual sua satisfação?",
  "peso": 1,
  "categoria_id": null,
  "ativa": true,
  "tipo": "escala",
  "opcoes": null,
  "config_escala": "{\"escalaMin\":1,\"escalaMax\":10,\"escalaPasso\":1}"
}
```

## 🚨 **Possíveis Problemas e Soluções**

### **1. Estado Não Está Atualizando**
**Sintoma:** Logs mostram valores antigos
**Solução:** Verificar se o `onChange` está sendo chamado

### **2. FormData Não Está Recebendo os Valores**
**Sintoma:** API recebe `config_escala: null`
**Solução:** Verificar se o `formData.append` está funcionando

### **3. Validação Está Falhando**
**Sintoma:** API retorna erro de validação
**Solução:** Verificar se `escalaMin < escalaMax`

### **4. Banco Não Está Salvando**
**Sintoma:** API não mostra erro, mas dados não aparecem
**Solução:** Verificar logs do Supabase

## 📋 **Checklist de Verificação**

- [ ] **Console mostra logs** de mudança de tipo
- [ ] **Console mostra logs** de configuração de escala
- [ ] **Console mostra logs** antes do envio
- [ ] **API recebe** `config_escala` corretamente
- [ ] **Validação passa** sem erros
- [ ] **Banco salva** os dados
- [ ] **Pergunta aparece** na listagem com tipo correto

## 🔧 **Se o Problema Persistir**

### **1. Verifique o Estado do React:**
```typescript
// Adicione este log no componente
console.log('🔍 Estado atual completo:', {
  tipo,
  configEscala,
  opcoes
});
```

### **2. Verifique o FormData:**
```typescript
// Adicione este log antes do fetch
for (let [key, value] of formData.entries()) {
  console.log('📝 FormData:', key, value);
}
```

### **3. Verifique o Banco de Dados:**
```sql
-- Execute no Supabase
SELECT id, texto, tipo, config_escala 
FROM perguntas 
WHERE tipo = 'escala' 
ORDER BY created_at DESC 
LIMIT 5;
```

## 🎯 **Resultado Esperado**

Após aplicar as correções:
- ✅ **Logs detalhados** no console
- ✅ **Estado atualizado** corretamente
- ✅ **FormData** com valores corretos
- ✅ **API recebe** dados completos
- ✅ **Banco salva** configuração de escala
- ✅ **Pergunta aparece** com tipo correto

## 📞 **Próximos Passos**

1. **Teste** com os logs habilitados
2. **Verifique** cada etapa do processo
3. **Identifique** onde está falhando
4. **Reporte** os logs específicos do erro

Com esses logs, conseguiremos identificar exatamente onde está o problema! 🔍✨
