/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // não falha o build em produção por erros de lint
    ignoreDuringBuilds: true,
  },
  experimental: {
    // mantenha seus outros flags experimentais aqui se tiver
  },
  // Configurações para produção
  trailingSlash: false,
  // Garante que URLs sejam tratadas corretamente
  async redirects() {
    return [];
  },
  // Configuração de headers para segurança
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
