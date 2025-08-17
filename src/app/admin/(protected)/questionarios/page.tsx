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
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📋 Gerenciar Questionários
          </h1>
          <p className="text-gray-600">
            Crie e gerencie questionários personalizados para sua audiência
          </p>
        </div>
        
        <Link href="/admin/questionarios/novo" className="btn-primary">
          ➕ Novo Questionário
        </Link>
      </div>

      {/* Stats Card */}
      <div className="card text-center">
        <div className="text-3xl font-bold text-primary-blue mb-2">
          {qs?.length || 0}
        </div>
        <div className="text-gray-600">Total de Questionários</div>
      </div>

      {/* Questionários Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {(qs ?? []).map((q: any) => (
          <div key={q.id} className="card-hover group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-blue transition-colors duration-200">
                  {q.nome}
                </h3>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">🔗 Slug:</span>
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                      {q.slug}
                    </code>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">🌐 Link público:</span>
                    <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                      /q/{q.slug}
                    </code>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">📅 Criado:</span>
                    <span className="text-xs">
                      {new Date(q.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="ml-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-blue to-accent-blue rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <span className="text-white text-lg">📊</span>
                </div>
              </div>
            </div>

            {/* Share Buttons */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-500">Compartilhar:</span>
                  <ShareButtons slug={q.slug} nome={q.nome} />
                </div>
                
                <Link
                  href={`/admin/questionarios/${q.id}`}
                  className="btn-secondary text-sm px-3 py-2 group-hover:bg-primary-blue group-hover:text-white transition-all duration-200"
                >
                  ✏️ Editar
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {(qs ?? []).length === 0 && (
        <div className="card text-center py-12">
          <div className="text-gray-500">
            <div className="text-4xl mb-2">📭</div>
            <div className="text-lg font-medium mb-1">Nenhum questionário encontrado</div>
            <div className="text-sm mb-4">
              Comece criando seu primeiro questionário personalizado
            </div>
            <Link href="/admin/questionarios/novo" className="btn-primary">
              🚀 Criar Primeiro Questionário
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
