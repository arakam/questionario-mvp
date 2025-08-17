import { createSupabaseServer } from '@/lib/supabaseServer';

// Força o uso do Node.js runtime para evitar problemas com Edge Runtime
export const runtime = 'nodejs';

export default async function EditCategoria({
  params,
}: {
  params: Promise<{ id: string }>; // 👈 params é Promise
}) {
  const { id } = await params;     // 👈 await params
  const supabase = await createSupabaseServer();

  const { data: c } = await supabase
    .from('categorias')
    .select('*')
    .eq('id', id)
    .single();

  if (!c) return <div className="p-6">Não encontrada.</div>;

  return (
    <form action={`/api/admin/categorias/${id}`} method="post" className="max-w-md grid gap-3">
      <h1 className="text-xl font-semibold">Editar Categoria</h1>
      <input name="nome" defaultValue={c.nome} required className="border p-2 rounded" />
      <textarea name="descricao" defaultValue={c.descricao ?? ''} className="border p-2 rounded" />
      <div className="flex gap-2">
        <button className="bg-black text-white p-2 rounded">Salvar</button>
        <button formAction={`/api/admin/categorias/${id}/delete`} className="border p-2 rounded">
          Excluir
        </button>
      </div>
    </form>
  );
}


