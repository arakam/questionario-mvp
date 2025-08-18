'use client';

import { useEffect } from 'react';

interface ConfiguracaoEscalaProps {
  escalaMin: number;
  escalaMax: number;
  escalaPasso: number;
  onChange: (config: { escalaMin: number; escalaMax: number; escalaPasso: number }) => void;
  disabled?: boolean;
}

export default function ConfiguracaoEscala({ 
  escalaMin, 
  escalaMax, 
  escalaPasso, 
  onChange, 
  disabled = false 
}: ConfiguracaoEscalaProps) {
  
  // Log quando o componente recebe novos valores
  useEffect(() => {
    console.log('🎯 ConfiguracaoEscala recebeu novos valores:', {
      escalaMin,
      escalaMax,
      escalaPasso
    });
  }, [escalaMin, escalaMax, escalaPasso]);
  
  const handleChange = (campo: 'escalaMin' | 'escalaMax' | 'escalaPasso', valor: string) => {
    const numValor = parseInt(valor) || 0;
    const novaConfig = {
      escalaMin: campo === 'escalaMin' ? numValor : escalaMin,
      escalaMax: campo === 'escalaMax' ? numValor : escalaMax,
      escalaPasso: campo === 'escalaPasso' ? numValor : escalaPasso
    };
    
    console.log('🔧 Configuração de escala alterada:', {
      campo,
      valor: numValor,
      configAnterior: { escalaMin, escalaMax, escalaPasso },
      novaConfig
    });
    
    onChange(novaConfig);
  };

  const gerarExemploEscala = () => {
    const opcoes = [];
    for (let i = escalaMin; i <= escalaMax; i += escalaPasso) {
      opcoes.push(i);
    }
    return opcoes;
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        Configuração da Escala
      </label>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Valor Mínimo
          </label>
          <input
            type="number"
            value={escalaMin}
            onChange={(e) => handleChange('escalaMin', e.target.value)}
            min={0}
            max={escalaMax - 1}
            disabled={disabled}
            className="input-field text-sm"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Valor Máximo
          </label>
          <input
            type="number"
            value={escalaMax}
            onChange={(e) => handleChange('escalaMax', e.target.value)}
            min={escalaMin + 1}
            max={100}
            disabled={disabled}
            className="input-field text-sm"
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Passo
          </label>
          <input
            type="number"
            value={escalaPasso}
            onChange={(e) => handleChange('escalaPasso', e.target.value)}
            min={1}
            max={escalaMax - escalaMin}
            disabled={disabled}
            className="input-field text-sm"
          />
        </div>
      </div>

      {/* Preview da escala */}
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="text-sm font-medium text-gray-700 mb-2">
          Preview da Escala:
        </div>
        <div className="flex flex-wrap gap-2">
          {gerarExemploEscala().map((valor) => (
            <span
              key={valor}
              className="px-2 py-1 bg-white border border-gray-300 rounded text-sm font-medium text-gray-700"
            >
              {valor}
            </span>
          ))}
        </div>
        <div className="text-xs text-gray-600 mt-2">
          Total de opções: {gerarExemploEscala().length}
        </div>
      </div>

      {/* Validações */}
      {escalaMin >= escalaMax && (
        <div className="text-sm text-red-600 p-2 bg-red-50 border border-red-200 rounded">
          ⚠️ O valor mínimo deve ser menor que o máximo
        </div>
      )}
      
      {escalaPasso > (escalaMax - escalaMin) && (
        <div className="text-sm text-red-600 p-2 bg-red-50 border border-red-200 rounded">
          ⚠️ O passo deve ser menor que a diferença entre máximo e mínimo
        </div>
      )}

      <div className="text-sm text-gray-600">
        <strong>Dica:</strong> Configure uma escala que faça sentido para sua pergunta.
        Exemplo: 1-5 (muito ruim a excelente), 0-10 (nada a perfeito).
      </div>
    </div>
  );
}
