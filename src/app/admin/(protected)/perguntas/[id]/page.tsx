import { createSupabaseServer } from '@/lib/supabaseServer';

export default async function EditPergunta({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Aguarda o params para extrair o ID
  const { id } = await params;

  // Conecta ao Supabase no contexto do servidor
  const supabase = await createSupabaseServer();

  // Busca a pergunta e as categorias em paralelo
  const [{ data: p }, { data: categorias }] = await Promise.all([
    supabase.from('perguntas').select('*').eq('id', id).single(),
    supabase.from('categorias').select('id, nome').order('nome', { ascending: true }),
  ]);

  if (!p) {
    return <div className="p-6">Não encontrada.</div>;
  }

  return (
    <form
      action={`/api/admin/perguntas/${id}`}
      method="post"
      className="max-w-md grid gap-3"
    >
      <h1 className="text-xl font-semibold">Editar Pergunta</h1>

      <textarea
        name="texto"
        defaultValue={p.texto}
        required
        className="border p-2 rounded"
      />

      <input
        type="number"
        name="peso"
        min={0}
        defaultValue={p.peso}
        required
        className="border p-2 rounded"
      />

      <select
        name="categoria_id"
        defaultValue={p.categoria_id ?? ''}
        className="border p-2 rounded"
      >
        <option value="">Sem categoria</option>
        {categorias?.map((c: any) => (
          <option key={c.id} value={c.id}>
            {c.nome}
          </option>
        ))}
      </select>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="ativa" defaultChecked={p.ativa} /> Ativa
      </label>

      <div className="flex gap-2">
        <button className="bg-black text-white p-2 rounded">Salvar</button>
        <button
          formAction={`/api/admin/perguntas/${id}/delete`}
          className="border p-2 rounded"
        >
          Excluir
        </button>
      </div>
    </form>
  );
}
