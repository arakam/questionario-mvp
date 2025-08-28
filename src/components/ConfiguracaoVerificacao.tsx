'use client';

import { useState, useEffect } from 'react';

export type ConfiguracaoVerificacao = {
  campoVerificacao: 'email' | 'telefone';
  mensagemPersonalizada?: string;
};

interface ConfiguracaoVerificacaoProps {
  config: ConfiguracaoVerificacao;
  onChange: (config: ConfiguracaoVerificacao) => void;
  disabled?: boolean;
}

export default function ConfiguracaoVerificacao({ 
  config, 
  onChange, 
  disabled = false 
}: ConfiguracaoVerificacaoProps) {
  
  const [configLocal, setConfigLocal] = useState<ConfiguracaoVerificacao>(config);

  useEffect(() => {
    setConfigLocal(config);
  }, [config]);

  const handleChange = (campo: keyof ConfiguracaoVerificacao, valor: any) => {
    const novaConfig = { ...configLocal, [campo]: valor };
    setConfigLocal(novaConfig);
    onChange(novaConfig);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">
        🔍 Configuração de Verificação de Duplicatas
      </label>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Campo para verificação de respostas duplicadas:
          </label>
          <div className="space-y-3">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="campoVerificacao"
                value="email"
                checked={configLocal.campoVerificacao === 'email'}
                onChange={(e) => handleChange('campoVerificacao', e.target.value)}
                disabled={disabled}
                className="w-4 h-4 text-primary-blue border-gray-300 focus:ring-primary-blue"
              />
              <div className="flex items-center space-x-2">
                <span className="text-lg">📧</span>
                <div>
                  <div className="font-medium text-gray-900">E-mail</div>
                  <div className="text-sm text-gray-600">
                    Verifica duplicatas por endereço de e-mail
                  </div>
                </div>
              </div>
            </label>
            
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="radio"
                name="campoVerificacao"
                value="telefone"
                checked={configLocal.campoVerificacao === 'telefone'}
                onChange={(e) => handleChange('campoVerificacao', e.target.value)}
                disabled={disabled}
                className="w-4 h-4 text-primary-blue border-gray-300 focus:ring-primary-blue"
              />
              <div className="flex items-center space-x-2">
                <span className="text-lg">📱</span>
                <div>
                  <div className="font-medium text-gray-900">Telefone</div>
                  <div className="text-sm text-gray-600">
                    Verifica duplicatas por número de telefone
                  </div>
                </div>
              </div>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">
            Mensagem personalizada (opcional):
          </label>
          <textarea
            value={configLocal.mensagemPersonalizada || ''}
            onChange={(e) => handleChange('mensagemPersonalizada', e.target.value)}
            placeholder="Ex: Você já respondeu este questionário. Deseja continuar de onde parou?"
            disabled={disabled}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-blue focus:border-primary-blue disabled:bg-gray-50 disabled:text-gray-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Deixe em branco para usar a mensagem padrão do sistema
          </p>
        </div>
      </div>

      {/* Informações importantes */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-2">
          <span className="text-blue-600 text-lg">ℹ️</span>
          <div className="text-sm text-blue-800">
            <div className="font-medium mb-1">Como funciona a verificação:</div>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <strong>E-mail:</strong> Sistema verifica se já existe uma resposta com o mesmo e-mail para este questionário
              </li>
              <li>
                <strong>Telefone:</strong> Sistema verifica se já existe uma resposta com o mesmo telefone para este questionário
              </li>
              <li>
                <strong>Importante:</strong> A verificação é feita por questionário, permitindo que a mesma pessoa responda questionários diferentes
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Campo selecionado atual */}
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="text-sm font-medium text-gray-700 mb-2">
          Configuração Atual:
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-lg">
            {configLocal.campoVerificacao === 'email' ? '📧' : '📱'}
          </span>
          <span className="text-gray-900">
            Verificação por <strong>{configLocal.campoVerificacao === 'email' ? 'E-mail' : 'Telefone'}</strong>
          </span>
        </div>
        {configLocal.mensagemPersonalizada && (
          <div className="mt-2 text-sm text-gray-600">
            <strong>Mensagem:</strong> {configLocal.mensagemPersonalizada}
          </div>
        )}
      </div>
    </div>
  );
}
