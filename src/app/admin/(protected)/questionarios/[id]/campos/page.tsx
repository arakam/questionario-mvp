import { createSupabaseServer } from '@/lib/supabaseServer';
import { getSessionAndAdmin } from '@/lib/isAdmin';
import { type CampoConfiguravel } from '@/components/ConfiguracaoCampos';
import EditarCamposQuestionarioClient from './EditarCamposQuestionarioClient';

// Força o uso do Node.js runtime para evitar problemas com Edge Runtime
export const runtime = 'nodejs';

export const dynamic = 'force-dynamic';

type Questionario = {
  id: string;
  nome: string;
  campos_configuraveis?: CampoConfiguravel[];
};

export default async function EditarCamposQuestionario({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { isAdmin } = await getSessionAndAdmin();
  if (!isAdmin) return <div className="p-6 text-red-600">Acesso negado.</div>;

  const supabase = await createSupabaseServer();

  const { data: questionario, error } = await supabase
    .from('questionarios')
    .select('id, nome, campos_configuraveis')
    .eq('id', id)
    .single<Questionario>();

  if (error) {
    return <div className="p-6 text-red-600">Erro ao carregar questionário: {error.message}</div>;
  }

  if (!questionario) {
    return <div className="p-6">Questionário não encontrado.</div>;
  }

  return (
    <EditarCamposQuestionarioClient
      questionarioId={questionario.id}
      questionarioNome={questionario.nome}
      camposIniciais={questionario.campos_configuraveis}
    />
  );
}
