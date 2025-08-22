import { supabaseAdminOnly } from '@/lib/supabaseAdminOnly';
import { getSessionAndAdmin } from '@/lib/isAdmin';
import FiltroRespostas from './FiltroRespostas';

// Força o uso do Node.js runtime para evitar problemas com Edge Runtime
export const runtime = 'nodejs';

export const dynamic = 'force-dynamic';

type ResumoRow = {
  pessoa_id: string;
  pessoa_nome: string;
  email: string;
  cnpj: string;
  questionario_id: string;
  questionario_nome: string;
  respondidas: number;
  total_perguntas: number;
  pct: number;
  ultima_resposta: string | null;
};

export default async function RespostasResumoPage({
  searchParams,
}: {
  searchParams: Promise<{ questionario?: string; search?: string }>;
}) {
  const { isAdmin } = await getSessionAndAdmin();
  if (!isAdmin) return <div className="p-6 text-red-600">Acesso negado.</div>;

  const admin = supabaseAdminOnly();
  const params = await searchParams;

  // 1) Buscar todos os questionários para o filtro
  const { data: questionarios, error: e2 } = await admin
    .from('questionarios')
    .select('id, nome, slug')
    .order('nome', { ascending: true });

  if (e2) return <div className="p-6 text-red-600">Erro ao buscar questionários: {e2.message}</div>;

  // 2) Total de perguntas por questionário
  const { data: qp, error: e0 } = await admin
    .from('questionario_perguntas')
    .select('questionario_id, pergunta_id');

  if (e0) return <div className="p-6 text-red-600">Erro: {e0.message}</div>;

  const totals = new Map<string, number>();
  for (const row of qp ?? []) {
    totals.set(row.questionario_id, (totals.get(row.questionario_id) ?? 0) + 1);
  }

  // 3) Respostas com joins (pessoas, questionarios) e filtros
  let query = admin
    .from('respostas')
    .select('pessoa_id, questionario_id, respondido_em, pessoas(id, nome, email, cnpj), questionarios(id, nome)');

  // Aplicar filtro por questionário se especificado
  if (params.questionario) {
    query = query.eq('questionario_id', params.questionario);
  }

  const { data: resp, error: e1 } = await query.order('respondido_em', { ascending: false });

  if (e1) return <div className="p-6 text-red-600">Erro: {e1.message}</div>;

  // 4) Agrupar por (pessoa, questionario)
  const map = new Map<string, (ResumoRow & { _ultima: number })>();

  for (const r of (resp ?? [])) {
    const pessoa = (r as any).pessoas;
    const quest = (r as any).questionarios;
    if (!pessoa || !quest) continue;

    const key = `${r.pessoa_id}|${r.questionario_id}`;
    const total_perguntas = totals.get(r.questionario_id) ?? 0;
    const ts = r.respondido_em ? new Date(r.respondido_em).getTime() : 0;

    if (!map.has(key)) {
      map.set(key, {
        pessoa_id: r.pessoa_id,
        pessoa_nome: pessoa.nome,
        email: pessoa.email,
        cnpj: pessoa.cnpj,
        questionario_id: r.questionario_id,
        questionario_nome: quest.nome,
        respondidas: 1,
        total_perguntas,
        pct: total_perguntas ? (1 / total_perguntas) * 100 : 0,
        ultima_resposta: r.respondido_em ?? null,
        _ultima: ts,
      });
    } else {
      const row = map.get(key)!;
      row.respondidas += 1;
      row.pct = row.total_perguntas ? (row.respondidas / row.total_perguntas) * 100 : 0;
      if (ts > row._ultima) {
        row._ultima = ts;
        row.ultima_resposta = r.respondido_em ?? row.ultima_resposta;
      }
      map.set(key, row);
    }
  }

  let rows = Array.from(map.values())
    .sort((a, b) => (b._ultima - a._ultima))
    .map(({ _ultima, ...rest }) => rest);

  // Aplicar filtro de busca por texto se especificado
  if (params.search) {
    const searchLower = params.search.toLowerCase();
    rows = rows.filter(row => 
      row.pessoa_nome.toLowerCase().includes(searchLower) ||
      row.email.toLowerCase().includes(searchLower) ||
      (row.cnpj && row.cnpj.toLowerCase().includes(searchLower)) ||
      row.questionario_nome.toLowerCase().includes(searchLower)
    );
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Respostas (Resumo)</h1>

      {/* Filtros */}
      <FiltroRespostas 
        questionarios={questionarios || []} 
        totalRespostas={rows.length}
      />

      <div className="overflow-auto border rounded">
        <table className="min-w-[900px] w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Pessoa</th>
              <th className="text-left p-2">E-mail</th>
              <th className="text-left p-2">CNPJ</th>
              <th className="text-left p-2">Questionário</th>
              <th className="text-right p-2">Respondidas</th>
              <th className="text-right p-2">Total</th>
              <th className="text-right p-2">Progresso</th>
              <th className="text-left p-2">Última resposta</th>
              <th className="text-left p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={`${r.pessoa_id}|${r.questionario_id}`} className="border-t">
                <td className="p-2">{r.pessoa_nome}</td>
                <td className="p-2">{r.email}</td>
                <td className="p-2">{r.cnpj}</td>
                <td className="p-2">{r.questionario_nome}</td>
                <td className="p-2 text-right">{r.respondidas}</td>
                <td className="p-2 text-right">{r.total_perguntas}</td>
                <td className="p-2 text-right">{r.pct.toFixed(0)}%</td>
                <td className="p-2">
                  {r.ultima_resposta ? new Date(r.ultima_resposta).toLocaleString() : '—'}
                </td>
                <td className="p-2">
                  <a
                    className="underline"
                    href={`/admin/respostas/${r.pessoa_id}/${r.questionario_id}`}
                  >
                    Ver detalhes
                  </a>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="p-4 text-center text-gray-500">Nenhuma resposta ainda.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
