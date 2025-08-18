'use client';

import { useState, useEffect } from 'react';
import PerguntaTypeSelector, { PerguntaTipo } from '@/components/PerguntaTypeSelector';
import OpcoesMultiplaEscolha from '@/components/OpcoesMultiplaEscolha';
import ConfiguracaoEscala from '@/components/ConfiguracaoEscala';

interface Opcao {
  id: string;
  texto: string;
  valor: string;
}

interface ConfiguracaoEscala {
  escalaMin: number;
  escalaMax: number;
  escalaPasso: number;
}

interface Pergunta {
  id: string;
  texto: string;
  peso: number;
  ativa: boolean;
  categoria_id: string | null;
  tipo: string;
  opcoes?: string;
  config_escala?: string;
}

interface Categoria {
  id: string;
  nome: string;
}

export default function EditPergunta({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Estados para os tipos de pergunta - serão inicializados quando os dados forem carregados
  const [pergunta, setPergunta] = useState<Pergunta | null>(null);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [perguntaId, setPerguntaId] = useState<string | null>(null);

  // Estados para os tipos de pergunta - serão inicializados quando os dados forem carregados
  const [tipo, setTipo] = useState<PerguntaTipo>('sim_nao');
  const [opcoes, setOpcoes] = useState<Opcao[]>([
    { id: '1', texto: 'Sim', valor: '1' },
    { id: '2', texto: 'Não', valor: '0' }
  ]);
  const [configEscala, setConfigEscala] = useState<ConfiguracaoEscala>({
    escalaMin: 0,
    escalaMax: 10,
    escalaPasso: 1
  });

  // Log quando o tipo muda
  useEffect(() => {
    console.log('🔄 Tipo de pergunta alterado para:', tipo);
    console.log('📊 Estado atual da escala:', configEscala);
  }, [tipo, configEscala]);

  // Log quando a configuração de escala muda
  useEffect(() => {
    if (tipo === 'escala') {
      console.log('📈 Configuração de escala atualizada:', configEscala);
    }
  }, [configEscala, tipo]);

  // Primeiro useEffect para resolver o params
  useEffect(() => {
    const resolveParams = async () => {
      try {
        const { id } = await params;
        setPerguntaId(id);
      } catch (err) {
        setError('Erro ao obter ID da pergunta');
        setLoading(false);
      }
    };
    resolveParams();
  }, [params]);

  // Segundo useEffect para carregar dados quando tivermos o ID
  useEffect(() => {
    if (!perguntaId) return;

    const loadData = async () => {
      try {
        console.log('🔍 Carregando dados para pergunta:', perguntaId);
        
        // Busca a pergunta e categorias
        const [perguntaRes, categoriasRes] = await Promise.all([
          fetch(`/api/admin/perguntas/${perguntaId}`),
          fetch('/api/admin/categorias')
        ]);

        console.log('📡 Respostas das APIs:', {
          pergunta: perguntaRes.status,
          categorias: categoriasRes.status
        });

        if (!perguntaRes.ok) {
          const errorText = await perguntaRes.text();
          console.error('❌ Erro na API de pergunta:', errorText);
          throw new Error(`Erro ao carregar pergunta: ${perguntaRes.status} ${perguntaRes.statusText}`);
        }

        if (!categoriasRes.ok) {
          const errorText = await categoriasRes.text();
          console.error('❌ Erro na API de categorias:', errorText);
          throw new Error(`Erro ao carregar categorias: ${categoriasRes.status} ${categoriasRes.statusText}`);
        }

        const perguntaData = await perguntaRes.json();
        const categoriasData = await categoriasRes.json();

        console.log('✅ Dados carregados:', {
          pergunta: perguntaData,
          categorias: categoriasData.length
        });

        setPergunta(perguntaData);
        setCategorias(categoriasData);

        // Configura o tipo e configurações específicas
        if (perguntaData.tipo) {
          setTipo(perguntaData.tipo);
        }

        if (perguntaData.opcoes) {
          try {
            const opcoesParsed = JSON.parse(perguntaData.opcoes);
            if (Array.isArray(opcoesParsed)) {
              setOpcoes(opcoesParsed);
            }
          } catch (e) {
            console.warn('⚠️ Erro ao parsear opções:', e);
            // Mantém as opções padrão se der erro
          }
        }

        if (perguntaData.config_escala) {
          try {
            console.log('🔍 Parseando config_escala:', perguntaData.config_escala);
            const configParsed = JSON.parse(perguntaData.config_escala);
            console.log('✅ Config_escala parseado:', configParsed);
            
            if (configParsed.escalaMin !== undefined && configParsed.escalaMax !== undefined && configParsed.escalaPasso !== undefined) {
              console.log('🎯 Atualizando estado da escala com:', configParsed);
              setConfigEscala({
                escalaMin: configParsed.escalaMin,
                escalaMax: configParsed.escalaMax,
                escalaPasso: configParsed.escalaPasso
              });
            } else {
              console.warn('⚠️ Config_escala não tem todos os campos necessários:', configParsed);
            }
          } catch (e) {
            console.warn('⚠️ Erro ao parsear configuração de escala:', e);
            console.warn('⚠️ Valor original:', perguntaData.config_escala);
            // Mantém a configuração padrão se der erro
          }
        } else {
          console.log('ℹ️ Nenhuma config_escala encontrada, usando valores padrão');
        }

      } catch (err) {
        console.error('❌ Erro ao carregar dados:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [perguntaId]);

  const handleSubmit = async (formData: FormData) => {
    if (!pergunta) return;

    // Adiciona os campos específicos do tipo de pergunta
    formData.append('tipo', tipo);
    
    if (tipo.includes('multipla_escolha')) {
      formData.append('opcoes', JSON.stringify(opcoes));
    }
    
    if (tipo === 'escala') {
      formData.append('config_escala', JSON.stringify(configEscala));
    }

    // Envia o formulário
    const response = await fetch(`/api/admin/perguntas/${pergunta.id}`, {
      method: 'PUT',
      body: formData
    });

    if (response.ok) {
      window.location.href = '/admin/perguntas';
    } else {
      const error = await response.json();
      alert('Erro ao atualizar pergunta: ' + error.error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (error || !pergunta) {
    return (
      <div className="p-6 text-red-600">
        <h2 className="text-xl font-semibold mb-4">❌ Erro ao carregar pergunta</h2>
        <p className="mb-4">{error || 'Pergunta não encontrada.'}</p>
        <a href="/admin/perguntas" className="text-blue-600 hover:underline">
          ← Voltar para listagem
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ✏️ Editar Pergunta
        </h1>
        <p className="text-gray-600">
          Modifique os dados da pergunta selecionada
        </p>
      </div>

      <form action={handleSubmit} className="space-y-6">
        {/* Tipo de Pergunta */}
        <div className="card">
          <PerguntaTypeSelector
            value={tipo}
            onChange={setTipo}
          />
        </div>

        {/* Campos Básicos */}
        <div className="card space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Informações Básicas</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Texto da Pergunta
            </label>
            <textarea 
              name="texto" 
              required 
              defaultValue={pergunta.texto}
              placeholder="Digite a pergunta aqui..." 
              className="input-field min-h-[100px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Peso
              </label>
              <input 
                type="number" 
                name="peso" 
                min={0} 
                defaultValue={pergunta.peso} 
                required 
                className="input-field"
                placeholder="1"
              />
              <p className="text-xs text-gray-600 mt-1">
                Peso para cálculos de pontuação
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <select name="categoria_id" defaultValue={pergunta.categoria_id || ''} className="input-field">
                <option value="">Sem categoria</option>
                {categorias.map((categoria) => (
                  <option 
                    key={categoria.id} 
                    value={categoria.id}
                  >
                    {categoria.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input 
              type="checkbox" 
              name="ativa" 
              defaultChecked={pergunta.ativa} 
              className="rounded" 
            /> 
            Ativa
          </label>
        </div>

        {/* Configurações Específicas por Tipo */}
        {tipo.includes('multipla_escolha') && (
          <div className="card">
            <OpcoesMultiplaEscolha
              opcoes={opcoes}
              onChange={setOpcoes}
            />
          </div>
        )}

        {tipo === 'escala' && (
          <div className="card">
            <ConfiguracaoEscala
              escalaMin={configEscala.escalaMin}
              escalaMax={configEscala.escalaMax}
              escalaPasso={configEscala.escalaPasso}
              onChange={setConfigEscala}
            />
          </div>
        )}

        {/* Botões */}
        <div className="flex gap-4">
          <button type="submit" className="btn-primary">
            💾 Salvar Alterações
          </button>
          <a href="/admin/perguntas" className="btn-secondary">
            ❌ Cancelar
          </a>
          <button
            type="button"
            onClick={async () => {
              if (confirm('Tem certeza que deseja excluir esta pergunta?')) {
                const response = await fetch(`/api/admin/perguntas/${pergunta.id}`, {
                  method: 'DELETE'
                });
                if (response.ok) {
                  window.location.href = '/admin/perguntas';
                } else {
                  alert('Erro ao excluir pergunta');
                }
              }
            }}
            className="btn-danger"
          >
            🗑️ Excluir
          </button>
        </div>
      </form>
    </div>
  );
}
