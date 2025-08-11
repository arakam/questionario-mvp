import { getSessionAndAdmin } from '@/lib/isAdmin';

export default async function NovaCategoria() {
  const { isAdmin } = await getSessionAndAdmin();
  if (!isAdmin) return <div className="p-6 text-red-600">Acesso negado.</div>;

  return (
    <form action="/api/admin/categorias" method="post" className="max-w-md grid gap-3">
      <h1 className="text-xl font-semibold">Nova Categoria</h1>
      <input name="nome" required placeholder="Nome" className="border p-2 rounded" />
      <textarea name="descricao" placeholder="Descrição" className="border p-2 rounded" />
      <button className="bg-black text-white p-2 rounded">Salvar</button>
    </form>
  );
}
