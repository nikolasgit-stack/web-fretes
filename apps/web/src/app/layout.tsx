import type { Metadata } from 'next';
import { Suspense } from 'react';
import { Space_Grotesk, Source_Sans_3 } from 'next/font/google';
import { RefineProvider } from '../providers/refine-provider';
import './globals.css';

const headingFont = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-heading',
});

const bodyFont = Source_Sans_3({
  subsets: ['latin'],
  variable: '--font-body',
});

export const metadata: Metadata = {
  title: 'Web Fretes | Painel Administrativo',
  description: 'Painel administrativo SaaS do Web Fretes para operacao multi-tenant.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <html
      className={`${headingFont.variable} ${bodyFont.variable}`}
      lang="pt-BR"
    >
      <body>
        <Suspense fallback={<div />}>
          <RefineProvider>{children}</RefineProvider>
        </Suspense>
      </body>
    </html>
  );
}
