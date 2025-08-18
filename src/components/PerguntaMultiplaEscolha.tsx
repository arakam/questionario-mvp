'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

interface Opcao {
  id: string;
  texto: string;
  valor: string;
}

interface PerguntaMultiplaEscolhaProps {
  pergunta: {
    id: string;
    texto: string;
    tipo: string;
    opcoes: string | Opcao[];
  };
  onResponder: (resposta: string | string[]) => void;
}

export default function PerguntaMultiplaEscolha({ pergunta, onResponder }: PerguntaMultiplaEscolhaProps) {
  const [selecoes, setSelecoes] = useState<string[]>([]);
  const isMultipla = pergunta.tipo === 'multipla_escolha_multipla';

  // Parse das opções se for string JSON
  const opcoes = useMemo(() => {
    if (typeof pergunta.opcoes === 'string') {
      try {
        return JSON.parse(pergunta.opcoes);
      } catch (e) {
        console.error('❌ Erro ao fazer parse das opções:', e);
        return [];
      }
    }
    return pergunta.opcoes || [];
  }, [pergunta.opcoes]);

  console.log('🔧 Opções parseadas:', opcoes);

  // Verifica se as opções são válidas
  if (!Array.isArray(opcoes) || opcoes.length === 0) {
    console.error('❌ Opções inválidas:', opcoes);
    return (
      <div className="text-center p-8">
        <div className="text-red-600 mb-4">⚠️ Erro na configuração das opções</div>
        <div className="text-sm text-gray-600">
          Esta pergunta está configurada incorretamente. 
          Entre em contato com o administrador.
        </div>
      </div>
    );
  }

  const handleSelecao = (valor: string) => {
    if (isMultipla) {
      // Múltipla escolha: adiciona/remove da lista
      setSelecoes(prev => 
        prev.includes(valor) 
          ? prev.filter(v => v !== valor)
          : [...prev, valor]
      );
    } else {
      // Escolha única: substitui a seleção
      setSelecoes([valor]);
    }
  };

  const handleConfirmar = () => {
    if (selecoes.length > 0) {
      const resposta = isMultipla ? selecoes : selecoes[0];
      onResponder(resposta);
    }
  };

  const getOpcaoSelecionada = (valor: string) => {
    return selecoes.includes(valor);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-xl sm:text-2xl leading-tight font-medium mb-6">
          {pergunta.texto}
        </h2>

        {/* Instruções */}
        <div className="text-sm text-gray-600 mb-6">
          {isMultipla 
            ? 'Selecione uma ou mais opções:'
            : 'Selecione uma opção:'
          }
        </div>
        
        {/* Opções */}
        <div className="grid gap-3 mb-8">
          {opcoes.map((opcao) => (
            <motion.button
              key={opcao.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelecao(opcao.valor)}
              className={`
                w-full p-4 rounded-xl border-2 text-left transition-all duration-200
                ${getOpcaoSelecionada(opcao.valor)
                  ? 'border-black bg-black text-white shadow-lg'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-center">
                <div className={`
                  w-5 h-5 rounded-full border-2 mr-3 flex items-center justify-center
                  ${getOpcaoSelecionada(opcao.valor)
                    ? 'border-white bg-white'
                    : 'border-gray-300'
                  }
                `}>
                  {getOpcaoSelecionada(opcao.valor) && (
                    <div className="w-2 h-2 rounded-full bg-black"></div>
                  )}
                </div>
                <span className="font-medium">{opcao.texto}</span>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Botão de confirmação */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleConfirmar}
          disabled={selecoes.length === 0}
          className={`
            px-8 py-4 rounded-2xl font-medium text-lg transition-all
            ${selecoes.length > 0
              ? 'bg-black text-white hover:bg-gray-800 shadow-lg'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          Confirmar Resposta
        </motion.button>

        {/* Dica */}
        <div className="text-sm text-gray-500 mt-4">
          {isMultipla 
            ? 'Clique nas opções desejadas e depois em "Confirmar Resposta"'
            : 'Clique em uma opção e depois em "Confirmar Resposta"'
          }
        </div>
      </motion.div>
    </div>
  );
}
