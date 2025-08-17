import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-br from-primary-blue to-primary-orange rounded-full flex items-center justify-center mb-6">
            <span className="text-2xl text-white font-bold">🔐</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Acesso Administrativo
          </h2>
          <p className="text-gray-600">
            Faça login para acessar o painel de controle
          </p>
        </div>

        {/* Login Form */}
        <div className="card shadow-glow">
          <form action="/admin/login/action" method="post" className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                E-mail
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input-field"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input-field"
                placeholder="••••••••"
              />
            </div>

            <div>
              <button
                type="submit"
                className="btn-primary w-full py-3 text-lg font-semibold"
              >
                🔑 Entrar no Sistema
              </button>
            </div>
          </form>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link href="/" className="nav-link text-sm">
              ← Voltar ao site principal
            </Link>
          </div>
        </div>

        {/* Info Card */}
        <div className="card bg-gradient-to-r from-blue-50 to-orange-50 border-blue-200">
          <div className="text-center">
            <div className="text-2xl mb-2">💡</div>
            <h3 className="font-semibold text-gray-900 mb-2">
              Primeira vez aqui?
            </h3>
            <p className="text-sm text-gray-600">
              Entre em contato com o administrador para obter suas credenciais de acesso.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
