'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

type Questionario = {
  id: string;
  nome: string;
  slug: string;
};

type FiltroRespostasProps = {
  questionarios: Questionario[];
  totalRespostas: number;
};

export default function FiltroRespostas({ questionarios, totalRespostas }: FiltroRespostasProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [questionarioFiltro, setQuestionarioFiltro] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Inicializar filtros a partir dos parâmetros da URL
  useEffect(() => {
    const questionarioId = searchParams.get('questionario');
    const search = searchParams.get('search');
    
    if (questionarioId) setQuestionarioFiltro(questionarioId);
    if (search) setSearchTerm(search);
  }, [searchParams]);

  // Aplicar filtros
  const aplicarFiltros = () => {
    const params = new URLSearchParams();
    
    if (questionarioFiltro) {
      params.set('questionario', questionarioFiltro);
    }
    
    if (searchTerm.trim()) {
      params.set('search', searchTerm.trim());
    }
    
    const queryString = params.toString();
    const url = queryString ? `/admin/respostas?${queryString}` : '/admin/respostas';
    
    router.push(url);
  };

  // Limpar filtros
  const limparFiltros = () => {
    setQuestionarioFiltro('');
    setSearchTerm('');
    router.push('/admin/respostas');
  };

  // Contar respostas filtradas
  const respostasFiltradas = questionarios.length > 0 ? totalRespostas : 0;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-end">
        {/* Filtro por Questionário */}
        <div className="flex-1">
          <label htmlFor="questionario-filtro" className="block text-sm font-medium text-gray-700 mb-2">
            Filtrar por Questionário
          </label>
          <select
            id="questionario-filtro"
            value={questionarioFiltro}
            onChange={(e) => setQuestionarioFiltro(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos os questionários</option>
            {questionarios.map((q) => (
              <option key={q.id} value={q.id}>
                {q.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Busca por texto */}
        <div className="flex-1">
          <label htmlFor="search-term" className="block text-sm font-medium text-gray-700 mb-2">
            Buscar por texto
          </label>
          <input
            type="text"
            id="search-term"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Nome, email, CNPJ..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Botões de ação */}
        <div className="flex gap-2">
          <button
            onClick={aplicarFiltros}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            🔍 Aplicar Filtros
          </button>
          
          <button
            onClick={limparFiltros}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            🗑️ Limpar
          </button>
        </div>
      </div>

      {/* Estatísticas dos filtros */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="font-medium">Total de Respostas:</span>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-medium">
              {respostasFiltradas}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="font-medium">Questionários:</span>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium">
              {questionarios.length}
            </span>
          </div>

          {(questionarioFiltro || searchTerm.trim()) && (
            <div className="flex items-center gap-2">
              <span className="font-medium">Filtros Ativos:</span>
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-medium">
                {[
                  questionarioFiltro && 'Questionário',
                  searchTerm.trim() && 'Busca'
                ].filter(Boolean).join(' + ')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
