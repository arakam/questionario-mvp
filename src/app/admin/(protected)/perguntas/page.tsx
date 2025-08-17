import Link from 'next/link';
import { createSupabaseServer } from '@/lib/supabaseServer';
import { getSessionAndAdmin } from '@/lib/isAdmin';
import CategoryFilter from './_components/CategoryFilter';

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
    .order('created_at', { ascending: false });

  if (categoriaId) {
    query = query.eq('categoria_id', categoriaId);
  }

  const { data: perguntas, error: perr } = await query.returns<Pergunta[]>();

  if (perr) {
    return <div className="p-6 text-red-600">Erro ao carregar perguntas: {perr.message}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📝 Gerenciar Perguntas
          </h1>
          <p className="text-gray-600">
            Crie e gerencie as perguntas dos seus questionários
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <CategoryFilter categorias={categorias ?? []} categoriaId={categoriaId} />
          <Link href="/admin/perguntas/nova" className="btn-primary">
            ➕ Nova Pergunta
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary-blue mb-2">
            {perguntas?.length || 0}
          </div>
          <div className="text-gray-600">Total de Perguntas</div>
        </div>
        
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary-orange mb-2">
            {(perguntas?.filter(p => p.ativa) || []).length}
          </div>
          <div className="text-gray-600">Perguntas Ativas</div>
        </div>
        
        <div className="card text-center">
          <div className="text-3xl font-bold text-accent-blue mb-2">
            {categorias?.length || 0}
          </div>
          <div className="text-gray-600">Categorias</div>
        </div>
      </div>

      {/* Table Section */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="table-modern">
            <thead>
              <tr>
                <th className="w-[40%]">Pergunta</th>
                <th>Categoria</th>
                <th className="text-center">Peso</th>
                <th className="text-center">Status</th>
                <th className="text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {(perguntas ?? []).map((p) => {
                const nomeCategoria = p.categoria_id ? catMap.get(p.categoria_id) ?? '—' : '—';
                return (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="font-medium text-gray-900">{p.texto}</td>
                    <td>
                      <span className="badge badge-info">
                        {nomeCategoria}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-700 rounded-full font-semibold text-sm">
                        {p.peso}
                      </span>
                    </td>
                    <td className="text-center">
                      {p.ativa ? (
                        <span className="badge badge-success">
                          ✅ Ativa
                        </span>
                      ) : (
                        <span className="badge badge-warning">
                          ⏸️ Inativa
                        </span>
                      )}
                    </td>
                    <td className="text-center">
                      <Link 
                        href={`/admin/perguntas/${p.id}`} 
                        className="btn-secondary text-sm px-3 py-1"
                      >
                        ✏️ Editar
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {(perguntas ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-12">
                    <div className="text-gray-500">
                      <div className="text-4xl mb-2">📭</div>
                      <div className="text-lg font-medium mb-1">Nenhuma pergunta encontrada</div>
                      <div className="text-sm">
                        {categoriaId ? 'nesta categoria' : 'Comece criando sua primeira pergunta'}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
