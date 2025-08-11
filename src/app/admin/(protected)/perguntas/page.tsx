import { createSupabaseServer } from '@/lib/supabaseServer';
import { getSessionAndAdmin } from '@/lib/isAdmin';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function PerguntasPage() {
  const { isAdmin } = await getSessionAndAdmin();
  if (!isAdmin) return <div className="p-6 text-red-600">Acesso negado.</div>;

  const supabase = await createSupabaseServer();
  const { data: perguntas, error } = await supabase
    .from('perguntas')
    .select('id, texto, peso, ativa, categorias (nome)')
    .order('created_at', { ascending: false });

  if (error) return <div className="p-6 text-red-600">Erro: {error.message}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Perguntas</h1>
        <Link href="/admin/perguntas/nova" className="border px-3 py-1 rounded">Nova</Link>
      </div>
      <ul className="divide-y">
        {(perguntas ?? []).map((p:any)=>(
          <li key={p.id} className="py-2 flex justify-between">
            <div>
              <div className="font-medium">{p.texto}</div>
              <div className="text-sm opacity-70">
                Peso: {p.peso} • Categoria: {p.categorias?.nome ?? '—'} • {p.ativa ? 'Ativa' : 'Inativa'}
              </div>
            </div>
            <Link className="underline text-sm" href={`/admin/perguntas/${p.id}`}>Editar</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
