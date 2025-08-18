'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';

interface PerguntaEscalaProps {
  pergunta: {
    id: string;
    texto: string;
    config_escala: string | {
      escalaMin: number;
      escalaMax: number;
      escalaPasso: number;
    };
  };
  onResponder: (resposta: number) => void;
}

export default function PerguntaEscala({ pergunta, onResponder }: PerguntaEscalaProps) {
  console.log('🎯 PerguntaEscala renderizada:', pergunta);
  
  const [valorSelecionado, setValorSelecionado] = useState<number | null>(null);
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);

  // Parse da config_escala se for string JSON
  const configEscala = useMemo(() => {
    if (typeof pergunta.config_escala === 'string') {
      try {
        const parsed = JSON.parse(pergunta.config_escala);
        console.log('🔧 Config_escala parseada de string:', parsed);
        return parsed;
      } catch (e) {
        console.error('❌ Erro ao fazer parse da config_escala:', e);
        return null;
      }
    }
    console.log('🔧 Config_escala já é objeto:', pergunta.config_escala);
    return pergunta.config_escala;
  }, [pergunta.config_escala]);

  console.log('🔧 Config_escala final:', configEscala);
  console.log('🔧 Tipo da config_escala:', typeof configEscala);
  console.log('🔧 Keys da config_escala:', configEscala ? Object.keys(configEscala) : 'null');

  // Verifica se a configuração é válida
  if (!configEscala || typeof configEscala !== 'object') {
    console.error('❌ Config_escala é null ou não é objeto:', configEscala);
    return (
      <div className="text-center p-8">
        <div className="text-red-600 mb-4">⚠️ Erro na configuração da escala</div>
        <div className="text-sm text-gray-600 mb-4">
          Esta pergunta está configurada incorretamente.
        </div>
        <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
          <strong>Debug:</strong> config_escala = {JSON.stringify(pergunta.config_escala)}
        </div>
        <div className="text-sm text-gray-600 mt-4">
          Entre em contato com o administrador.
        </div>
      </div>
    );
  }

  // Verifica campos específicos
  const { escalaMin, escalaMax, escalaPasso } = configEscala;
  console.log('🔧 Campos extraídos:', { escalaMin, escalaMax, escalaPasso });

  if (escalaMin === undefined || escalaMax === undefined || escalaPasso === undefined) {
    console.error('❌ Campos obrigatórios faltando:', { escalaMin, escalaMax, escalaPasso });
    return (
      <div className="text-center p-8">
        <div className="text-red-600 mb-4">⚠️ Configuração de escala incompleta</div>
        <div className="text-sm text-gray-600 mb-4">
          Faltam campos obrigatórios na configuração.
        </div>
        <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
          <strong>Debug:</strong><br/>
          escalaMin: {escalaMin}<br/>
          escalaMax: {escalaMax}<br/>
          escalaPasso: {escalaPasso}
        </div>
        <div className="text-sm text-gray-600 mt-4">
          Entre em contato com o administrador.
        </div>
      </div>
    );
  }

  // Verifica se os valores são números válidos
  if (typeof escalaMin !== 'number' || typeof escalaMax !== 'number' || typeof escalaPasso !== 'number') {
    console.error('❌ Campos não são números:', { escalaMin, escalaMax, escalaPasso });
    return (
      <div className="text-center p-8">
        <div className="text-red-600 mb-4">⚠️ Valores de escala inválidos</div>
        <div className="text-sm text-gray-600 mb-4">
          Os valores devem ser números.
        </div>
        <div className="text-xs text-gray-500 p-2 bg-gray-100 rounded">
          <strong>Debug:</strong><br/>
          escalaMin: {escalaMin} (tipo: {typeof escalaMin})<br/>
          escalaMax: {escalaMax} (tipo: {typeof escalaMax})<br/>
          escalaPasso: {escalaPasso} (tipo: {typeof escalaPasso})
        </div>
        <div className="text-sm text-gray-600 mt-4">
          Entre em contato com o administrador.
        </div>
      </div>
    );
  }

  // Gera opções da escala
  const opcoesEscala: number[] = [];
  for (let i = escalaMin; i <= escalaMax; i += escalaPasso) {
    opcoesEscala.push(i);
  }

  console.log('📊 Opções da escala geradas:', opcoesEscala);

  // Seleciona valor padrão (meio da escala)
  useEffect(() => {
    if (opcoesEscala.length > 0 && valorSelecionado === null) {
      const meio = Math.floor(opcoesEscala.length / 2);
      setValorSelecionado(opcoesEscala[meio]);
    }
  }, [opcoesEscala, valorSelecionado]);

  const handleConfirmar = () => {
    if (valorSelecionado !== null) {
      onResponder(valorSelecionado);
    }
  };

  const getLabelEscala = (valor: number) => {
    if (escalaMax === 10) {
      if (valor === 0) return 'Nada';
      if (valor === 5) return 'Regular';
      if (valor === 10) return 'Perfeito';
      if (valor <= 2) return 'Muito ruim';
      if (valor <= 4) return 'Ruim';
      if (valor <= 6) return 'Bom';
      if (valor <= 8) return 'Muito bom';
      return 'Excelente';
    }
    return valor.toString();
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-xl sm:text-2xl leading-tight font-medium mb-4">
          {pergunta.texto}
        </h2>
        
        {/* Escala visual */}
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {opcoesEscala.map((valor) => (
            <motion.button
              key={valor}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onMouseEnter={() => setHoveredValue(valor)}
              onMouseLeave={() => setHoveredValue(null)}
              onClick={() => setValorSelecionado(valor)}
              className={`
                px-4 py-3 rounded-xl border-2 font-medium transition-all duration-200
                ${valorSelecionado === valor 
                  ? 'border-black bg-black text-white shadow-lg' 
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }
                ${hoveredValue === valor && valorSelecionado !== valor 
                  ? 'border-gray-400 shadow-md' 
                  : ''
                }
              `}
            >
              {valor}
            </motion.button>
          ))}
        </div>

        {/* Label da escala selecionada */}
        {valorSelecionado !== null && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-lg font-medium text-gray-800 mb-6"
          >
            {getLabelEscala(valorSelecionado)}
          </motion.div>
        )}

        {/* Botão de confirmação */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleConfirmar}
          disabled={valorSelecionado === null}
          className={`
            px-8 py-4 rounded-2xl font-medium text-lg transition-all
            ${valorSelecionado !== null
              ? 'bg-black text-white hover:bg-gray-800 shadow-lg'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }
          `}
        >
          Confirmar Resposta
        </motion.button>

        {/* Dica */}
        <div className="text-sm text-gray-500 mt-4">
          Clique em um valor da escala e depois em "Confirmar Resposta"
        </div>
      </motion.div>
    </div>
  );
}
