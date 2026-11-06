import type { Locale } from './i18n/locale';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { canonicalUrl, SITE_URL } from './seo';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const baseMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  referrer: 'strict-origin-when-cross-origin',
  applicationName: 'Affordia Health',
  title: 'Affordia Health | Affordable Healthcare Solutions Worldwide.',
  description: 'Access high-quality healthcare in China with professional coordination, flexible services and reliable local support.',
  alternates: { canonical: canonicalUrl('/') },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  icons: {
    icon: [{ url: '/favicon.png?v=affordia-1', type: 'image/png', sizes: '512x512' }],
    shortcut: '/favicon.png?v=affordia-1',
    apple: '/favicon.png?v=affordia-1',
  },
  openGraph: {
    title: 'Affordia Health',
    description: 'Affordable Healthcare Solutions Worldwide.',
    url: canonicalUrl('/'),
    siteName: 'Affordia Health',
    locale: 'en_US',
    type: 'website',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Affordia Health',
    description: 'Affordable Healthcare Solutions Worldwide.',
    images: ['/og.png'],
  },
};

export function DocumentLayout({
  children, locale,
}: Readonly<{
  children: React.ReactNode; locale: Locale;
}>) {
  return (
    <html lang={locale}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        {/* Cloudflare Web Analytics */}
        <script
          async
          type="module"
          src="https://static.cloudflareinsights.com/beacon.min.js"
          data-cf-beacon='{"token":"f0205897117b464ca80e1c8dda859654"}'
        ></script>
        {/* End Cloudflare Web Analytics */}
      </body>
    </html>
  );
}
