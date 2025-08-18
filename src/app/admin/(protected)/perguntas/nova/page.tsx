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

interface Categoria {
  id: string;
  nome: string;
}

export default function NovaPergunta() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  // Estados para os tipos de pergunta
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

  // Reset da configuração de escala quando o tipo muda para escala
  useEffect(() => {
    if (tipo === 'escala') {
      // Reseta para valores padrão mais apropriados
      setConfigEscala({
        escalaMin: 0,
        escalaMax: 10,
        escalaPasso: 1
      });
      console.log('🔄 Reset da configuração de escala para valores padrão');
    }
  }, [tipo]);

  useEffect(() => {
    const loadCategorias = async () => {
      try {
        const response = await fetch('/api/admin/categorias');
        if (response.ok) {
          const categoriasData = await response.json();
          setCategorias(categoriasData);
        }
      } catch (error) {
        console.error('Erro ao carregar categorias:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCategorias();
  }, []);

  const handleSubmit = async (formData: FormData) => {
    // Adiciona os campos específicos do tipo de pergunta
    formData.append('tipo', tipo);
    
    if (tipo.includes('multipla_escolha')) {
      formData.append('opcoes', JSON.stringify(opcoes));
    }
    
    if (tipo === 'escala') {
      console.log('🔍 Salvando configuração de escala:', configEscala);
      formData.append('config_escala', JSON.stringify(configEscala));
      
      // Validação adicional antes de enviar
      if (!configEscala.escalaMin || !configEscala.escalaMax || !configEscala.escalaPasso) {
        alert('Por favor, configure todos os valores da escala antes de salvar');
        return;
      }
      
      if (configEscala.escalaMin >= configEscala.escalaMax) {
        alert('O valor mínimo deve ser menor que o máximo');
        return;
      }
    }

    // Log dos dados que serão enviados
    console.log('📤 Dados do formulário:', {
      tipo,
      opcoes: tipo.includes('multipla_escolha') ? opcoes : null,
      config_escala: tipo === 'escala' ? configEscala : null
    });

    // Envia o formulário
    const response = await fetch('/api/admin/perguntas', {
      method: 'POST',
      body: formData
    });

    if (response.ok) {
      window.location.href = '/admin/perguntas';
    } else {
      const error = await response.json();
      alert('Erro ao criar pergunta: ' + error.error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ➕ Nova Pergunta
        </h1>
        <p className="text-gray-600">
          Crie uma nova pergunta para seus questionários
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
                defaultValue={1} 
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
              <select name="categoria_id" className="input-field">
                <option value="">Sem categoria</option>
                {categorias.map((categoria) => (
                  <option key={categoria.id} value={categoria.id}>
                    {categoria.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="ativa" defaultChecked className="rounded" />
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
            💾 Salvar Pergunta
          </button>
          <a href="/admin/perguntas" className="btn-secondary">
            ❌ Cancelar
          </a>
        </div>
      </form>
    </div>
  );
}
