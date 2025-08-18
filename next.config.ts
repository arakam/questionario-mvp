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
          // Adiciona header para forçar HTTPS em produção
          ...(process.env.NODE_ENV === 'production' ? [{
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          }] : []),
        ],
      },
    ];
  },
  // Configurações para resolver warnings do Supabase
  webpack: (config: any, { isServer }: { isServer: any }) => {
    // Suprime o warning do Supabase Realtime
    config.ignoreWarnings = [
      {
        module: /@supabase\/realtime-js/,
        message: /Critical dependency: the request of a dependency is an expression/,
      },
    ];
    
    // Configurações para resolver problemas do Edge Runtime
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
  // Configurações para produção
  ...(process.env.NODE_ENV === 'production' && {
    // Força o uso de HTTPS em produção
    assetPrefix: process.env.NEXT_PUBLIC_SITE_URL,
    // Configurações de host
    hostname: process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname : undefined,
  }),
};

module.exports = nextConfig;
