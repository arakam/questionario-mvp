import Link from 'next/link';
import { createSupabaseServer } from '@/lib/supabaseServer';
import { getSessionAndAdmin } from '@/lib/isAdmin';
import ShareButtons from '@/components/ShareButtons';

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
        <Link href="/admin/questionarios/novo" className="border px-3 py-1 rounded">
          Novo
        </Link>
      </div>

      <ul className="divide-y">
        {(qs ?? []).map((q: any) => (
          <li key={q.id} className="py-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="font-medium truncate">{q.nome}</div>
              <div className="text-sm opacity-70">
                Slug: <span className="font-mono">{q.slug}</span> • Link público:{' '}
                <span className="font-mono">/q/{q.slug}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Botões de compartilhar/cópia */}
              <ShareButtons slug={q.slug} nome={q.nome} />

              {/* Editar */}
              <Link
                className="underline text-sm"
                href={`/admin/questionarios/${q.id}`}
              >
                Editar
              </Link>
            </div>
          </li>
        ))}
        {(qs ?? []).length === 0 && (
          <li className="py-6 text-center text-gray-500">Nenhum questionário ainda.</li>
        )}
      </ul>
    </div>
  );
}
