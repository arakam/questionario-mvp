import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Sistema de{' '}
              <span className="text-gradient">Questionários</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Crie, gerencie e analise questionários de forma simples e eficiente. 
              Interface moderna e responsiva para todas as suas necessidades.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/admin" className="btn-primary text-lg px-8 py-4">
              🚀 Acessar Admin
            </Link>
            <Link href="/q/exemplo" className="btn-secondary text-lg px-8 py-4">
              📝 Ver Exemplo
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Funcionalidades Principais
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Tudo que você precisa para criar questionários profissionais
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card-hover text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-blue to-accent-blue rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                <span className="text-2xl text-white">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Gestão de Categorias
              </h3>
              <p className="text-gray-600">
                Organize suas perguntas em categorias para melhor estruturação e análise.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card-hover text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-orange to-accent-orange rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                <span className="text-2xl text-white">❓</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Sistema de Perguntas
              </h3>
              <p className="text-gray-600">
                Crie perguntas personalizadas com pesos e status ativo/inativo.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card-hover text-center group">
              <div className="w-16 h-16 bg-gradient-to-br from-primary-blue to-primary-orange rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-200">
                <span className="text-2xl text-white">📋</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Questionários Dinâmicos
              </h3>
              <p className="text-gray-600">
                Monte questionários personalizados selecionando perguntas específicas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="card gradient-bg text-white">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pronto para começar?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Acesse o painel administrativo e comece a criar seus questionários hoje mesmo.
            </p>
            <Link href="/admin" className="btn-orange text-lg px-8 py-4 bg-white text-primary-orange hover:bg-gray-100">
              🚀 Começar Agora
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
