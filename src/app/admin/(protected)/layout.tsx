import Link from 'next/link';
import { getSessionAndAdmin } from '@/lib/isAdmin';

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin } = await getSessionAndAdmin();
  if (!isAdmin) return <div className="p-6 text-red-600">Acesso negado.</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/admin" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-blue to-primary-orange rounded-lg flex items-center justify-center">
                  <span className="text-white text-lg font-bold">A</span>
                </div>
                <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/" className="nav-link">
                ← Voltar ao Site
              </Link>
              <Link href="/admin/logout" className="btn-secondary">
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
            
            <Link href="/admin" className="sidebar-item">
              <span className="mr-3">📊</span>
              Dashboard
            </Link>
            
            <Link href="/admin/categorias" className="sidebar-item">
              <span className="mr-3">🏷️</span>
              Categorias
            </Link>
            
            <Link href="/admin/perguntas" className="sidebar-item">
              <span className="mr-3">❓</span>
              Perguntas
            </Link>
            
            <Link href="/admin/questionarios" className="sidebar-item">
              <span className="mr-3">📋</span>
              Questionários
            </Link>
            
            <Link href="/admin/respostas" className="sidebar-item">
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
