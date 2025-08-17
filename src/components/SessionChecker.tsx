'use client';

// Força o uso do Node.js runtime para evitar problemas com Edge Runtime
export const runtime = 'nodejs';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';

export default function SessionChecker() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
             if (!session || error) {
         // Se não há sessão, redireciona para login
         // Usa replace para evitar problemas de histórico
         router.replace('/admin/login?error=Sessão expirada');
         return;
       }

      // Verifica se o usuário é admin
      try {
        const { data: adminData, error: adminError } = await supabase
          .from('admins')
          .select('id')
          .eq('email', session.user.email)
          .limit(1);

                 if (adminError || !adminData || adminData.length === 0) {
           // Se não é admin, redireciona para login
           router.replace('/admin/login?error=Acesso negado');
           return;
         }
             } catch (error) {
         // Se há erro na verificação, redireciona para login
         router.replace('/admin/login?error=Erro de verificação');
         return;
       }
    };

    // Verifica a sessão imediatamente
    checkSession();

    // Configura listener para mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
             async (event, session) => {
         if (event === 'SIGNED_OUT' || !session) {
           router.replace('/admin/login?error=Sessão expirada');
         }
       }
    );

    // Cleanup do listener
    return () => subscription.unsubscribe();
  }, [router, supabase]);

  return null; // Este componente não renderiza nada
}
