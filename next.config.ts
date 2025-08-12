/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // não falha o build em produção por erros de lint
    ignoreDuringBuilds: true,
  },
  experimental: {
    // mantenha seus outros flags experimentais aqui se tiver
  },
};

module.exports = nextConfig;
