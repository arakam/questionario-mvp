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

type Pergunta = {
  id: string;
  texto: string;
  peso: number;
  tipo: string;
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

export default async function RespostasDetalhePage({
  params,
}: {
  params: Promise<{ pessoaId: string; questionarioId: string }>;
}) {
  const { isAdmin } = await getSessionAndAdmin();
  if (!isAdmin) return <div className="p-6 text-red-600">Acesso negado.</div>;

  const { pessoaId, questionarioId } = await params;
  const admin = supabaseAdminOnly();

  // pessoa + questionário
  const [{ data: pessoa, error: e1 }, { data: q, error: e2 }] = await Promise.all([
    admin.from('pessoas').select('id, nome, email, cnpj, empresa').eq('id', pessoaId).single<Pessoa>(),
    admin.from('questionarios').select('id, nome, slug').eq('id', questionarioId).single<Questionario>(),
  ]);

  if (e1) return <div className="p-6 text-red-600">Erro: {e1.message}</div>;
  if (e2) return <div className="p-6 text-red-600">Erro: {e2.message}</div>;
  if (!pessoa || !q) return <div className="p-6">Dados não encontrados.</div>;

  // perguntas do questionário + respostas da pessoa
  const [{ data: qps, error: e3 }, { data: resp, error: e4 }] = await Promise.all([
    admin
      .from('questionario_perguntas')
      .select('pergunta_id, perguntas!inner(id, texto, peso, tipo, opcoes, config_escala)')
      .eq('questionario_id', questionarioId)
      .returns<QPRow[]>(), // tipa o array
    admin
      .from('respostas')
      .select('pergunta_id, resposta, resposta_texto, resposta_escala, resposta_multipla, tipo_pergunta, respondido_em')
      .eq('pessoa_id', pessoaId)
      .eq('questionario_id', questionarioId)
      .returns<RespostaRow[]>(),
  ]);

  if (e3) return <div className="p-6 text-red-600">Erro: {e3.message}</div>;
  if (e4) return <div className="p-6 text-red-600">Erro: {e4.message}</div>;

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
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Detalhe das Respostas</h1>
        <p className="text-sm opacity-80">
          {pessoa.nome} &lt;{pessoa.email}&gt; • CNPJ: {pessoa.cnpj} • Empresa: {pessoa.empresa ?? '—'}
        </p>
        <p className="text-sm opacity-80">
          Questionário: {q.nome} (Progresso: {respondidas}/{total} = {pct}%)
        </p>
      </div>

      <div className="overflow-auto border rounded">
        <table className="min-w-[800px] w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Pergunta</th>
              <th className="text-left p-2">Tipo</th>
              <th className="text-right p-2">Peso</th>
              <th className="text-left p-2">Resposta</th>
              <th className="text-left p-2">Respondida em</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((i) => (
              <tr key={i.pergunta_id} className="border-t">
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
                <td className="p-2 text-right">{i.peso}</td>
                <td className="p-2">
                  {renderizarResposta(i)}
                </td>
                <td className="p-2">
                  {i.respondido_em ? new Date(i.respondido_em).toLocaleString() : '—'}
                </td>
              </tr>
            ))}
            {itens.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">Sem dados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Link className="underline text-sm" href="/admin/respostas">← Voltar</Link>
    </div>
  );
}
