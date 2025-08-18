'use client';

import { useState } from 'react';

export type PerguntaTipo = 
  | 'sim_nao'
  | 'multipla_escolha_unica'
  | 'multipla_escolha_multipla'
  | 'escala'
  | 'texto_curto'
  | 'texto_longo';

interface PerguntaTypeSelectorProps {
  value?: PerguntaTipo;
  onChange: (tipo: PerguntaTipo) => void;
  disabled?: boolean;
}

const TIPO_CONFIG = {
  sim_nao: {
    label: 'Sim/Não',
    icon: '✅',
    description: 'Resposta simples de Sim ou Não'
  },
  multipla_escolha_unica: {
    label: 'Múltipla Escolha (Única)',
    icon: '🔘',
    description: 'Uma opção entre várias alternativas'
  },
  multipla_escolha_multipla: {
    label: 'Múltipla Escolha (Múltipla)',
    icon: '☑️',
    description: 'Várias opções podem ser selecionadas'
  },
  escala: {
    label: 'Escala/Nota',
    icon: '📊',
    description: 'Avaliação em escala numérica'
  },
  texto_curto: {
    label: 'Texto Curto',
    icon: '💬',
    description: 'Resposta em texto limitado'
  },
  texto_longo: {
    label: 'Texto Longo',
    icon: '📝',
    description: 'Resposta em texto livre'
  }
};

export default function PerguntaTypeSelector({ value, onChange, disabled = false }: PerguntaTypeSelectorProps) {
  const [selectedTipo, setSelectedTipo] = useState<PerguntaTipo>(value || 'sim_nao');

  const handleTipoChange = (tipo: PerguntaTipo) => {
    setSelectedTipo(tipo);
    onChange(tipo);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Tipo de Pergunta
      </label>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {Object.entries(TIPO_CONFIG).map(([tipo, config]) => (
          <div
            key={tipo}
            className={`
              relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
              ${selectedTipo === tipo 
                ? 'border-primary-blue bg-blue-50 ring-2 ring-blue-200' 
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
            `}
            onClick={() => !disabled && handleTipoChange(tipo as PerguntaTipo)}
          >
            <div className="flex items-start space-x-3">
              <div className="text-2xl">{config.icon}</div>
              <div className="flex-1">
                <div className="font-medium text-gray-900">
                  {config.label}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {config.description}
                </div>
              </div>
              {selectedTipo === tipo && (
                <div className="text-primary-blue">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {selectedTipo && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm text-blue-800">
            <strong>Tipo selecionado:</strong> {TIPO_CONFIG[selectedTipo].label}
          </div>
        </div>
      )}
    </div>
  );
}
