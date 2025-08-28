'use client';

import { useState } from 'react';
import ConfiguracaoCampos, { type CampoConfiguravel } from '@/components/ConfiguracaoCampos';

// Força o uso do Node.js runtime para evitar problemas com Edge Runtime
export const runtime = 'nodejs';

const camposPadrao: CampoConfiguravel[] = [
  {
    id: 'nome',
    label: 'Nome',
    tipo: 'texto',
    obrigatorio: true,
    ordem: 1,
    placeholder: 'Digite seu nome completo',
    campoVerificacao: false
  },
  {
    id: 'email',
    label: 'E-mail',
    tipo: 'email',
    obrigatorio: true,
    ordem: 2,
    placeholder: 'seu@email.com',
    campoVerificacao: true // Por padrão, email é o campo de verificação
  },
  {
    id: 'telefone',
    label: 'Telefone',
    tipo: 'telefone',
    obrigatorio: false,
    ordem: 3,
    placeholder: '(11) 99999-9999',
    campoVerificacao: false
  },
  {
    id: 'cnpj',
    label: 'CNPJ',
    tipo: 'texto',
    obrigatorio: false,
    ordem: 4,
    placeholder: '00.000.000/0000-00',
    campoVerificacao: false
  },
  {
    id: 'empresa',
    label: 'Empresa',
    tipo: 'texto',
    obrigatorio: false,
    ordem: 5,
    placeholder: 'Nome da empresa',
    campoVerificacao: false
  },
  {
    id: 'qtd_funcionarios',
    label: 'Quantidade de funcionários',
    tipo: 'numero',
    obrigatorio: false,
    ordem: 6,
    placeholder: '0',
    campoVerificacao: false
  },
  {
    id: 'ramo_atividade',
    label: 'Ramo de atividade',
    tipo: 'texto',
    obrigatorio: false,
    ordem: 7,
    placeholder: 'Ex: Tecnologia, Saúde, Educação',
    campoVerificacao: false
  }
];

export default function NovoQuestionario() {
  const [campos, setCampos] = useState<CampoConfiguravel[]>(camposPadrao);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    formData.append('campos_configuraveis', JSON.stringify(campos));

    try {
      const response = await fetch('/api/admin/questionarios', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        window.location.href = '/admin/questionarios';
      } else {
        const error = await response.json();
        alert(`Erro: ${error.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      alert('Erro ao criar questionário');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ➕ Novo Questionário
        </h1>
        <p className="text-gray-600">
          Crie um novo questionário e configure os campos de dados pessoais
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Informações básicas do questionário */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Informações do Questionário</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome do Questionário <span className="text-red-500">*</span>
              </label>
              <input
                name="nome"
                required
                placeholder="Ex: Pesquisa de Satisfação"
                className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-black/60 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                name="slug"
                required
                placeholder="pesquisa-satisfacao"
                className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-black/60 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                URL amigável para o questionário
              </p>
            </div>
          </div>
        </div>

        {/* Configuração dos campos */}
        <div className="card">
          <ConfiguracaoCampos campos={campos} onChange={setCampos} />
        </div>

        {/* Botões de ação */}
        <div className="flex items-center justify-between pt-4">
          <a
            href="/admin/questionarios"
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Voltar para Questionários
          </a>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary px-8 py-3 text-lg disabled:opacity-60"
          >
            {isSubmitting ? 'Criando...' : '🚀 Criar Questionário'}
          </button>
        </div>
      </form>
    </div>
  );
}
