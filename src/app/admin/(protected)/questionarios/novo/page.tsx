import { getSessionAndAdmin } from '@/lib/isAdmin';

export default async function NovoQuestionario() {
  const { isAdmin } = await getSessionAndAdmin();
  if (!isAdmin) return <div className="p-6 text-red-600">Acesso negado.</div>;

  return (
    <form action="/api/admin/questionarios" method="post" className="max-w-md grid gap-3">
      <h1 className="text-xl font-semibold">Novo Questionário</h1>
      <input name="nome" required placeholder="Nome" className="border p-2 rounded" />
      <input name="slug" required placeholder="slug-exemplo" className="border p-2 rounded" />
      <button className="bg-black text-white p-2 rounded">Criar</button>
    </form>
  );
}
