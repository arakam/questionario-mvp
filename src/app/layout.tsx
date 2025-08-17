import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Inquiro',
  description: 'Sistema de questionários moderno e responsivo - Inquiro',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-orange-50">
        <div className="min-h-screen">
          {/* Header */}
          <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <h1 className="text-2xl font-bold text-gradient">
                      📊 Inquiro
                    </h1>
                  </div>
                </div>
                <nav className="hidden md:flex space-x-8">
                  <a href="/" className="nav-link">
                    Início
                  </a>
                  <a href="/admin" className="nav-link">
                    Admin
                  </a>
                </nav>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-gray-200 mt-auto">
            <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
              <div className="text-center text-gray-600">
                <p>&copy; 2024 Inquiro. Todos os direitos reservados.</p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
