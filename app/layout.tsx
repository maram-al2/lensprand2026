import './globals.css';
import type { Metadata } from 'next';
import { Cairo } from 'next/font/google';
import { Providers } from './providers';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Lens Brand |  علامة عُمانية للنظارات',
  description: 'متجر إلكتروني  للنظارات  - أناقة ورقي في كل إطلالة',
  openGraph: {
    title: 'Lens Brand | علامة عُمانية للنظارات',
    description: 'متجر إلكتروني فاخر للنظارات الشمسية',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body className={`${cairo.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
