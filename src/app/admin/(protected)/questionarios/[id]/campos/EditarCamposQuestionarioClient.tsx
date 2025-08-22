'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ConfiguracaoCampos, { type CampoConfiguravel } from '@/components/ConfiguracaoCampos';

const camposPadrao: CampoConfiguravel[] = [
  {
    id: 'nome',
    label: 'Nome',
    tipo: 'texto',
    obrigatorio: true,
    ordem: 1,
    placeholder: 'Digite seu nome completo'
  },
  {
    id: 'email',
    label: 'E-mail',
    tipo: 'email',
    obrigatorio: true,
    ordem: 2,
    placeholder: 'seu@email.com'
  },
  {
    id: 'telefone',
    label: 'Telefone',
    tipo: 'texto',
    obrigatorio: true,
    ordem: 3,
    placeholder: '(11) 99999-9999'
  },
  {
    id: 'cnpj',
    label: 'CNPJ',
    tipo: 'texto',
    obrigatorio: true,
    ordem: 4,
    placeholder: '00.000.000/0000-00'
  },
  {
    id: 'empresa',
    label: 'Empresa',
    tipo: 'texto',
    obrigatorio: false,
    ordem: 5,
    placeholder: 'Nome da empresa'
  },
  {
    id: 'qtd_funcionarios',
    label: 'Quantidade de funcionários',
    tipo: 'numero',
    obrigatorio: false,
    ordem: 6,
    placeholder: '0'
  },
  {
    id: 'ramo_atividade',
    label: 'Ramo de atividade',
    tipo: 'texto',
    obrigatorio: false,
    ordem: 7,
    placeholder: 'Ex: Tecnologia, Saúde, Educação'
  }
];

type Props = {
  questionarioId: string;
  questionarioNome: string;
  camposIniciais?: CampoConfiguravel[];
};

export default function EditarCamposQuestionarioClient({ 
  questionarioId, 
  questionarioNome, 
  camposIniciais 
}: Props) {
  const router = useRouter();
  const [campos, setCampos] = useState<CampoConfiguravel[]>(
    camposIniciais || camposPadrao
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    formData.append('campos_configuraveis', JSON.stringify(campos));

    try {
      const response = await fetch(`/api/admin/questionarios/${questionarioId}/campos`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('Campos configuráveis atualizados com sucesso!');
        router.push(`/admin/questionarios/${questionarioId}`);
      } else {
        const error = await response.json();
        alert(`Erro: ${error.error || 'Erro desconhecido'}`);
      }
    } catch (error) {
      alert('Erro ao atualizar campos configuráveis');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          ⚙️ Configurar Campos do Questionário
        </h1>
        <p className="text-gray-600">
          Configure os campos de dados pessoais para: <strong>{questionarioNome}</strong>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Configuração dos campos */}
        <div className="card">
          <ConfiguracaoCampos campos={campos} onChange={setCampos} />
        </div>

        {/* Botões de ação */}
        <div className="flex items-center justify-between pt-4">
          <a
            href={`/admin/questionarios/${questionarioId}`}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Voltar para Questionário
          </a>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary px-8 py-3 text-lg disabled:opacity-60"
          >
            {isSubmitting ? 'Salvando...' : '💾 Salvar Campos'}
          </button>
        </div>
      </form>
    </div>
  );
}
