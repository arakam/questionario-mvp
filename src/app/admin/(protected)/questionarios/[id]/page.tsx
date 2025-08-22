import { createSupabaseServer } from '@/lib/supabaseServer';
import { getSessionAndAdmin } from '@/lib/isAdmin';
import PerguntasSelector, {
  type Pergunta,
  type Categoria,
} from '@/components/PerguntasSelector';
import { type CampoConfiguravel } from '@/components/ConfiguracaoCampos';
import Link from 'next/link';

// Força o uso do Node.js runtime para evitar problemas com Edge Runtime
export const runtime = 'nodejs';

export const dynamic = 'force-dynamic';

type Questionario = {
  id: string;
  nome: string;
  slug: string;
  campos_configuraveis?: CampoConfiguravel[];
};

type SelecionadaRow = { pergunta_id: string };

export default async function EditQuestionario({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // Next 15: params é Promise
  const { id } = await params;

  const { isAdmin } = await getSessionAndAdmin();
  if (!isAdmin) return <div className="p-6 text-red-600">Acesso negado.</div>;

  const supabase = await createSupabaseServer();

  const [
    { data: q, error: e1 },
    { data: perguntas, error: e2 },
    { data: selecionadas, error: e3 },
    { data: categorias, error: e4 },
  ] = await Promise.all([
    supabase
      .from('questionarios')
      .select('id, nome, slug, campos_configuraveis')
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

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Metadados do questionário */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Informações do Questionário</h2>
        <form action={`/api/admin/questionarios/${id}`} method="post" className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Questionário <span className="text-red-500">*</span>
            </label>
            <input
              name="nome"
              defaultValue={q.nome}
              required
              className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-black/60 focus:border-transparent"
              placeholder="Nome do questionário"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1">
              Slug <span className="text-red-500">*</span>
            </label>
            <input
              name="slug"
              defaultValue={q.slug}
              required
              className="w-full border rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-black/60 focus:border-transparent"
              placeholder="slug-exemplo"
            />
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="btn-primary">
              💾 Salvar Alterações
            </button>
          </div>
        </form>
      </div>

      {/* Configuração de campos configuráveis */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Campos de Dados Pessoais</h2>
          <Link 
            href={`/admin/questionarios/${id}/campos`}
            className="btn-secondary text-sm"
          >
            ⚙️ Configurar Campos
          </Link>
        </div>
        <div className="text-sm text-gray-600">
          {q.campos_configuraveis ? (
            <p>
              Este questionário tem <strong>{q.campos_configuraveis.length} campos personalizados</strong> configurados.
              Clique em "Configurar Campos" para modificá-los.
            </p>
          ) : (
            <p>
              Este questionário usa os <strong>campos padrão</strong> (nome, email, telefone, CNPJ, etc.).
              Clique em "Configurar Campos" para personalizá-los.
            </p>
          )}
        </div>
      </div>

      {/* Seletor com busca + filtro de categoria + seleção em massa */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Perguntas do Questionário</h2>
        <PerguntasSelector
          perguntas={perguntas ?? []}
          categorias={categorias ?? []}
          preselectedIds={(selecionadas ?? []).map((x) => x.pergunta_id)}
          actionUrl={`/api/admin/questionarios/${id}/perguntas`}
        />
      </div>
    </div>
  );
}
