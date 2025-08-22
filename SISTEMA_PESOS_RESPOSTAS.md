# 🎯 Sistema de Pesos para Respostas de Questionários

## 📊 **Visão Geral**

O sistema de pesos permite avaliar o desempenho dos respondentes baseado na importância (peso) de cada pergunta. Cada pergunta tem um peso numérico que representa sua relevância no questionário. **Agora com análise por categoria!**

## 🔢 **Como Funciona**

### **1. Definição de Pesos**
- Cada pergunta tem um campo `peso` (número inteiro)
- Pesos maiores = perguntas mais importantes
- Pesos menores = perguntas menos importantes
- Exemplo: pergunta crítica pode ter peso 10, pergunta secundária peso 2

### **2. Cálculo dos Pesos**

#### **Peso Total Possível**
```
Soma de todos os pesos de todas as perguntas do questionário
```
- **Exemplo**: Se o questionário tem 5 perguntas com pesos [5, 3, 8, 2, 10], o peso total é 28

#### **Peso das Respostas SIM**
```
Soma dos pesos das perguntas Sim/Não que foram respondidas com "SIM"
```
- **Exemplo**: Se 3 perguntas Sim/Não com pesos [5, 3, 8] foram respondidas com SIM, o peso total SIM é 16

#### **Peso das Respostas NÃO**
```
Soma dos pesos das perguntas Sim/Não que foram respondidas com "NÃO"
```
- **Exemplo**: Se 2 perguntas Sim/Não com pesos [2, 10] foram respondidas com NÃO, o peso total NÃO é 12

#### **Percentual de Aproveitamento**
```
(Peso das Respostas SIM ÷ Peso Total Possível) × 100
```
- **Exemplo**: (16 ÷ 28) × 100 = 57% de aproveitamento

### **3. Análise por Categoria** 🆕
```
Para cada categoria de pergunta, calcula:
- Peso total da categoria
- Peso das respostas SIM da categoria
- Peso das respostas NÃO da categoria
- Percentual de aproveitamento da categoria
- Total de perguntas vs perguntas respondidas
```

## 📋 **Tipos de Pergunta e Pesos**

### **Perguntas Sim/Não (sim_nao)**
- ✅ **Resposta SIM**: Peso é contabilizado no somatório SIM
- ❌ **Resposta NÃO**: Peso é contabilizado no somatório NÃO
- **Exemplo**: Pergunta com peso 5 respondida com SIM = +5 no somatório SIM

### **Perguntas de Escala (escala)**
- 🔢 **Peso não é contabilizado** nos somatórios SIM/NÃO
- 📊 **Valor da escala** é exibido na resposta
- **Exemplo**: Pergunta com peso 8 respondida com escala 7 = peso 8 não conta nos somatórios

### **Perguntas de Múltipla Escolha**
- 🔘 **Peso não é contabilizado** nos somatórios SIM/NÃO
- 📝 **Opção selecionada** é exibida na resposta
- **Exemplo**: Pergunta com peso 6 com múltipla escolha = peso 6 não conta nos somatórios

### **Perguntas de Texto**
- 📝 **Peso não é contabilizado** nos somatórios SIM/NÃO
- 💬 **Texto da resposta** é exibido
- **Exemplo**: Pergunta com peso 4 com resposta de texto = peso 4 não conta nos somatórios

## 🎯 **Casos de Uso**

### **1. Avaliação de Conformidade**
- **Perguntas críticas** recebem pesos altos (8-10)
- **Perguntas importantes** recebem pesos médios (4-7)
- **Perguntas secundárias** recebem pesos baixos (1-3)
- **Percentual de aproveitamento** indica nível de conformidade

### **2. Auditoria e Compliance**
- **Peso total possível** = pontuação máxima do questionário
- **Peso das respostas SIM** = pontuação obtida
- **Percentual** = score de compliance (ex: 85% = aprovado)

### **3. Análise de Desempenho**
- **Comparação** entre diferentes respondentes
- **Ranking** baseado no percentual de aproveitamento
- **Identificação** de áreas que precisam de melhoria

### **4. Análise por Categoria** 🆕
- **Identificação** de categorias com baixo desempenho
- **Foco** em áreas específicas que precisam de melhoria
- **Comparação** de performance entre diferentes domínios
- **Priorização** de ações baseada em categorias críticas

## 📊 **Exemplo Prático**

### **Questionário de Compliance com Categorias**

| Categoria | Pergunta | Tipo | Peso | Resposta | Peso Contabilizado |
|-----------|----------|------|------|----------|-------------------|
| **Segurança** | A empresa possui política de segurança? | Sim/Não | 10 | SIM | +10 (SIM) |
| **Segurança** | Os funcionários recebem treinamento? | Sim/Não | 8 | SIM | +8 (SIM) |
| **Segurança** | Existe backup dos dados? | Sim/Não | 6 | NÃO | +6 (NÃO) |
| **Processos** | Qual o nível de satisfação? | Escala | 5 | 8 | 0 (não conta) |
| **Processos** | Descreva os processos: | Texto | 3 | "Processos documentados" | 0 (não conta) |

### **Cálculos Gerais:**
- **Peso Total Possível**: 10 + 8 + 6 + 5 + 3 = **32**
- **Peso Respostas SIM**: 10 + 8 = **18**
- **Peso Respostas NÃO**: 6 = **6**
- **Percentual de Aproveitamento**: (18 ÷ 32) × 100 = **56%**

### **Cálculos por Categoria:** 🆕

#### **Categoria: Segurança**
- **Peso Total**: 10 + 8 + 6 = **24**
- **Peso SIM**: 10 + 8 = **18**
- **Peso NÃO**: 6 = **6**
- **Aproveitamento**: (18 ÷ 24) × 100 = **75%**
- **Perguntas**: 3/3 respondidas

#### **Categoria: Processos**
- **Peso Total**: 5 + 3 = **8**
- **Peso SIM**: 0 (não há perguntas Sim/Não)
- **Peso NÃO**: 0 (não há perguntas Sim/Não)
- **Aproveitamento**: **0%** (não aplicável)
- **Perguntas**: 2/2 respondidas

## 🛠️ **Implementação Técnica**

### **Código dos Cálculos Gerais:**
```typescript
// Peso total possível
const pesoTotalPossivel = itens.reduce((sum, item) => sum + item.peso, 0);

// Peso das respostas SIM (apenas perguntas sim/não)
const pesoRespostasSim = itens.reduce((sum, item) => {
  if (item.tipo === 'sim_nao' && item.resposta === true) {
    return sum + item.peso;
  }
  return sum;
}, 0);

// Peso das respostas NÃO (apenas perguntas sim/não)
const pesoRespostasNao = itens.reduce((sum, item) => {
  if (item.tipo === 'sim_nao' && item.resposta === false) {
    return sum + item.peso;
  }
  return sum;
}, 0);

// Percentual de aproveitamento geral
const percentualAproveitamento = pesoTotalPossivel > 0 
  ? Math.round((pesoRespostasSim / pesoTotalPossivel) * 100) 
  : 0;
```

### **Código dos Cálculos por Categoria:** 🆕
```typescript
// Cálculos por categoria
const resumoPorCategoria: ResumoCategoria[] = [];

// Agrupar perguntas por categoria
const perguntasPorCategoria = new Map<string, typeof itens>();

for (const item of itens) {
  const categoriaId = item.categoria_id || 'sem_categoria';
  if (!perguntasPorCategoria.has(categoriaId)) {
    perguntasPorCategoria.set(categoriaId, []);
  }
  perguntasPorCategoria.get(categoriaId)!.push(item);
}

// Calcular resumo para cada categoria
for (const [categoriaId, perguntasCategoria] of perguntasPorCategoria) {
  const pesoTotalCategoria = perguntasCategoria.reduce((sum, item) => sum + item.peso, 0);
  
  const pesoSimCategoria = perguntasCategoria.reduce((sum, item) => {
    if (item.tipo === 'sim_nao' && item.resposta === true) {
      return sum + item.peso;
    }
    return sum;
  }, 0);
  
  const pesoNaoCategoria = perguntasCategoria.reduce((sum, item) => {
    if (item.tipo === 'sim_nao' && item.resposta === false) {
      return sum + item.peso;
    }
    return sum;
  }, 0);
  
  const percentualCategoria = pesoTotalCategoria > 0 
    ? Math.round((pesoSimCategoria / pesoTotalCategoria) * 100) 
    : 0;
  
  // ... resto da lógica
}
```

### **Interface Visual:**
- **Cards coloridos** para cada métrica geral
- **Grid de categorias** com resumo individual
- **Cores indicativas** por nível de aproveitamento
- **Tabela expandida** com coluna de categoria

## 🎨 **Interface do Usuário**

### **Cards de Resumo Geral:**
1. **🔵 Peso Total Possível** - Soma de todos os pesos
2. **🟢 Peso Respostas SIM** - Soma dos pesos das respostas SIM
3. **🔴 Peso Respostas NÃO** - Soma dos pesos das respostas NÃO
4. **🟣 Aproveitamento Geral** - Percentual SIM ÷ Total

### **Resumo por Categoria:** 🆕
- **Cards individuais** para cada categoria
- **Percentual destacado** com cores indicativas
- **Métricas específicas** por categoria
- **Ordenação** por desempenho (melhor para pior)

### **Tabela de Respostas:**
- **Coluna Categoria** adicionada
- **Coluna Peso** destacada em negrito
- **Tipos de pergunta** com cores diferentes
- **Respostas** formatadas conforme o tipo
- **Timestamps** de quando foi respondido

## 📈 **Métricas e KPIs**

### **Indicadores Principais:**
- **Taxa de Resposta**: Respostas ÷ Total de Perguntas
- **Score de Compliance**: Peso SIM ÷ Peso Total
- **Distribuição de Pesos**: Como os pesos estão distribuídos
- **Tempo de Resposta**: Média do tempo para responder

### **Indicadores por Categoria:** 🆕
- **Performance por Domínio**: Aproveitamento específico de cada categoria
- **Identificação de Gargalos**: Categorias com baixo desempenho
- **Comparação Setorial**: Performance entre diferentes áreas
- **Foco em Melhorias**: Priorização baseada em categorias críticas

### **Relatórios Possíveis:**
- **Ranking de Respondentes** por percentual geral
- **Análise por Categoria** de pergunta
- **Tendências Temporais** de respostas por categoria
- **Comparação entre Questionários** por domínio
- **Dashboard Executivo** com visão consolidada por categoria

## 🔮 **Funcionalidades Futuras**

### **1. Pesos Dinâmicos**
- **Pesos condicionais** baseados em outras respostas
- **Pesos adaptativos** conforme o contexto
- **Pesos por perfil** do respondente

### **2. Análise Avançada**
- **Correlações** entre diferentes categorias
- **Padrões** de resposta por peso e categoria
- **Alertas** para baixo aproveitamento por categoria
- **Benchmarks** entre diferentes domínios

### **3. Dashboard Executivo**
- **Visão consolidada** de múltiplos questionários
- **Gráficos** de evolução temporal por categoria
- **Métricas comparativas** entre períodos e categorias
- **Relatórios automáticos** de performance por domínio

## ✅ **Benefícios do Sistema**

1. **📊 Avaliação Quantitativa** - Métricas objetivas de desempenho
2. **🎯 Foco nas Prioridades** - Perguntas importantes têm mais peso
3. **📈 Acompanhamento** - Evolução do compliance ao longo do tempo
4. **🔍 Análise Comparativa** - Comparação entre respondentes
5. **📋 Relatórios Executivos** - Dados para tomada de decisão
6. **🏷️ Análise por Categoria** - Identificação de áreas específicas de melhoria 🆕
7. **🎯 Foco Direcionado** - Priorização de ações por domínio 🆕
8. **📊 Visão Granular** - Performance detalhada por categoria 🆕

## 🚀 **Como Usar**

### **1. Configurar Pesos e Categorias:**
- Ao criar perguntas, defina o peso apropriado
- Use pesos altos para perguntas críticas
- Use pesos baixos para perguntas secundárias
- **Organize perguntas em categorias** para análise segmentada

### **2. Analisar Resultados:**
- Acesse o detalhe das respostas
- Verifique os cards de resumo geral
- **Analise o resumo por categoria**
- Identifique categorias com baixo desempenho

### **3. Tomar Ações:**
- Identifique áreas com baixo aproveitamento geral
- **Foque em categorias específicas** que precisam de melhoria
- Use os dados para melhorar processos por domínio
- **Priorize ações** baseadas no desempenho por categoria

## 🎯 **Exemplo de Uso Prático**

### **Cenário: Questionário de Compliance Empresarial**

1. **Categoria: Segurança da Informação** - 75% de aproveitamento
   - ✅ Política de segurança implementada
   - ✅ Treinamento de funcionários
   - ❌ Backup de dados não configurado

2. **Categoria: Processos Internos** - 60% de aproveitamento
   - ✅ Documentação de processos
   - ❌ Controles de qualidade
   - ❌ Auditorias regulares

3. **Categoria: Recursos Humanos** - 90% de aproveitamento
   - ✅ Política de contratação
   - ✅ Treinamento contínuo
   - ✅ Avaliação de desempenho

### **Ações Recomendadas:**
1. **Prioridade Alta**: Melhorar backup de dados (Segurança)
2. **Prioridade Média**: Implementar controles de qualidade (Processos)
3. **Prioridade Baixa**: Manter excelência em RH

O sistema de pesos com análise por categoria transforma questionários simples em ferramentas poderosas de avaliação, compliance e análise de desempenho por domínio! 🎯✨🏷️
