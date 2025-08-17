import { createSupabaseServer } from './supabaseServer';

// Força o uso do Node.js runtime para evitar problemas com Edge Runtime
export const runtime = 'nodejs';

export async function getSessionAndAdmin() {
  try {
    const supabase = await createSupabaseServer();
    
    // Verifica se o usuário está autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('Erro ao obter usuário:', userError.message);
      return { user: null, isAdmin: false };
    }
    
    if (!user) {
      console.log('Nenhum usuário autenticado');
      return { user: null, isAdmin: false };
    }

    console.log('Usuário autenticado:', user.email);

    // Verifica se é admin
    const { data: rows, error: adminError } = await supabase
      .from('admins')
      .select('id')
      .eq('email', user.email!)
      .limit(1);

    if (adminError) {
      console.error('Erro ao verificar admin:', adminError.message);
      return { user, isAdmin: false };
    }

    const isAdmin = !!rows?.length;
    console.log('Verificação de admin:', { email: user.email, isAdmin, adminCount: rows?.length || 0 });

    return { user, isAdmin };
  } catch (error) {
    console.error('Erro em getSessionAndAdmin:', error);
    return { user: null, isAdmin: false };
  }
}
