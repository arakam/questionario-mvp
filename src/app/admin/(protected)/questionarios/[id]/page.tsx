import { createSupabaseServer } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export default async function EditQuestionario({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Next 15: params é Promise
  const { id } = await params;

  const supabase = await createSupabaseServer();

  const [{ data: q, error: e1 }, { data: perguntas, error: e2 }, { data: selecionadas, error: e3 }] =
    await Promise.all([
      supabase.from('questionarios').select('*').eq('id', id).single(),
      supabase.from('perguntas').select('id, texto').eq('ativa', true).order('created_at', { ascending: false }),
      supabase.from('questionario_perguntas').select('pergunta_id').eq('questionario_id', id),
    ]);

  if (e1 || e2 || e3) {
    const msg = e1?.message ?? e2?.message ?? e3?.message ?? 'Erro ao carregar dados';
    return <div className="p-6 text-red-600">Erro: {msg}</div>;
  }
  if (!q) return <div className="p-6">Questionário não encontrado.</div>;

  const selecionadasSet = new Set((selecionadas ?? []).map((x: any) => x.pergunta_id));

  return (
    <div className="space-y-4 max-w-2xl">
      <form action={`/api/admin/questionarios/${id}`} method="post" className="grid gap-3">
        <h1 className="text-xl font-semibold">Editar Questionário</h1>
        <input name="nome" defaultValue={q.nome} required className="border p-2 rounded" />
        <input name="slug" defaultValue={q.slug} required className="border p-2 rounded" />
        <button className="bg-black text-white p-2 rounded w-fit">Salvar</button>
      </form>

      <form action={`/api/admin/questionarios/${id}/perguntas`} method="post" className="grid gap-3">
        <h2 className="text-lg font-semibold">Selecionar Perguntas</h2>
        <div className="grid gap-2">
          {(perguntas ?? []).map((p: any) => (
            <label key={p.id} className="flex items-center gap-2">
              <input type="checkbox" name="pergunta_ids" value={p.id} defaultChecked={selecionadasSet.has(p.id)} />
              <span>{p.texto}</span>
            </label>
          ))}
        </div>
        <button className="border p-2 rounded w-fit">Atualizar perguntas</button>
      </form>
    </div>
  );
}
