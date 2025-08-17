import Link from 'next/link';
import { getSessionAndAdmin } from '@/lib/isAdmin';
import SessionChecker from '@/components/SessionChecker';

// Força o uso do Node.js runtime para evitar problemas com Edge Runtime
export const runtime = 'nodejs';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  console.log('🔍 Verificando layout admin...');
  
  const { isAdmin, user } = await getSessionAndAdmin();
  
  console.log('📊 Resultado da verificação:', { 
    hasUser: !!user, 
    userEmail: user?.email, 
    isAdmin 
  });
  
  if (!isAdmin || !user) {
    console.log('❌ Acesso negado - redirecionando para login');
    // Redireciona para login se não for admin
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">❌ Acesso Negado</div>
          <p className="text-gray-600 mb-4">Você não tem permissão para acessar esta área.</p>
          <a 
            href="/admin/login" 
            className="btn-primary"
          >
            🔑 Fazer Login
          </a>
        </div>
      </div>
    );
  }
  
  console.log('✅ Acesso permitido - renderizando layout admin');

  return (
    <div className="min-h-screen bg-gray-50">
      <SessionChecker />
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/admin" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-blue to-primary-orange rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg font-bold">A</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">Inquiro Admin</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="nav-link">
                ← Voltar ao Site
              </Link>
              <Link href="/admin/logout" className="btn-secondary" prefetch={false}>
                Sair
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="sidebar w-64 min-h-screen hidden lg:block">
          <nav className="p-4 space-y-2">
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider px-4 mb-3">
                Gerenciamento
              </h2>
            </div>
            
            <Link href="/admin" className="sidebar-item" prefetch={false}>
              <span className="mr-3">📊</span>
              Dashboard
            </Link>
            
            <Link href="/admin/categorias" className="sidebar-item" prefetch={false}>
              <span className="mr-3">🏷️</span>
              Categorias
            </Link>
            
            <Link href="/admin/perguntas" className="sidebar-item" prefetch={false}>
              <span className="mr-3">❓</span>
              Perguntas
            </Link>
            
            <Link href="/admin/questionarios" className="sidebar-item" prefetch={false}>
              <span className="mr-3">📋</span>
              Questionários
            </Link>
            
            <Link href="/admin/respostas" className="sidebar-item" prefetch={false}>
              <span className="mr-3">📈</span>
              Respostas
            </Link>
          </nav>
        </aside>

        {/* Mobile Sidebar Toggle */}
        <div className="lg:hidden fixed top-20 left-4 z-40">
          <button className="p-2 bg-white rounded-lg shadow-md border border-gray-200">
            <span className="text-gray-600">☰</span>
          </button>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
