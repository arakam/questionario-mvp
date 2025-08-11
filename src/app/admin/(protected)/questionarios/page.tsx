import Link from 'next/link';
import { createSupabaseServer } from '@/lib/supabaseServer';
import { getSessionAndAdmin } from '@/lib/isAdmin';

export const dynamic = 'force-dynamic';

export default async function QuestionariosPage() {
  const { isAdmin } = await getSessionAndAdmin();
  if (!isAdmin) return <div className="p-6 text-red-600">Acesso negado.</div>;

  const supabase = await createSupabaseServer();
  const { data: qs, error } = await supabase
    .from('questionarios')
    .select('id, nome, slug, created_at')
    .order('created_at', { ascending: false });

  if (error) return <div className="p-6 text-red-600">Erro: {error.message}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">Questionários</h1>
        <Link href="/admin/questionarios/novo" className="border px-3 py-1 rounded">Novo</Link>
      </div>

      <ul className="divide-y">
        {(qs ?? []).map((q: any) => (
          <li key={q.id} className="py-2 flex justify-between">
            <div>
              <div className="font-medium">{q.nome}</div>
              <div className="text-sm opacity-70">Slug: {q.slug} • Link público: /q/{q.slug}</div>
            </div>
            <Link className="underline text-sm" href={`/admin/questionarios/${q.id}`}>Editar</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
