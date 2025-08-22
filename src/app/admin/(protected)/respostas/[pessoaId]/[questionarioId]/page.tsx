import Link from 'next/link';
import { supabaseAdminOnly } from '@/lib/supabaseAdminOnly';
import { getSessionAndAdmin } from '@/lib/isAdmin';

// Força o uso do Node.js runtime para evitar problemas com Edge Runtime
export const runtime = 'nodejs';

export const dynamic = 'force-dynamic';

/** Tipos das entidades */
type Pessoa = {
  id: string;
  nome: string;
  email: string;
  cnpj: string;
  empresa: string | null;
};

type Questionario = {
  id: string;
  nome: string;
  slug: string;
};

type Categoria = {
  id: string;
  nome: string;
  descricao: string | null;
};

type Pergunta = {
  id: string;
  texto: string;
  peso: number;
  tipo: string;
  categoria_id: string | null;
  opcoes: any;
  config_escala: any;
};

type QPRow = {
  pergunta_id: string;
  perguntas: Pergunta; // join !inner
};

type RespostaRow = {
  pergunta_id: string;
  resposta: boolean | null;
  resposta_texto: string | null;
  resposta_escala: number | null;
  resposta_multipla: string[] | null;
  tipo_pergunta: string;
  respondido_em: string | null;
};

type ResumoCategoria = {
  categoriaId: string;
  categoriaNome: string;
  pesoTotal: number;
  pesoSim: number;
  pesoNao: number;
  percentualAproveitamento: number;
  totalPerguntas: number;
  perguntasRespondidas: number;
};

export default async function RespostasDetalhePage({
  params,
}: {
  params: Promise<{ pessoaId: string; questionarioId: string }>;
}) {
  const { isAdmin } = await getSessionAndAdmin();
  if (!isAdmin) return <div className="p-6 text-red-600">Acesso negado.</div>;

  const { pessoaId, questionarioId } = await params;
  const admin = supabaseAdminOnly();

  // pessoa + questionário + categorias
  const [{ data: pessoa, error: e1 }, { data: q, error: e2 }, { data: categorias, error: e3 }] = await Promise.all([
    admin.from('pessoas').select('id, nome, email, cnpj, empresa').eq('id', pessoaId).single<Pessoa>(),
    admin.from('questionarios').select('id, nome, slug').eq('id', questionarioId).single<Questionario>(),
    admin.from('categorias').select('id, nome, descricao').order('nome', { ascending: true }).returns<Categoria[]>(),
  ]);

  if (e1) return <div className="p-6 text-red-600">Erro: {e1.message}</div>;
  if (e2) return <div className="p-6 text-red-600">Erro: {e2.message}</div>;
  if (e3) return <div className="p-6 text-red-600">Erro: {e3.message}</div>;
  if (!pessoa || !q) return <div className="p-6">Dados não encontrados.</div>;

  // perguntas do questionário + respostas da pessoa
  const [{ data: qps, error: e4 }, { data: resp, error: e5 }] = await Promise.all([
    admin
      .from('questionario_perguntas')
      .select('pergunta_id, perguntas!inner(id, texto, peso, tipo, categoria_id, opcoes, config_escala)')
      .eq('questionario_id', questionarioId)
      .returns<QPRow[]>(), // tipa o array
    admin
      .from('respostas')
      .select('pergunta_id, resposta, resposta_texto, resposta_escala, resposta_multipla, tipo_pergunta, respondido_em')
      .eq('pessoa_id', pessoaId)
      .eq('questionario_id', questionarioId)
      .returns<RespostaRow[]>(),
  ]);

  if (e4) return <div className="p-6 text-red-600">Erro: {e4.message}</div>;
  if (e5) return <div className="p-6 text-red-600">Erro: {e5.message}</div>;

  const perguntas: Pergunta[] = (qps ?? []).map((x) => x.perguntas);

  const mapResp = new Map<string, { 
    resposta: boolean | null; 
    resposta_texto: string | null;
    resposta_escala: number | null;
    resposta_multipla: string[] | null;
    tipo_pergunta: string;
    respondido_em: string | null 
  }>();
  
  for (const r of (resp ?? [])) {
    mapResp.set(r.pergunta_id, { 
      resposta: r.resposta, 
      resposta_texto: r.resposta_texto,
      resposta_escala: r.resposta_escala,
      resposta_multipla: r.resposta_multipla,
      tipo_pergunta: r.tipo_pergunta,
      respondido_em: r.respondido_em 
    });
  }

  const itens = perguntas.map((p) => {
    const r = mapResp.get(p.id);
    return {
      pergunta_id: p.id,
      texto: p.texto,
      peso: p.peso,
      tipo: p.tipo,
      categoria_id: p.categoria_id,
      opcoes: p.opcoes,
      config_escala: p.config_escala,
      resposta: r?.resposta ?? null,
      resposta_texto: r?.resposta_texto ?? null,
      resposta_escala: r?.resposta_escala ?? null,
      resposta_multipla: r?.resposta_multipla ?? null,
      tipo_pergunta: r?.tipo_pergunta ?? p.tipo,
      respondido_em: r?.respondido_em ?? null,
    };
  });

  const respondidas = itens.filter((i) => i.resposta !== null || i.resposta_texto !== null || i.resposta_escala !== null || i.resposta_multipla !== null).length;
  const total = itens.length;
  const pct = total ? Math.round((respondidas / total) * 100) : 0;

  // Cálculos gerais de pesos
  const pesoTotalPossivel = itens.reduce((sum, item) => sum + item.peso, 0);
  
  // Peso das respostas SIM (apenas para perguntas sim/não)
  const pesoRespostasSim = itens.reduce((sum, item) => {
    if (item.tipo === 'sim_nao' && item.resposta === true) {
      return sum + item.peso;
    }
    return sum;
  }, 0);

  // Peso das respostas NÃO (apenas para perguntas sim/não)
  const pesoRespostasNao = itens.reduce((sum, item) => {
    if (item.tipo === 'sim_nao' && item.resposta === false) {
      return sum + item.peso;
    }
    return sum;
  }, 0);

  // Percentual de aproveitamento geral
  const percentualAproveitamento = pesoTotalPossivel > 0 ? Math.round((pesoRespostasSim / pesoTotalPossivel) * 100) : 0;

  // Cálculos por categoria
  const resumoPorCategoria: ResumoCategoria[] = [];
  
  // Criar mapa de categorias para fácil acesso
  const categoriasMap = new Map<string, Categoria>();
  categorias.forEach(cat => categoriasMap.set(cat.id, cat));
  
  // Agrupar perguntas por categoria
  const perguntasPorCategoria = new Map<string, typeof itens>();
  
  for (const item of itens) {
    const categoriaId = item.categoria_id || 'sem_categoria';
    if (!perguntasPorCategoria.has(categoriaId)) {
      perguntasPorCategoria.set(categoriaId, []);
    }
    perguntasPorCategoria.get(categoriaId)!.push(item);
  }
  
  // Calcular resumo para cada categoria
  for (const [categoriaId, perguntasCategoria] of perguntasPorCategoria) {
    const pesoTotalCategoria = perguntasCategoria.reduce((sum, item) => sum + item.peso, 0);
    
    const pesoSimCategoria = perguntasCategoria.reduce((sum, item) => {
      if (item.tipo === 'sim_nao' && item.resposta === true) {
        return sum + item.peso;
      }
      return sum;
    }, 0);
    
    const pesoNaoCategoria = perguntasCategoria.reduce((sum, item) => {
      if (item.tipo === 'sim_nao' && item.resposta === false) {
        return sum + item.peso;
      }
      return sum;
    }, 0);
    
    const percentualCategoria = pesoTotalCategoria > 0 ? Math.round((pesoSimCategoria / pesoTotalCategoria) * 100) : 0;
    
    const perguntasRespondidasCategoria = perguntasCategoria.filter(item => 
      item.resposta !== null || item.resposta_texto !== null || item.resposta_escala !== null || item.resposta_multipla !== null
    ).length;
    
    const categoriaNome = categoriaId === 'sem_categoria' 
      ? 'Sem Categoria' 
      : categoriasMap.get(categoriaId)?.nome || 'Categoria Desconhecida';
    
    resumoPorCategoria.push({
      categoriaId,
      categoriaNome,
      pesoTotal: pesoTotalCategoria,
      pesoSim: pesoSimCategoria,
      pesoNao: pesoNaoCategoria,
      percentualAproveitamento: percentualCategoria,
      totalPerguntas: perguntasCategoria.length,
      perguntasRespondidas: perguntasRespondidasCategoria,
    });
  }
  
  // Ordenar categorias por percentual de aproveitamento (decrescente)
  resumoPorCategoria.sort((a, b) => b.percentualAproveitamento - a.percentualAproveitamento);

  // Função para renderizar diferentes tipos de resposta
  const renderizarResposta = (item: any) => {
    if (item.resposta !== null) {
      return item.resposta ? 'Sim' : 'Não';
    }
    
    if (item.resposta_escala !== null) {
      return (
        <div className="flex items-center gap-2">
          <span className="font-medium">{item.resposta_escala}</span>
          {item.config_escala && (
            <span className="text-xs text-gray-500">
              (escala {item.config_escala.escalaMin}-{item.config_escala.escalaMax})
            </span>
          )}
        </div>
      );
    }
    
    if (item.resposta_multipla !== null && item.resposta_multipla.length > 0) {
      if (item.tipo === 'multipla_escolha_unica') {
        const opcao = item.opcoes?.find((o: any) => o.valor === item.resposta_multipla[0]);
        return opcao ? opcao.texto : item.resposta_multipla[0];
      } else {
        const opcoes = item.resposta_multipla.map((valor: string) => {
          const opcao = item.opcoes?.find((o: any) => o.valor === valor);
          return opcao ? opcao.texto : valor;
        });
        return (
          <div className="space-y-1">
            {opcoes.map((opcao: string, index: number) => (
              <div key={index} className="text-sm bg-gray-100 px-2 py-1 rounded">
                {opcao}
              </div>
            ))}
          </div>
        );
      }
    }
    
    if (item.resposta_texto !== null) {
      return (
        <div className="max-w-xs">
          <div className="text-sm bg-gray-100 p-2 rounded max-h-20 overflow-y-auto">
            {item.resposta_texto}
          </div>
        </div>
      );
    }
    
    return '—';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Detalhe das Respostas</h1>
        <p className="text-sm opacity-80">
          {pessoa.nome} &lt;{pessoa.email}&gt; • CNPJ: {pessoa.cnpj} • Empresa: {pessoa.empresa ?? '—'}
        </p>
        <p className="text-sm opacity-80">
          Questionário: {q.nome} (Progresso: {respondidas}/{total} = {pct}%)
        </p>
      </div>

      {/* Resumo Geral de Pesos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-sm text-blue-600 font-medium">Peso Total Possível</div>
          <div className="text-2xl font-bold text-blue-800">{pesoTotalPossivel}</div>
          <div className="text-xs text-blue-600">Soma de todos os pesos</div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-600 font-medium">Peso Respostas SIM</div>
          <div className="text-2xl font-bold text-green-800">{pesoRespostasSim}</div>
          <div className="text-xs text-green-600">Apenas perguntas Sim/Não</div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-sm text-red-600 font-medium">Peso Respostas NÃO</div>
          <div className="text-2xl font-bold text-red-800">{pesoRespostasNao}</div>
          <div className="text-xs text-red-600">Apenas perguntas Sim/Não</div>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="text-sm text-purple-600 font-medium">Aproveitamento Geral</div>
          <div className="text-2xl font-bold text-purple-800">{percentualAproveitamento}%</div>
          <div className="text-xs text-purple-600">SIM ÷ Total Possível</div>
        </div>
      </div>

      {/* Resumo por Categoria */}
      {resumoPorCategoria.length > 1 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">📊 Resumo por Categoria</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {resumoPorCategoria.map((resumo) => (
              <div key={resumo.categoriaId} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{resumo.categoriaNome}</h3>
                  <span className={`
                    px-2 py-1 rounded-full text-xs font-medium
                    ${resumo.percentualAproveitamento >= 80 ? 'bg-green-100 text-green-800' : ''}
                    ${resumo.percentualAproveitamento >= 60 && resumo.percentualAproveitamento < 80 ? 'bg-yellow-100 text-yellow-800' : ''}
                    ${resumo.percentualAproveitamento < 60 ? 'bg-red-100 text-red-800' : ''}
                  `}>
                    {resumo.percentualAproveitamento}%
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Peso Total:</span>
                    <span className="font-medium">{resumo.pesoTotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Peso SIM:</span>
                    <span className="font-medium text-green-600">{resumo.pesoSim}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Peso NÃO:</span>
                    <span className="font-medium text-red-600">{resumo.pesoNao}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Perguntas:</span>
                    <span className="font-medium">{resumo.perguntasRespondidas}/{resumo.totalPerguntas}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabela de Respostas */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">📝 Detalhamento das Respostas</h2>
        <div className="overflow-auto border rounded">
          <table className="min-w-[800px] w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left p-2">Categoria</th>
                <th className="text-left p-2">Pergunta</th>
                <th className="text-left p-2">Tipo</th>
                <th className="text-right p-2">Peso</th>
                <th className="text-left p-2">Resposta</th>
                <th className="text-left p-2">Respondida em</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((i) => {
                const categoriaNome = i.categoria_id 
                  ? categoriasMap.get(i.categoria_id)?.nome || 'Desconhecida'
                  : 'Sem Categoria';
                
                return (
                  <tr key={i.pergunta_id} className="border-t">
                    <td className="p-2">
                      <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                        {categoriaNome}
                      </span>
                    </td>
                    <td className="p-2">{i.texto}</td>
                    <td className="p-2">
                      <span className={`
                        px-2 py-1 rounded-full text-xs font-medium
                        ${i.tipo === 'sim_nao' ? 'bg-blue-100 text-blue-800' : ''}
                        ${i.tipo === 'escala' ? 'bg-green-100 text-green-800' : ''}
                        ${i.tipo === 'multipla_escolha_unica' ? 'bg-purple-100 text-purple-800' : ''}
                        ${i.tipo === 'multipla_escolha_multipla' ? 'bg-indigo-100 text-indigo-800' : ''}
                        ${i.tipo === 'texto_curto' ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${i.tipo === 'texto_longo' ? 'bg-orange-100 text-orange-800' : ''}
                      `}>
                        {i.tipo === 'sim_nao' && 'Sim/Não'}
                        {i.tipo === 'escala' && 'Escala'}
                        {i.tipo === 'multipla_escolha_unica' && 'Múltipla (Única)'}
                        {i.tipo === 'multipla_escolha_multipla' && 'Múltipla (Múltipla)'}
                        {i.tipo === 'texto_curto' && 'Texto Curto'}
                        {i.tipo === 'texto_longo' && 'Texto Longo'}
                      </span>
                    </td>
                    <td className="p-2 text-right font-medium">{i.peso}</td>
                    <td className="p-2">
                      {renderizarResposta(i)}
                    </td>
                    <td className="p-2">
                      {i.respondido_em ? new Date(i.respondido_em).toLocaleString() : '—'}
                    </td>
                  </tr>
                );
              })}
              {itens.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-4 text-center text-gray-500">Sem dados.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Link className="underline text-sm" href="/admin/respostas">← Voltar</Link>
    </div>
  );
}
