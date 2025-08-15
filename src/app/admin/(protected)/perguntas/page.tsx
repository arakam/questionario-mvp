import Link from 'next/link';
import { createSupabaseServer } from '@/lib/supabaseServer';
import { getSessionAndAdmin } from '@/lib/isAdmin';

export const dynamic = 'force-dynamic';

type Categoria = { id: string; nome: string };
type Pergunta = {
  id: string;
  texto: string;
  peso: number;
  ativa: boolean;
  categoria_id: string | null;
};

export default async function PerguntasPage({
  searchParams,
}: {
  // Next 15: searchParams é Promise
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { isAdmin } = await getSessionAndAdmin();
  if (!isAdmin) return <div className="p-6 text-red-600">Acesso negado.</div>;

  const sp = (await searchParams) ?? {};
  // Aceita ?categoria= ou ?cat=
  const rawCategoria = sp.categoria ?? sp.cat;
  const categoriaParam = Array.isArray(rawCategoria) ? rawCategoria[0] : rawCategoria;
  const categoriaId = categoriaParam && categoriaParam !== '' ? categoriaParam : undefined;

  const supabase = await createSupabaseServer();

  // Carrega categorias para o filtro (ordem alfabética)
  const { data: categorias, error: catErr } = await supabase
    .from('categorias')
    .select('id, nome')
    .order('nome', { ascending: true })
    .returns<Categoria[]>();

  if (catErr) {
    return <div className="p-6 text-red-600">Erro ao carregar categorias: {catErr.message}</div>;
  }

  // Mapa id->nome para exibir o nome na tabela sem join
  const catMap = new Map<string, string>((categorias ?? []).map((c) => [c.id, c.nome]));

  // Busca perguntas, com filtro opcional por categoria
  let query = supabase
    .from('perguntas')
    .select('id, texto, peso, ativa, categoria_id')
    .order('created_at', { ascending: false })
    .returns<Pergunta[]>();

  if (categoriaId) {
    query = query.eq('categoria_id', categoriaId);
  }

  const { data: perguntas, error: perr } = await query;

  if (perr) {
    return <div className="p-6 text-red-600">Erro ao carregar perguntas: {perr.message}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold">Perguntas</h1>
        <div className="flex items-center gap-3">
          <form action="/admin/perguntas" method="get" className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Categoria:</label>
            <select
              name="categoria"
              defaultValue={categoriaId ?? ''}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="">Todas</option>
              {(categorias ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
            <button className="border px-3 py-1 rounded text-sm">Filtrar</button>
            {categoriaId && (
              <Link href="/admin/perguntas" className="underline text-sm ml-1">
                Limpar
              </Link>
            )}
          </form>

          <Link href="/admin/perguntas/nova" className="border px-3 py-1 rounded">
            Nova
          </Link>
        </div>
      </div>

      <div className="overflow-auto border rounded">
        <table className="min-w-[900px] w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2 w-[40%]">Pergunta</th>
              <th className="text-left p-2">Categoria</th>
              <th className="text-right p-2">Peso</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {(perguntas ?? []).map((p) => {
              const nomeCategoria = p.categoria_id ? catMap.get(p.categoria_id) ?? '—' : '—';
              return (
                <tr key={p.id} className="border-t">
                  <td className="p-2">{p.texto}</td>
                  <td className="p-2">{nomeCategoria}</td>
                  <td className="p-2 text-right">{p.peso}</td>
                  <td className="p-2">
                    {p.ativa ? (
                      <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs">Ativa</span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs opacity-70">
                        Inativa
                      </span>
                    )}
                  </td>
                  <td className="p-2">
                    <Link className="underline" href={`/admin/perguntas/${p.id}`}>
                      Editar
                    </Link>
                  </td>
                </tr>
              );
            })}
            {(perguntas ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  Nenhuma pergunta {categoriaId ? 'nesta categoria' : ''}.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
