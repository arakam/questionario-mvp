import Link from 'next/link';
import { supabaseAdminOnly } from '@/lib/supabaseAdminOnly';
import { getSessionAndAdmin } from '@/lib/isAdmin';

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
};

type QPRow = {
  pergunta_id: string;
  perguntas: Pergunta; // join !inner
};

type RespostaRow = {
  pergunta_id: string;
  resposta: boolean;
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
      .select('pergunta_id, perguntas!inner(id, texto, peso)')
      .eq('questionario_id', questionarioId)
      .returns<QPRow[]>(), // tipa o array
    admin
      .from('respostas')
      .select('pergunta_id, resposta, respondido_em')
      .eq('pessoa_id', pessoaId)
      .eq('questionario_id', questionarioId)
      .returns<RespostaRow[]>(),
  ]);

  if (e3) return <div className="p-6 text-red-600">Erro: {e3.message}</div>;
  if (e4) return <div className="p-6 text-red-600">Erro: {e4.message}</div>;

  const perguntas: Pergunta[] = (qps ?? []).map((x) => x.perguntas);

  const mapResp = new Map<string, { resposta: boolean; respondido_em: string | null }>();
  for (const r of (resp ?? [])) {
    mapResp.set(r.pergunta_id, { resposta: r.resposta, respondido_em: r.respondido_em });
  }

  const itens = perguntas.map((p) => {
    const r = mapResp.get(p.id);
    return {
      pergunta_id: p.id,
      texto: p.texto,
      peso: p.peso,
      resposta: r?.resposta ?? null,
      respondido_em: r?.respondido_em ?? null,
    };
  });

  const respondidas = itens.filter((i) => i.resposta !== null).length;
  const total = itens.length;
  const pct = total ? Math.round((respondidas / total) * 100) : 0;

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
              <th className="text-right p-2">Peso</th>
              <th className="text-left p-2">Resposta</th>
              <th className="text-left p-2">Respondida em</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((i) => (
              <tr key={i.pergunta_id} className="border-t">
                <td className="p-2">{i.texto}</td>
                <td className="p-2 text-right">{i.peso}</td>
                <td className="p-2">
                  {i.resposta === null ? '—' : i.resposta ? 'Sim' : 'Não'}
                </td>
                <td className="p-2">
                  {i.respondido_em ? new Date(i.respondido_em).toLocaleString() : '—'}
                </td>
              </tr>
            ))}
            {itens.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">Sem dados.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Link className="underline text-sm" href="/admin/respostas">← Voltar</Link>
    </div>
  );
}
