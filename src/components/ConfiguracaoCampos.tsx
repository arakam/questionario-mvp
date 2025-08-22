'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type CampoConfiguravel = {
  id: string;
  label: string;
  tipo: 'texto' | 'email' | 'numero' | 'telefone' | 'cnpj' | 'select';
  obrigatorio: boolean;
  ordem: number;
  placeholder: string;
  opcoes?: string[];
  validacao?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
};

type Props = {
  campos: CampoConfiguravel[];
  onChange: (campos: CampoConfiguravel[]) => void;
};

const fadeUp = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const tiposDisponiveis = [
  { id: 'texto', label: 'Texto', icon: '📝' },
  { id: 'email', label: 'E-mail', icon: '📧' },
  { id: 'numero', label: 'Número', icon: '🔢' },
  { id: 'telefone', label: 'Telefone', icon: '📱' },
  { id: 'cnpj', label: 'CNPJ', icon: '🏢' },
  { id: 'select', label: 'Seleção', icon: '📋' },
];

export default function ConfiguracaoCampos({ campos, onChange }: Props) {
  const [camposLocais, setCamposLocais] = useState<CampoConfiguravel[]>(campos);

  useEffect(() => {
    setCamposLocais(campos);
  }, [campos]);

  const adicionarCampo = () => {
    const novoCampo: CampoConfiguravel = {
      id: `campo_${Date.now()}`,
      label: 'Novo Campo',
      tipo: 'texto',
      obrigatorio: false,
      ordem: camposLocais.length + 1,
      placeholder: 'Digite aqui...',
    };
    
    const novosCampos = [...camposLocais, novoCampo];
    setCamposLocais(novosCampos);
    onChange(novosCampos);
  };

  const removerCampo = (index: number) => {
    const novosCampos = camposLocais.filter((_, i) => i !== index);
    // Reordena os campos
    const camposReordenados = novosCampos.map((campo, i) => ({
      ...campo,
      ordem: i + 1,
    }));
    setCamposLocais(camposReordenados);
    onChange(camposReordenados);
  };

  const atualizarCampo = (index: number, campo: Partial<CampoConfiguravel>) => {
    const novosCampos = [...camposLocais];
    novosCampos[index] = { ...novosCampos[index], ...campo };
    setCamposLocais(novosCampos);
    onChange(novosCampos);
  };

  const moverCampo = (index: number, direcao: 'up' | 'down') => {
    if (
      (direcao === 'up' && index === 0) ||
      (direcao === 'down' && index === camposLocais.length - 1)
    ) {
      return;
    }

    const novosCampos = [...camposLocais];
    const novoIndex = direcao === 'up' ? index - 1 : index + 1;
    
    [novosCampos[index], novosCampos[novoIndex]] = [novosCampos[novoIndex], novosCampos[index]];
    
    // Reordena os campos
    const camposReordenados = novosCampos.map((campo, i) => ({
      ...campo,
      ordem: i + 1,
    }));
    
    setCamposLocais(camposReordenados);
    onChange(camposReordenados);
  };

  const adicionarOpcao = (index: number) => {
    const campo = camposLocais[index];
    if (campo.tipo !== 'select') return;
    
    const novasOpcoes = [...(campo.opcoes || []), `Opção ${(campo.opcoes?.length || 0) + 1}`];
    atualizarCampo(index, { opcoes: novasOpcoes });
  };

  const removerOpcao = (index: number, opcaoIndex: number) => {
    const campo = camposLocais[index];
    if (campo.tipo !== 'select') return;
    
    const novasOpcoes = campo.opcoes?.filter((_, i) => i !== opcaoIndex) || [];
    atualizarCampo(index, { opcoes: novasOpcoes });
  };

  const atualizarOpcao = (index: number, opcaoIndex: number, valor: string) => {
    const campo = camposLocais[index];
    if (campo.tipo !== 'select') return;
    
    const novasOpcoes = [...(campo.opcoes || [])];
    novasOpcoes[opcaoIndex] = valor;
    atualizarCampo(index, { opcoes: novasOpcoes });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Campos de Dados Pessoais</h3>
        <button
          type="button"
          onClick={adicionarCampo}
          className="btn-primary text-sm"
        >
          ➕ Adicionar Campo
        </button>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {camposLocais.map((campo, index) => (
            <motion.div
              key={campo.id}
              {...fadeUp}
              className="border rounded-lg p-4 bg-white"
            >
              <div className="grid gap-4">
                {/* Cabeçalho do campo */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500">#{campo.ordem}</span>
                    <h4 className="font-medium">Campo {index + 1}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => moverCampo(index, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      title="Mover para cima"
                    >
                      ⬆️
                    </button>
                    <button
                      type="button"
                      onClick={() => moverCampo(index, 'down')}
                      disabled={index === camposLocais.length - 1}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
                      title="Mover para baixo"
                    >
                      ⬇️
                    </button>
                    <button
                      type="button"
                      onClick={() => removerCampo(index)}
                      className="p-1 text-red-400 hover:text-red-600"
                      title="Remover campo"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                {/* Configurações do campo */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID do Campo
                    </label>
                    <input
                      type="text"
                      value={campo.id}
                      onChange={(e) => atualizarCampo(index, { id: e.target.value })}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      placeholder="nome_campo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Label
                    </label>
                    <input
                      type="text"
                      value={campo.label}
                      onChange={(e) => atualizarCampo(index, { label: e.target.value })}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      placeholder="Nome do campo"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo
                    </label>
                    <select
                      value={campo.tipo}
                      onChange={(e) => atualizarCampo(index, { tipo: e.target.value as CampoConfiguravel['tipo'] })}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                    >
                      {tiposDisponiveis.map((tipo) => (
                        <option key={tipo.id} value={tipo.id}>
                          {tipo.icon} {tipo.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Placeholder
                    </label>
                    <input
                      type="text"
                      value={campo.placeholder}
                      onChange={(e) => atualizarCampo(index, { placeholder: e.target.value })}
                      className="w-full border rounded-md px-3 py-2 text-sm"
                      placeholder="Texto de exemplo"
                    />
                  </div>
                </div>

                {/* Opções para campos de seleção */}
                {campo.tipo === 'select' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Opções de Seleção
                      </label>
                      <button
                        type="button"
                        onClick={() => adicionarOpcao(index)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        ➕ Adicionar Opção
                      </button>
                    </div>
                    <div className="space-y-2">
                      {campo.opcoes?.map((opcao, opcaoIndex) => (
                        <div key={opcaoIndex} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={opcao}
                            onChange={(e) => atualizarOpcao(index, opcaoIndex, e.target.value)}
                            className="flex-1 border rounded-md px-3 py-2 text-sm"
                            placeholder="Texto da opção"
                          />
                          <button
                            type="button"
                            onClick={() => removerOpcao(index, opcaoIndex)}
                            className="p-1 text-red-400 hover:text-red-600"
                            title="Remover opção"
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                      {(!campo.opcoes || campo.opcoes.length === 0) && (
                        <p className="text-sm text-gray-500 italic">
                          Nenhuma opção configurada. Adicione pelo menos uma opção.
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Validações */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Validações
                  </label>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`obrigatorio_${index}`}
                        checked={campo.obrigatorio}
                        onChange={(e) => atualizarCampo(index, { obrigatorio: e.target.checked })}
                        className="rounded"
                      />
                      <label htmlFor={`obrigatorio_${index}`} className="text-sm text-gray-700">
                        Campo obrigatório
                      </label>
                    </div>

                    {campo.tipo === 'numero' && (
                      <>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Valor mínimo</label>
                          <input
                            type="number"
                            value={campo.validacao?.min || ''}
                            onChange={(e) => atualizarCampo(index, {
                              validacao: { ...campo.validacao, min: e.target.value ? Number(e.target.value) : undefined }
                            })}
                            className="w-full border rounded-md px-2 py-1 text-sm"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Valor máximo</label>
                          <input
                            type="number"
                            value={campo.validacao?.max || ''}
                            onChange={(e) => atualizarCampo(index, {
                              validacao: { ...campo.validacao, max: e.target.value ? Number(e.target.value) : undefined }
                            })}
                            className="w-full border rounded-md px-2 py-1 text-sm"
                            placeholder="100"
                          />
                        </div>
                      </>
                    )}

                    {campo.tipo === 'texto' && (
                      <>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Tamanho mínimo</label>
                          <input
                            type="number"
                            value={campo.validacao?.minLength || ''}
                            onChange={(e) => atualizarCampo(index, {
                              validacao: { ...campo.validacao, minLength: e.target.value ? Number(e.target.value) : undefined }
                            })}
                            className="w-full border rounded-md px-2 py-1 text-sm"
                            placeholder="3"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Tamanho máximo</label>
                          <input
                            type="number"
                            value={campo.validacao?.maxLength || ''}
                            onChange={(e) => atualizarCampo(index, {
                              validacao: { ...campo.validacao, maxLength: e.target.value ? Number(e.target.value) : undefined }
                            })}
                            className="w-full border rounded-md px-2 py-1 text-sm"
                            placeholder="50"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {camposLocais.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Nenhum campo configurado.</p>
          <p className="text-sm">Clique em "Adicionar Campo" para começar.</p>
        </div>
      )}
    </div>
  );
}
