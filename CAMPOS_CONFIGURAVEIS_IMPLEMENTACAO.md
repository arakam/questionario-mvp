# 🚀 Implementação de Campos Configuráveis para Questionários

## 🎯 **Objetivo**

Transformar os campos fixos de dados pessoais em campos configuráveis, permitindo que cada questionário tenha seus próprios campos personalizados com ordem e configurações específicas.

## ✨ **Funcionalidades Implementadas**

### **1. Campos Configuráveis por Questionário**
- ✅ **Campos personalizados** - Cada questionário pode ter campos diferentes
- ✅ **Ordem configurável** - Os campos podem ser reordenados
- ✅ **Tipos variados** - Suporte a texto, email, número, telefone, CNPJ e seleção
- ✅ **Validações** - Campos obrigatórios, limites numéricos, tamanhos de texto
- ✅ **Opções de seleção** - Para campos do tipo "select"

### **2. Interface de Configuração**
- ✅ **Editor visual** - Interface intuitiva para configurar campos
- ✅ **Reordenação** - Mover campos para cima/baixo
- ✅ **Validação em tempo real** - Feedback imediato sobre erros
- ✅ **Preview** - Visualização dos campos configurados

### **3. Tipos de Campo Suportados**
- 📝 **Texto** - Campo de texto livre
- 📧 **E-mail** - Validação automática de formato
- 🔢 **Número** - Com limites mínimo/máximo
- 📱 **Telefone** - Campo de texto para telefone
- 🏢 **CNPJ** - Campo de texto para CNPJ
- 📋 **Seleção** - Lista de opções predefinidas

## 🗄️ **Banco de Dados**

### **Script SQL para Questionários** (`UPDATE_QUESTIONARIOS_TABLE.sql`)
Execute no Supabase para adicionar o novo campo:

```sql
-- Adicionar campo para campos configuráveis
ALTER TABLE questionarios 
ADD COLUMN IF NOT EXISTS campos_configuraveis JSONB DEFAULT '[...]'::jsonb;

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_questionarios_campos_configuraveis 
ON questionarios USING GIN (campos_configuraveis);
```

### **Script SQL para Pessoas** (`UPDATE_PESSOAS_TABLE.sql`)
Execute no Supabase para atualizar a tabela de pessoas:

```sql
-- Atualizar tabela pessoas para aceitar campos configuráveis
ALTER TABLE pessoas 
ADD COLUMN IF NOT EXISTS telefone TEXT,
ADD COLUMN IF NOT EXISTS cnpj TEXT,
ADD COLUMN IF NOT EXISTS empresa TEXT,
ADD COLUMN IF NOT EXISTS qtd_funcionarios INTEGER,
ADD COLUMN IF NOT EXISTS ramo_atividade TEXT;

-- Adicionar constraint de email único
ALTER TABLE pessoas ADD CONSTRAINT pessoas_email_key UNIQUE (email);
```

### **Estrutura dos Campos Configuráveis**
```json
{
  "id": "nome_campo",
  "label": "Nome exibido para o usuário",
  "tipo": "texto|email|numero|telefone|cnpj|select",
  "obrigatorio": true|false,
  "ordem": 1,
  "placeholder": "Texto de exemplo",
  "opcoes": ["opcao1", "opcao2"], // apenas para tipo "select"
  "validacao": {
    "min": 0,        // para números
    "max": 100,      // para números
    "minLength": 3,  // para texto
    "maxLength": 50, // para texto
    "pattern": "^[0-9]{14}$" // regex para validação
  }
}
```

## 🛠️ **Componentes Criados**

### **1. ConfiguracaoCampos** (`src/components/ConfiguracaoCampos.tsx`)
- ✅ **Gerenciamento de campos** - Adicionar, remover, editar
- ✅ **Reordenação** - Mover campos para cima/baixo
- ✅ **Configurações específicas** - Por tipo de campo
- ✅ **Validações** - Configuração de regras de validação
- ✅ **Interface responsiva** - Funciona em mobile e desktop

### **2. Páginas Atualizadas**
- ✅ **Criação de questionários** - `/admin/questionarios/novo`
- ✅ **Edição de questionários** - `/admin/questionarios/[id]`
- ✅ **Configuração de campos** - `/admin/questionarios/[id]/campos`
- ✅ **Resposta de questionários** - `/q/[slug]`

### **3. APIs Atualizadas**
- ✅ **POST** `/api/admin/questionarios` - Criação com campos
- ✅ **POST** `/api/admin/questionarios/[id]` - Edição básica
- ✅ **POST** `/api/admin/questionarios/[id]/campos` - Atualização de campos
- ✅ **GET** `/api/questionarios/[slug]` - Retorna campos configuráveis
- ✅ **POST** `/api/pessoas/upsert` - Aceita campos configuráveis

## 🚀 **Como Usar**

### **1. Preparação do Banco de Dados**
1. **Execute o script SQL** `UPDATE_QUESTIONARIOS_TABLE.sql` no Supabase
2. **Execute o script SQL** `UPDATE_PESSOAS_TABLE.sql` no Supabase
3. **Verifique se as tabelas** foram atualizadas corretamente

### **2. Criar Questionário com Campos Personalizados**
1. Acesse `/admin/questionarios/novo`
2. Preencha nome e slug
3. Configure os campos desejados:
   - Adicione campos com "➕ Adicionar Campo"
   - Configure tipo, label, placeholder
   - Defina se é obrigatório
   - Configure validações específicas
   - Reordene com as setas ⬆️⬇️
4. Clique em "🚀 Criar Questionário"

### **3. Configurar Campos de Questionário Existente**
1. Acesse `/admin/questionarios/[id]`
2. Clique em "⚙️ Configurar Campos"
3. Modifique os campos na interface de configuração
4. Clique em "💾 Salvar Campos"

### **4. Responder Questionário**
1. Acesse `/q/[slug]`
2. Os campos aparecerão conforme configurados
3. Preencha os dados pessoais
4. Responda as perguntas do questionário

## 📱 **Interface do Usuário**

### **Configuração de Campos:**
- **Cards visuais** para cada campo
- **Controles de reordenação** com setas
- **Configurações específicas** por tipo
- **Validação em tempo real**
- **Interface responsiva**

### **Resposta do Questionário:**
- **Campos dinâmicos** baseados na configuração
- **Validação automática** conforme regras definidas
- **Layout responsivo** para mobile e desktop
- **Feedback visual** para erros

## 🔧 **Configurações por Tipo de Campo**

### **Texto:**
- Placeholder personalizado
- Tamanho mínimo/máximo
- Campo obrigatório opcional

### **E-mail:**
- Validação automática de formato
- Placeholder personalizado
- Campo obrigatório opcional

### **Número:**
- Valor mínimo/máximo
- Placeholder personalizado
- Campo obrigatório opcional

### **Seleção:**
- Lista de opções configuráveis
- Adicionar/remover opções
- Campo obrigatório opcional

## 📊 **Exemplos de Uso**

### **Questionário de Satisfação:**
```json
[
  {
    "id": "nome",
    "label": "Nome completo",
    "tipo": "texto",
    "obrigatorio": true,
    "ordem": 1,
    "placeholder": "Digite seu nome completo"
  },
  {
    "id": "idade",
    "label": "Faixa etária",
    "tipo": "select",
    "obrigatorio": true,
    "ordem": 2,
    "opcoes": ["18-25", "26-35", "36-50", "50+"]
  },
  {
    "id": "satisfacao",
    "label": "Nível de satisfação",
    "tipo": "numero",
    "obrigatorio": true,
    "ordem": 3,
    "validacao": {"min": 1, "max": 10}
  }
]
```

### **Questionário Empresarial:**
```json
[
  {
    "id": "empresa",
    "label": "Nome da empresa",
    "tipo": "texto",
    "obrigatorio": true,
    "ordem": 1
  },
  {
    "id": "cnpj",
    "label": "CNPJ",
    "tipo": "cnpj",
    "obrigatorio": true,
    "ordem": 2
  },
  {
    "id": "setor",
    "label": "Setor de atuação",
    "tipo": "select",
    "obrigatorio": false,
    "ordem": 3,
    "opcoes": ["Tecnologia", "Saúde", "Educação", "Varejo", "Outros"]
  }
]
```

## 🧪 **Testes Recomendados**

### **1. Preparação:**
- ✅ Execute os scripts SQL no Supabase
- ✅ Verifique se as tabelas foram atualizadas
- ✅ Teste a criação de questionários com campos personalizados

### **2. Criação de Questionários:**
- ✅ Teste com diferentes tipos de campo
- ✅ Valide reordenação de campos
- ✅ Teste validações específicas
- ✅ Verifique campos obrigatórios

### **3. Configuração de Campos:**
- ✅ Modifique campos existentes
- ✅ Adicione novos campos
- ✅ Remova campos desnecessários
- ✅ Reordene campos

### **4. Resposta de Questionários:**
- ✅ Teste com campos configuráveis
- ✅ Valide campos obrigatórios
- ✅ Teste validações específicas
- ✅ Verifique responsividade

## 🚨 **Considerações Importantes**

### **Compatibilidade:**
- ✅ **Questionários existentes** continuam funcionando
- ✅ **Campos padrão** são aplicados automaticamente
- ✅ **Migração automática** para novos campos
- ✅ **Tabela pessoas** aceita campos dinâmicos

### **Performance:**
- ✅ **Índice GIN** para consultas JSONB
- ✅ **Lazy loading** de configurações
- ✅ **Cache** de campos configurados
- ✅ **Índices** na tabela pessoas

### **Segurança:**
- ✅ **Validação** de dados JSON
- ✅ **Sanitização** de inputs
- ✅ **Controle de acesso** administrativo
- ✅ **Validação de email** na API

## 🎯 **Próximos Passos**

### **Fase 1 (Atual):**
- ✅ Campos configuráveis por questionário
- ✅ Interface de configuração
- ✅ Validações específicas por tipo
- ✅ Reordenação de campos
- ✅ Edição de campos em questionários existentes
- ✅ API de pessoas atualizada

### **Fase 2 (Futuro):**
- 🔄 **Templates** de campos pré-configurados
- 🔄 **Importação/Exportação** de configurações
- 🔄 **Validações avançadas** com regex
- 🔄 **Campos condicionais** baseados em outros campos

## 📞 **Suporte**

Para implementar ou dúvidas:
1. **Execute os scripts SQL** no Supabase (questionários e pessoas)
2. **Atualize o código** com os novos componentes
3. **Teste a criação** de questionários com campos personalizados
4. **Teste a configuração** de campos em questionários existentes
5. **Verifique a resposta** dos questionários
6. **Valide responsividade** em mobile

## 🎉 **Resultado Final**

Após implementar:
- ✅ **Campos personalizados** por questionário
- ✅ **Ordem configurável** dos campos
- ✅ **Tipos variados** de campo
- ✅ **Validações específicas** por tipo
- ✅ **Interface intuitiva** para configuração
- ✅ **Edição de campos** em questionários existentes
- ✅ **API de pessoas** aceita campos dinâmicos
- ✅ **Experiência personalizada** para cada questionário

## 🔗 **Arquivos Modificados**

- `UPDATE_QUESTIONARIOS_TABLE.sql` - Script SQL para questionários
- `UPDATE_PESSOAS_TABLE.sql` - Script SQL para pessoas
- `src/components/ConfiguracaoCampos.tsx` - Componente de configuração
- `src/app/admin/(protected)/questionarios/novo/page.tsx` - Criação
- `src/app/admin/(protected)/questionarios/[id]/page.tsx` - Edição básica
- `src/app/admin/(protected)/questionarios/[id]/campos/page.tsx` - Configuração de campos
- `src/app/api/admin/questionarios/route.ts` - API de criação
- `src/app/api/admin/questionarios/[id]/route.ts` - API de edição básica
- `src/app/api/admin/questionarios/[id]/campos/route.ts` - API de campos
- `src/app/api/questionarios/[slug]/route.ts` - API de consulta
- `src/app/api/pessoas/upsert/route.ts` - API de pessoas atualizada
- `src/app/q/[slug]/page.tsx` - Página de resposta
