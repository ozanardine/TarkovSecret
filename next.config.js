/** @type {import('next').NextConfig} */
const nextConfig = {
  exclude: ['node_modules', '.next'],

  // Configurações experimentais
  experimental: {
    // optimizePackageImports: [
    //   '@heroicons/react',
    //   'react-hot-toast',
    //   'date-fns',
    // ],
  },

  // Configuração do TypeScript
  typescript: {
    ignoreBuildErrors: false,
  },

  // Configuração do ESLint
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
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 dias
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; font-src 'self';",
  },

  // Configuração do Webpack para resolver problemas de compatibilidade
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    return config;
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

  // Configurações de Saída e Performance
  output: 'standalone',
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  trailingSlash: false,
  reactStrictMode: true,
  swcMinify: true,

  // Opções do compilador
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

module.exports = nextConfig;