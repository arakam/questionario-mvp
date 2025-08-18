import Link from 'next/link';
import { createSupabaseServer } from '@/lib/supabaseServer';
import { getSessionAndAdmin } from '@/lib/isAdmin';
import CategoryFilter from './_components/CategoryFilter';

export const dynamic = 'force-dynamic';

type Categoria = { id: string; nome: string };
type Pergunta = {
  id: string;
  texto: string;
  peso: number;
  ativa: boolean;
  categoria_id: string | null;
  tipo: string;
  opcoes?: string;
  config_escala?: string;
};

export default async function PerguntasPage({
  searchParams,
}: {
  // Next 15: searchParams é Promise
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { isAdmin } = await getSessionAndAdmin();
  if (!isAdmin) return <div className="p-6 text-red-600">Acesso negado.</div>;

  const sp = (await searchParams) ?? {};
  // Aceita ?categoria= ou ?cat=
  const rawCategoria = sp.categoria ?? sp.cat;
  const categoriaParam = Array.isArray(rawCategoria) ? rawCategoria[0] : rawCategoria;
  const categoriaId = categoriaParam && categoriaParam !== '' ? categoriaParam : undefined;

  const supabase = await createSupabaseServer();

  // Carrega categorias para o filtro (ordem alfabética)
  const { data: categorias, error: catErr } = await supabase
    .from('categorias')
    .select('id, nome')
    .order('nome', { ascending: true })
    .returns<Categoria[]>();

  if (catErr) {
    return <div className="p-6 text-red-600">Erro ao carregar categorias: {catErr.message}</div>;
  }

  // Mapa id->nome para exibir o nome na tabela sem join
  const catMap = new Map<string, string>((categorias ?? []).map((c) => [c.id, c.nome]));

  // Busca perguntas, com filtro opcional por categoria
  let query = supabase
    .from('perguntas')
    .select('id, texto, peso, ativa, categoria_id, tipo, opcoes, config_escala')
    .order('created_at', { ascending: false });

  if (categoriaId) {
    query = query.eq('categoria_id', categoriaId);
  }

  const { data: perguntas, error: perr } = await query.returns<Pergunta[]>();

  if (perr) {
    return <div className="p-6 text-red-600">Erro ao carregar perguntas: {perr.message}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📝 Gerenciar Perguntas
          </h1>
          <p className="text-gray-600">
            Crie e gerencie as perguntas dos seus questionários
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <CategoryFilter categorias={categorias ?? []} categoriaId={categoriaId} />
          <Link href="/admin/perguntas/nova" className="btn-primary">
            ➕ Nova Pergunta
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary-blue mb-2">
            {perguntas?.length || 0}
          </div>
          <div className="text-gray-600">Total de Perguntas</div>
        </div>
        
        <div className="card text-center">
          <div className="text-3xl font-bold text-primary-orange mb-2">
            {(perguntas?.filter(p => p.ativa) || []).length}
          </div>
          <div className="text-gray-600">Perguntas Ativas</div>
        </div>

        <div className="card text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {(perguntas?.filter(p => p.tipo === 'sim_nao') || []).length}
          </div>
          <div className="text-gray-600">Sim/Não</div>
        </div>

        <div className="card text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {(perguntas?.filter(p => p.tipo.includes('multipla_escolha')) || []).length}
          </div>
          <div className="text-gray-600">Múltipla Escolha</div>
        </div>
      </div>

      {/* Tabela de Perguntas */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Pergunta</th>
                <th>Tipo</th>
                <th>Categoria</th>
                <th>Peso</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {perguntas?.map((pergunta) => (
                <tr key={pergunta.id}>
                  <td className="max-w-xs">
                    <div className="font-medium text-gray-900">
                      {pergunta.texto}
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${getTipoBadgeClass(pergunta.tipo)}`}>
                      {getTipoLabel(pergunta.tipo)}
                    </span>
                  </td>
                  <td>
                    <span className="text-gray-600">
                      {catMap.get(pergunta.categoria_id || '') || 'Sem categoria'}
                    </span>
                  </td>
                  <td>
                    <span className="font-medium text-gray-900">
                      {pergunta.peso}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${pergunta.ativa ? 'badge-success' : 'badge-warning'}`}>
                      {pergunta.ativa ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td>
                    <div className="flex space-x-2">
                      <Link 
                        href={`/admin/perguntas/${pergunta.id}`}
                        className="btn-secondary text-sm py-1 px-3"
                      >
                        ✏️ Editar
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Funções auxiliares para tipos de pergunta
function getTipoLabel(tipo: string): string {
  const labels: Record<string, string> = {
    'sim_nao': 'Sim/Não',
    'multipla_escolha_unica': 'Múltipla (Única)',
    'multipla_escolha_multipla': 'Múltipla (Múltipla)',
    'escala': 'Escala',
    'texto_curto': 'Texto Curto',
    'texto_longo': 'Texto Longo'
  };
  return labels[tipo] || tipo;
}

function getTipoBadgeClass(tipo: string): string {
  const classes: Record<string, string> = {
    'sim_nao': 'badge-success',
    'multipla_escolha_unica': 'badge-info',
    'multipla_escolha_multipla': 'badge-info',
    'escala': 'badge-warning',
    'texto_curto': 'badge-danger',
    'texto_longo': 'badge-danger'
  };
  return classes[tipo] || 'badge-info';
}
