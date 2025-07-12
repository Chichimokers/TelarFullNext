import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Catálogo de Telas - Tu Tienda de Textiles',
  description: 'Catálogo completo de telas de alta calidad. Encuentra algodón, seda, lino y más. Precios por metro en CUP.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>{children}</body>
    </html>
  );
}