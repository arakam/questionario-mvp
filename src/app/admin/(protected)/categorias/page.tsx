import { createSupabaseServer } from '@/lib/supabaseServer';
import { getSessionAndAdmin } from '@/lib/isAdmin';
import Link from 'next/link';

// Força o uso do Node.js runtime para evitar problemas com Edge Runtime
export const runtime = 'nodejs';

export default async function CategoriasPage() {
  const { isAdmin } = await getSessionAndAdmin();
  if (!isAdmin) return <div className="p-6 text-red-600">Acesso negado.</div>;

  const supabase = await createSupabaseServer();
  const { data: categorias } = await supabase
    .from('categorias')
    .select('*')
    .order('nome', { ascending: true });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Categorias</h1>
        <Link href="/admin/categorias/nova" className="border px-3 py-1 rounded">Nova</Link>
      </div>
      <ul className="divide-y">
        {categorias?.map((c:any)=>(
          <li key={c.id} className="py-2 flex justify-between">
            <div>
              <div className="font-medium">{c.nome}</div>
              <div className="text-sm opacity-70">{c.descricao}</div>
            </div>
            <Link className="underline text-sm" href={`/admin/categorias/${c.id}`}>Editar</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
