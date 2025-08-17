import { createSupabaseServer } from '@/lib/supabaseServer';
import PerguntasSelector, {
  type Pergunta,
  type Categoria,
} from '@/components/PerguntasSelector';

// Força o uso do Node.js runtime para evitar problemas com Edge Runtime
export const runtime = 'nodejs';

export const dynamic = 'force-dynamic';

type Questionario = {
  id: string;
  nome: string;
  slug: string;
};

type SelecionadaRow = { pergunta_id: string };

export default async function EditQuestionario({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Next 15: params é Promise
  const { id } = await params;

  const supabase = await createSupabaseServer();

  const [
    { data: q, error: e1 },
    { data: perguntas, error: e2 },
    { data: selecionadas, error: e3 },
    { data: categorias, error: e4 },
  ] = await Promise.all([
    supabase
      .from('questionarios')
      .select('id, nome, slug')
      .eq('id', id)
      .single<Questionario>(),
    supabase
      .from('perguntas')
      .select('id, texto, categoria_id')
      .eq('ativa', true)
      .order('created_at', { ascending: false })
      .returns<Pergunta[]>(),
    supabase
      .from('questionario_perguntas')
      .select('pergunta_id')
      .eq('questionario_id', id)
      .returns<SelecionadaRow[]>(),
    supabase
      .from('categorias')
      .select('id, nome')
      .order('nome', { ascending: true })
      .returns<Categoria[]>(),
  ]);

  if (e1 || e2 || e3 || e4) {
    const msg =
      e1?.message ?? e2?.message ?? e3?.message ?? e4?.message ?? 'Erro ao carregar dados';
    return <div className="p-6 text-red-600">Erro: {msg}</div>;
  }
  if (!q) return <div className="p-6">Questionário não encontrado.</div>;

  const preselectedIds = (selecionadas ?? []).map((x) => x.pergunta_id);

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Metadados do questionário */}
      <form action={`/api/admin/questionarios/${id}`} method="post" className="grid gap-3">
        <h1 className="text-xl font-semibold">Editar Questionário</h1>
        <input
          name="nome"
          defaultValue={q.nome}
          required
          className="border p-2 rounded"
          placeholder="Nome do questionário"
        />
        <input
          name="slug"
          defaultValue={q.slug}
          required
          className="border p-2 rounded"
          placeholder="slug-exemplo"
        />
        <button className="bg-black text-white p-2 rounded w-fit">Salvar</button>
      </form>

      {/* Seletor com busca + filtro de categoria + seleção em massa */}
      <PerguntasSelector
        perguntas={perguntas ?? []}
        categorias={categorias ?? []}
        preselectedIds={preselectedIds}
        actionUrl={`/api/admin/questionarios/${id}/perguntas`}
      />
    </div>
  );
}
