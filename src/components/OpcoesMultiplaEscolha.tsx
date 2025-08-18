'use client';

import { useState } from 'react';

interface Opcao {
  id: string;
  texto: string;
  valor: string;
}

interface OpcoesMultiplaEscolhaProps {
  opcoes: Opcao[];
  onChange: (opcoes: Opcao[]) => void;
  disabled?: boolean;
}

export default function OpcoesMultiplaEscolha({ opcoes, onChange, disabled = false }: OpcoesMultiplaEscolhaProps) {
  const [opcoesLocal, setOpcoesLocal] = useState<Opcao[]>(opcoes);

  const addOpcao = () => {
    const novaOpcao: Opcao = {
      id: `opcao_${Date.now()}`,
      texto: '',
      valor: ''
    };
    const novasOpcoes = [...opcoesLocal, novaOpcao];
    setOpcoesLocal(novasOpcoes);
    onChange(novasOpcoes);
  };

  const removeOpcao = (id: string) => {
    const novasOpcoes = opcoesLocal.filter(opcao => opcao.id !== id);
    setOpcoesLocal(novasOpcoes);
    onChange(novasOpcoes);
  };

  const updateOpcao = (id: string, campo: 'texto' | 'valor', valor: string) => {
    const novasOpcoes = opcoesLocal.map(opcao => 
      opcao.id === id ? { ...opcao, [campo]: valor } : opcao
    );
    setOpcoesLocal(novasOpcoes);
    onChange(novasOpcoes);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Opções de Resposta
        </label>
        <button
          type="button"
          onClick={addOpcao}
          disabled={disabled}
          className="btn-secondary text-sm py-1 px-3"
        >
          ➕ Adicionar Opção
        </button>
      </div>

      <div className="space-y-3">
        {opcoesLocal.map((opcao, index) => (
          <div key={opcao.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
            <div className="text-sm font-medium text-gray-500 w-8">
              {index + 1}
            </div>
            
            <div className="flex-1 grid grid-cols-2 gap-3">
              <input
                type="text"
                value={opcao.texto}
                onChange={(e) => updateOpcao(opcao.id, 'texto', e.target.value)}
                placeholder="Texto da opção"
                disabled={disabled}
                className="input-field text-sm"
              />
              <input
                type="text"
                value={opcao.valor}
                onChange={(e) => updateOpcao(opcao.id, 'valor', e.target.value)}
                placeholder="Valor (opcional)"
                disabled={disabled}
                className="input-field text-sm"
              />
            </div>
            
            <button
              type="button"
              onClick={() => removeOpcao(opcao.id)}
              disabled={disabled || opcoesLocal.length <= 2}
              className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Remover opção"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>

      {opcoesLocal.length === 0 && (
        <div className="text-center py-4 text-gray-500">
          Nenhuma opção definida. Clique em "Adicionar Opção" para começar.
        </div>
      )}

      <div className="text-sm text-gray-600">
        <strong>Dica:</strong> Para perguntas de múltipla escolha, defina pelo menos 2 opções.
        O campo "Valor" é opcional e pode ser usado para cálculos ou análises.
      </div>
    </div>
  );
}
