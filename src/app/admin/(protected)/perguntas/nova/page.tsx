import { createSupabaseServer } from '@/lib/supabaseServer';
import { getSessionAndAdmin } from '@/lib/isAdmin';

// Força o uso do Node.js runtime para evitar problemas com Edge Runtime
export const runtime = 'nodejs';

export default async function NovaPergunta() {
  const { isAdmin } = await getSessionAndAdmin();
  if (!isAdmin) return <div className="p-6 text-red-600">Acesso negado.</div>;

  const supabase = await createSupabaseServer();
  const { data: categorias } = await supabase.from('categorias').select('id, nome').order('nome', { ascending: true });

  return (
    <form action="/api/admin/perguntas" method="post" className="max-w-md grid gap-3">
      <h1 className="text-xl font-semibold">Nova Pergunta</h1>
      <textarea name="texto" required placeholder="Texto da pergunta" className="border p-2 rounded" />
      <input type="number" name="peso" min={0} defaultValue={0} required className="border p-2 rounded" />
      <select name="categoria_id" className="border p-2 rounded">
        <option value="">Sem categoria</option>
        {categorias?.map((c:any)=><option key={c.id} value={c.id}>{c.nome}</option>)}
      </select>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="ativa" defaultChecked /> Ativa
      </label>
      <button className="bg-black text-white p-2 rounded">Salvar</button>
    </form>
  );
}
