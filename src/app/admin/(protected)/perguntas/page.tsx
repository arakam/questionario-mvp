// app/admin/perguntas/page.tsx
import { createSupabaseServer } from '@/lib/supabaseServer';
import { getSessionAndAdmin } from '@/lib/isAdmin';
import Link from 'next/link';
import AnimatedFade from './_components/AnimatedFade';
import CategoryFilter from './_components/CategoryFilter';

export const dynamic = 'force-dynamic';

type SP =
  | {
      cat?: string | string[];
    }
  | Promise<{
      cat?: string | string[];
    }>;

export default async function PerguntasPage({
  searchParams,
}: {
  searchParams?: SP;
}) {
  const { isAdmin } = await getSessionAndAdmin();
  if (!isAdmin) return <div className="p-6 text-red-600">Acesso negado.</div>;

  // Next 15 pode entregar searchParams como Promise
  const sp = searchParams
    ? (await (searchParams instanceof Promise ? searchParams : Promise.resolve(searchParams)))
    : {};
  const catParam = Array.isArray(sp?.cat) ? sp?.cat[0] : sp?.cat;
  const selectedCatId = catParam && catParam !== 'todas' ? catParam : undefined;

  const supabase = await createSupabaseServer();

  // Carrega categorias
  const { data: categorias, error: catError } = await supabase
    .from('categorias')
    .select('id, nome')
    .order('nome', { ascending: true });

  // Query de perguntas (com filtro opcional)
  let query = supabase
    .from('perguntas')
    .select('id, texto, peso, ativa, categoria_id, categorias (id, nome), created_at')
    .order('created_at', { ascending: false });

  if (selectedCatId) query = query.eq('categoria_id', selectedCatId);

  const { data: perguntas, error } = await query;

  if (error) return <div className="p-6 text-red-600">Erro: {error.message}</div>;
  if (catError) return <div className="p-6 text-red-600">Erro ao carregar categorias: {catError.message}</div>;

  return (
    <div className="space-y-4 p-4 md:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold">Perguntas</h1>
        <Link href="/admin/perguntas/nova" className="inline-flex items-center rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50">
          Nova
        </Link>
      </div>

      {/* Filtro (client) — troca a URL ?cat= e recarrega com transição */}
      <CategoryFilter
        categorias={categorias ?? []}
        selectedId={selectedCatId}
        basePath="/admin/perguntas"
      />

      {/* Lista com fade a cada mudança de filtro */}
      <AnimatedFade depKey={selectedCatId ?? 'todas'}>
        <ul className="divide-y rounded-md border bg-white">
          {(perguntas ?? []).map((p: any) => (
            <li key={p.id} className="px-4 py-3 flex justify-between gap-4">
              <div>
                <div className="font-medium">{p.texto}</div>
                <div className="text-sm opacity-70">
                  Peso: {p.peso} • Categoria: {p.categorias?.nome ?? '—'} • {p.ativa ? 'Ativa' : 'Inativa'}
                </div>
              </div>
              <Link className="shrink-0 underline text-sm self-center" href={`/admin/perguntas/${p.id}`}>
                Editar
              </Link>
            </li>
          ))}
          {(!perguntas || perguntas.length === 0) && (
            <li className="px-4 py-6 text-sm text-gray-500">Nenhuma pergunta encontrada.</li>
          )}
        </ul>
      </AnimatedFade>
    </div>
  );
}
