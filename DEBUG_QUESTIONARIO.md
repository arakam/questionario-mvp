# 🐛 Debug do Questionário - Problema de Renderização

## 🚨 **Problema Reportado**

Na página `/q/nps-exemplo` não está mostrando as opções de valores a serem preenchidos para perguntas do tipo escala.

## 🔍 **Passos para Debug**

### **1. Verificar Console do Navegador**
```bash
# 1. Acesse: /q/nps-exemplo
# 2. Pressione F12 → Console
# 3. Procure por logs com emojis:
🔍 Carregando questionário: nps-exemplo
📊 Dados recebidos: {...}
📝 Perguntas carregadas: [...]
🎯 PerguntaEscala renderizada: {...}
📊 Opções da escala geradas: [...]
```

### **2. Verificar Dados da API**
```bash
# Teste diretamente a API:
GET /api/questionarios/nps-exemplo

# Verifique se retorna:
{
  "questionario": {...},
  "perguntas": [
    {
      "id": "...",
      "texto": "...",
      "tipo": "escala",
      "config_escala": {
        "escalaMin": 0,
        "escalaMax": 10,
        "escalaPasso": 1
      }
    }
  ]
}
```

### **3. Verificar Banco de Dados**
```sql
-- No Supabase, execute:
SELECT 
  p.id,
  p.texto,
  p.tipo,
  p.config_escala,
  p.opcoes
FROM perguntas p
JOIN questionario_perguntas qp ON p.id = qp.pergunta_id
JOIN questionarios q ON qp.questionario_id = q.id
WHERE q.slug = 'nps-exemplo'
  AND p.ativa = true;

-- Verifique se:
-- 1. O campo 'tipo' está preenchido
-- 2. O campo 'config_escala' tem dados válidos
-- 3. O campo 'opcoes' está preenchido (se for múltipla escolha)
```

## 🔧 **Possíveis Causas**

### **1. Dados Não Salvos no Banco**
- A pergunta foi criada mas não foi salva com o tipo correto
- O campo `config_escala` está vazio ou nulo
- O campo `opcoes` está vazio ou nulo

### **2. Problema na API**
- A API não está retornando os novos campos
- Erro na consulta SQL
- Problema de permissões

### **3. Problema no Frontend**
- Componentes não estão sendo importados corretamente
- Erro de renderização
- Estado não está sendo atualizado

## 🧪 **Testes para Identificar o Problema**

### **Teste 1: Verificar Logs**
```bash
# Se não aparecer nenhum log:
# - Verifique se o JavaScript está habilitado
# - Verifique se há erros no console
# - Verifique se a página está carregando
```

### **Teste 2: Verificar Dados**
```bash
# Se aparecer "Dados recebidos" mas "Perguntas carregadas" estiver vazio:
# - Problema na API ou no banco
# - Verifique se o questionário existe
# - Verifique se há perguntas ativas
```

### **Teste 3: Verificar Tipo**
```bash
# Se aparecer "Perguntas carregadas" mas o tipo estiver incorreto:
# - Problema no banco de dados
# - Execute o script SQL de atualização
# - Verifique se as perguntas foram criadas corretamente
```

### **Teste 4: Verificar Componentes**
```bash
# Se aparecer "PerguntaEscala renderizada" mas não mostrar a interface:
# - Problema no componente
# - Verifique se há erros de JavaScript
# - Verifique se os dados estão chegando corretamente
```

## 🚀 **Soluções**

### **1. Se o Problema for no Banco**
```sql
-- Execute novamente:
UPDATE_PERGUNTAS_TABLE.sql
UPDATE_RESPOSTAS_TABLE.sql

-- Verifique se as colunas foram criadas:
\d perguntas
\d respostas
```

### **2. Se o Problema for na API**
```bash
# Verifique se a API está funcionando:
curl http://localhost:3008/api/questionarios/nps-exemplo

# Verifique logs do servidor
npm run dev
```

### **3. Se o Problema for no Frontend**
```bash
# Verifique se os componentes existem:
ls src/components/PerguntaEscala.tsx
ls src/components/PerguntaMultiplaEscolha.tsx
ls src/components/PerguntaTexto.tsx

# Verifique se não há erros de build
npm run build
```

## 📋 **Checklist de Verificação**

- [ ] **Console mostra logs** de carregamento
- [ ] **API retorna dados** com novos campos
- [ ] **Banco tem colunas** tipo, opcoes, config_escala
- [ ] **Perguntas têm tipo** correto configurado
- [ ] **Componentes são renderizados** corretamente
- [ ] **Interface mostra** opções de resposta

## 🎯 **Resultado Esperado**

Após corrigir o problema:
- ✅ **Logs aparecem** no console
- ✅ **Dados são carregados** corretamente
- ✅ **Componentes são renderizados** baseado no tipo
- ✅ **Interface mostra** opções apropriadas para cada tipo
- ✅ **Usuário pode responder** perguntas de diferentes tipos

## 📞 **Se Ainda Houver Problemas**

### **1. Compartilhe os Logs:**
- Screenshot do console
- Dados retornados pela API
- Estrutura da tabela no banco

### **2. Descreva o Comportamento:**
- O que aparece na tela?
- Quais erros aparecem?
- Em qual etapa para de funcionar?

### **3. Informações do Ambiente:**
- Versão do Next.js
- Versão do Node.js
- Ambiente (desenvolvimento/produção)

Com essas informações, poderemos identificar e corrigir o problema rapidamente! 🚀✨
