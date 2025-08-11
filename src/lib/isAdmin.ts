import { createSupabaseServer } from './supabaseServer';

export async function getSessionAndAdmin() {
  const supabase = await createSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, isAdmin: false };

  const { data: rows, error } = await supabase
    .from('admins')
    .select('id')
    .eq('email', user.email!)
    .limit(1);

  return { user, isAdmin: !!rows?.length && !error };
}
