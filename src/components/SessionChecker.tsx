'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabaseClient';

export default function SessionChecker() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const isChecking = useRef(false);
  const lastCheck = useRef(0);
  const hasValidSession = useRef(false);

  useEffect(() => {
    const checkSession = async () => {
      // Evita verificações simultâneas
      if (isChecking.current) return;
      
      // Evita verificações muito frequentes (mínimo 10 segundos entre verificações)
      const now = Date.now();
      if (now - lastCheck.current < 10000) return;
      
      isChecking.current = true;
      lastCheck.current = now;

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!session || error) {
          console.log('🔍 SessionChecker: Sessão inválida, redirecionando para login');
          hasValidSession.current = false;
          router.replace('/admin/login?error=Sessão expirada');
          return;
        }

        // Se já temos uma sessão válida, não verifica admin novamente
        if (hasValidSession.current) {
          console.log('✅ SessionChecker: Sessão já validada, pulando verificação de admin');
          return;
        }

        // Verifica se o usuário é admin apenas uma vez
        try {
          const { data: adminData, error: adminError } = await supabase
            .from('admins')
            .select('id')
            .eq('email', session.user.email)
            .limit(1);

          if (adminError || !adminData || adminData.length === 0) {
            console.log('🔍 SessionChecker: Usuário não é admin, redirecionando');
            hasValidSession.current = false;
            router.replace('/admin/login?error=Acesso negado');
            return;
          }
          
          console.log('✅ SessionChecker: Sessão válida e usuário é admin');
          hasValidSession.current = true;
        } catch (error) {
          console.error('❌ SessionChecker: Erro ao verificar admin:', error);
          // Não redireciona por erro de verificação
          // Permite que o usuário continue navegando
        }
      } catch (error) {
        console.error('❌ SessionChecker: Erro ao verificar sessão:', error);
        // Não redireciona por erros de rede/conexão
      } finally {
        isChecking.current = false;
      }
    };

    // Verifica a sessão apenas na primeira carga
    checkSession();

    // Configura listener para mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔍 SessionChecker: Mudança de auth detectada:', event);
        
        if (event === 'SIGNED_OUT' || !session) {
          console.log('🔍 SessionChecker: Usuário deslogado, redirecionando');
          hasValidSession.current = false;
          router.replace('/admin/login?error=Sessão expirada');
        } else if (event === 'SIGNED_IN') {
          console.log('✅ SessionChecker: Usuário logado com sucesso');
          hasValidSession.current = false; // Reset para verificar admin novamente
        }
      }
    );

    // Cleanup do listener
    return () => subscription.unsubscribe();
  }, [router, supabase]);

  // Não verifica a cada mudança de rota
  // Apenas monitora mudanças reais de autenticação

  return null; // Este componente não renderiza nada
}
