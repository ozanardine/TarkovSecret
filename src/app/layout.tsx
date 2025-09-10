import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Providers from '@/components/providers/Providers';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: {
    default: 'Secret Tarkov - Sua ferramenta definitiva para Escape from Tarkov',
    template: '%s | Secret Tarkov',
  },
  description: 'Acompanhe preços, gerencie listas de favoritos, receba alertas e domine o mercado de Escape from Tarkov com nossa plataforma completa.',
  keywords: [
    'Escape from Tarkov',
    'Tarkov',
    'EFT',
    'preços',
    'mercado',
    'flea market',
    'itens',
    'armas',
    'equipamentos',
    'trading',
    'profit',
    'lucro',
  ],
  authors: [{ name: 'Secret Tarkov Team' }],
  creator: 'Secret Tarkov',
  publisher: 'Secret Tarkov',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://secret-tarkov.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://secret-tarkov.vercel.app',
    title: 'Secret Tarkov - Sua ferramenta definitiva para Escape from Tarkov',
    description: 'Acompanhe preços, gerencie listas de favoritos, receba alertas e domine o mercado de Escape from Tarkov.',
    siteName: 'Secret Tarkov',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Secret Tarkov - Escape from Tarkov Tools',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Secret Tarkov - Sua ferramenta definitiva para Escape from Tarkov',
    description: 'Acompanhe preços, gerencie listas de favoritos, receba alertas e domine o mercado de Escape from Tarkov.',
    images: ['/og-image.png'],
    creator: '@SecretTarkov',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    // Add other verification codes as needed
  },
  category: 'gaming',
  classification: 'Gaming Tools',
  referrer: 'origin-when-cross-origin',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#d4af37',
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Secret Tarkov',
  },
  applicationName: 'Secret Tarkov',
  generator: 'Next.js',
  abstract: 'Ferramentas profissionais para jogadores de Escape from Tarkov',
  archives: [],
  assets: [],
  bookmarks: [],
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://tarkov.dev" />
        <link rel="preconnect" href="https://tarkov-market.com" />
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        <link rel="preconnect" href="https://googleads.g.doubleclick.net" />
        
        {/* DNS prefetch for performance */}
        <link rel="dns-prefetch" href="https://accounts.google.com" />
        <link rel="dns-prefetch" href="https://supabase.co" />
        
        {/* Security headers */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta httpEquiv="Referrer-Policy" content="strict-origin-when-cross-origin" />
        
        {/* PWA meta tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Secret Tarkov" />
        <meta name="application-name" content="Secret Tarkov" />
        <meta name="msapplication-TileColor" content="#0a0a0a" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Additional SEO meta tags */}
        <meta name="language" content="Portuguese" />
        <meta name="geo.region" content="BR" />
        <meta name="geo.placename" content="Brazil" />
        <meta name="target" content="all" />
        <meta name="audience" content="all" />
        <meta name="coverage" content="Worldwide" />
        <meta name="distribution" content="Global" />
        <meta name="rating" content="General" />
        
        {/* Structured data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'Secret Tarkov',
              description: 'Ferramentas profissionais para jogadores de Escape from Tarkov',
              url: 'https://secret-tarkov.vercel.app',
              applicationCategory: 'GameApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '0',
                priceCurrency: 'BRL',
                availability: 'https://schema.org/InStock',
              },
              author: {
                '@type': 'Organization',
                name: 'Secret Tarkov Team',
              },
              publisher: {
                '@type': 'Organization',
                name: 'Secret Tarkov',
              },
              inLanguage: 'pt-BR',
              isAccessibleForFree: true,
            }),
          }}
        />
      </head>
      <body className={`${inter.className} antialiased`}>
        <Providers>
          {/* Main App Content */}
          <div id="root" className="min-h-screen bg-tarkov-dark">
            {children}
          </div>
        </Providers>
        
        {/* Google AdSense Script - Global */}
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5475619702541266"
          crossOrigin="anonymous"
        />
        
        {/* Analytics scripts */}
        {process.env.NODE_ENV === 'production' && (
          <>
            {/* Google Analytics */}
            {process.env.NEXT_PUBLIC_GA_ID && (
              <>
                <script
                  async
                  src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
                />
                <script
                  dangerouslySetInnerHTML={{
                    __html: `
                      window.dataLayer = window.dataLayer || [];
                      function gtag(){dataLayer.push(arguments);}
                      gtag('js', new Date());
                      gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                        page_title: document.title,
                        page_location: window.location.href,
                      });
                    `,
                  }}
                />
              </>
            )}
            
            {/* Microsoft Clarity */}
            {process.env.NEXT_PUBLIC_CLARITY_ID && (
              <script
                dangerouslySetInnerHTML={{
                  __html: `
                    (function(c,l,a,r,i,t,y){
                        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                    })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_ID}");
                  `,
                }}
              />
            )}
          </>
        )}
      </body>
    </html>
  );
}