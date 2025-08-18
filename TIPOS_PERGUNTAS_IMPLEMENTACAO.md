# 🚀 Implementação de Múltiplos Tipos de Perguntas

## 🎯 **Objetivo**

Transformar o sistema de perguntas de apenas **Sim/Não** para suportar **6 tipos diferentes**:

1. ✅ **Sim/Não** - Resposta simples
2. 🔘 **Múltipla Escolha (Única)** - Uma opção entre várias
3. ☑️ **Múltipla Escolha (Múltipla)** - Várias opções podem ser selecionadas
4. 📊 **Escala/Nota** - Avaliação numérica
5. 💬 **Texto Curto** - Resposta limitada
6. 📝 **Texto Longo** - Resposta livre

## 🛠️ **Componentes Criados**

### **1. PerguntaTypeSelector** (`src/components/PerguntaTypeSelector.tsx`)
- ✅ Seleção visual de tipo de pergunta
- ✅ Descrições claras para cada tipo
- ✅ Interface intuitiva com ícones
- ✅ Validação automática

### **2. OpcoesMultiplaEscolha** (`src/components/OpcoesMultiplaEscolha.tsx`)
- ✅ Gerenciamento dinâmico de opções
- ✅ Adicionar/remover opções
- ✅ Campos para texto e valor
- ✅ Validação de mínimo 2 opções

### **3. ConfiguracaoEscala** (`src/components/ConfiguracaoEscala.tsx`)
- ✅ Configuração de valor mínimo/máximo
- ✅ Definição de passo
- ✅ Preview da escala gerada
- ✅ Validações automáticas

## 🗄️ **Banco de Dados**

### **Script SQL** (`UPDATE_PERGUNTAS_TABLE.sql`)
Execute no Supabase para adicionar os novos campos:

```sql
-- Adicionar novos campos
ALTER TABLE perguntas 
ADD COLUMN IF NOT EXISTS tipo VARCHAR(50) DEFAULT 'sim_nao',
ADD COLUMN IF NOT EXISTS opcoes JSONB,
ADD COLUMN IF NOT EXISTS config_escala JSONB;

-- Criar índices e constraints
CREATE INDEX IF NOT EXISTS idx_perguntas_tipo ON perguntas(tipo);
```

### **Novos Campos:**
- **`tipo`**: VARCHAR(50) - Tipo da pergunta
- **`opcoes`**: JSONB - Opções para múltipla escolha
- **`config_escala`**: JSONB - Configuração de escala

## 🚀 **Passos para Implementar**

### **1. Atualizar Banco de Dados**
```bash
# No painel do Supabase, execute o script SQL:
# UPDATE_PERGUNTAS_TABLE.sql
```

### **2. Atualizar o Código**
```bash
# Copie os novos componentes para src/components/
# Atualize as páginas de perguntas
# Atualize a API de perguntas
```

### **3. Testar a Funcionalidade**
```bash
npm run dev
# Acesse /admin/perguntas/nova
# Teste cada tipo de pergunta
```

## 📱 **Interface do Usuário**

### **Criação de Perguntas:**
1. **Seleção de Tipo** - Cards visuais para escolher o tipo
2. **Campos Básicos** - Texto, peso, categoria, status
3. **Configurações Específicas** - Aparecem conforme o tipo selecionado

### **Listagem de Perguntas:**
- **Stats Cards** - Contadores por tipo
- **Tabela** - Coluna de tipo com badges coloridos
- **Filtros** - Por categoria e tipo

## 🔧 **Configurações por Tipo**

### **Sim/Não:**
- Sem configurações adicionais
- Resposta padrão: Sim (1) / Não (0)

### **Múltipla Escolha (Única/Múltipla):**
- Lista de opções com texto e valor
- Mínimo de 2 opções
- Campo valor opcional para cálculos

### **Escala:**
- Valor mínimo e máximo
- Passo entre valores
- Preview da escala gerada

### **Texto (Curto/Longo):**
- Sem configurações adicionais
- Validação de tamanho (se necessário)

## 📊 **Estrutura de Dados**

### **Exemplo de Pergunta Sim/Não:**
```json
{
  "id": "1",
  "texto": "Você gostou do serviço?",
  "tipo": "sim_nao",
  "peso": 1,
  "ativa": true,
  "opcoes": null,
  "config_escala": null
}
```

### **Exemplo de Múltipla Escolha:**
```json
{
  "id": "2",
  "texto": "Qual sua faixa etária?",
  "tipo": "multipla_escolha_unica",
  "peso": 1,
  "ativa": true,
  "opcoes": [
    {"id": "1", "texto": "18-25", "valor": "18-25"},
    {"id": "2", "texto": "26-35", "valor": "26-35"},
    {"id": "3", "texto": "36-50", "valor": "36-50"}
  ],
  "config_escala": null
}
```

### **Exemplo de Escala:**
```json
{
  "id": "3",
  "texto": "Avalie sua satisfação",
  "tipo": "escala",
  "peso": 2,
  "ativa": true,
  "opcoes": null,
  "config_escala": {
    "escalaMin": 1,
    "escalaMax": 5,
    "escalaPasso": 1
  }
}
```

## 🧪 **Testes Recomendados**

### **1. Criação de Perguntas:**
- ✅ Teste cada tipo de pergunta
- ✅ Valide campos obrigatórios
- ✅ Teste configurações específicas

### **2. Validações:**
- ✅ Múltipla escolha com menos de 2 opções
- ✅ Escala com valores inválidos
- ✅ Campos obrigatórios vazios

### **3. Interface:**
- ✅ Responsividade em mobile
- ✅ Navegação entre tipos
- ✅ Preview de configurações

## 🚨 **Considerações Importantes**

### **Compatibilidade:**
- ✅ **Perguntas existentes** continuam funcionando
- ✅ **Tipo padrão** é 'sim_nao' para compatibilidade
- ✅ **Campos opcionais** não quebram funcionalidade existente

### **Performance:**
- ✅ **Índices** criados para consultas por tipo
- ✅ **JSONB** para dados estruturados
- ✅ **Validações** no banco e aplicação

### **Segurança:**
- ✅ **Validação** de tipos no banco
- ✅ **Sanitização** de dados JSON
- ✅ **Constraints** para integridade

## 🎯 **Próximos Passos**

### **Fase 1 (Atual):**
- ✅ CRUD de perguntas com múltiplos tipos
- ✅ Interface administrativa
- ✅ Validações básicas

### **Fase 2 (Futuro):**
- 🔄 **Questionários** - Suporte a diferentes tipos
- 🔄 **Respostas** - Coleta de dados por tipo
- 🔄 **Relatórios** - Análise por tipo de pergunta
- 🔄 **Frontend** - Formulários dinâmicos

## 📞 **Suporte**

Para implementar ou dúvidas:
1. **Execute o script SQL** no Supabase
2. **Atualize o código** com os novos componentes
3. **Teste cada tipo** de pergunta
4. **Verifique logs** para erros
5. **Valide responsividade** em mobile

## 🎉 **Resultado Final**

Após implementar:
- ✅ **6 tipos** de perguntas disponíveis
- ✅ **Interface intuitiva** para criação
- ✅ **Validações robustas** por tipo
- ✅ **Compatibilidade** com perguntas existentes
- ✅ **Base sólida** para futuras funcionalidades
