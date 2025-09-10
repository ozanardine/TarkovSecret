/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurações do TypeScript e ESLint
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
    dirs: ['src'],
  },

  // Otimização de Imagens
  images: {
    domains: [
      'assets.tarkov.dev',
      'cdn.tarkov.dev',
      'cdn.tarkov-market.app',
      'static.tarkov-market.com',
      'lh3.googleusercontent.com',
      'avatars.githubusercontent.com',
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // Configuração de Cabeçalhos (Headers)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },

  // Configuração de Redirecionamentos (Redirects)
  async redirects() {
    return [
      { source: '/home', destination: '/', permanent: true },
      { source: '/login', destination: '/auth/signin', permanent: true },
      { source: '/register', destination: '/auth/signup', permanent: true },
    ];
  },

  // Configurações de Performance e Padrões
  reactStrictMode: true,
  swcMinify: true,
};

module.exports = nextConfig;