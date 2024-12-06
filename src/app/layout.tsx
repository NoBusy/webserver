import { StoreProvider } from '@/shared/lib/providers/StoreProvider';
import { NextFont } from 'next/dist/compiled/@next/font';
import { Toaster } from 'react-hot-toast';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import '@/shared/styles/index.scss';
import Script from 'next/script';
import Head from 'next/head';
import React from 'react';
import localFont from 'next/font/local'

const clashDisplay = localFont({
  src: [
    {
      path: '../shared/assets/fonts/ClashDisplay-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../shared/assets/fonts/ClashDisplay-Semibold.woff2',
      weight: '600',
      style: 'normal',
    },
  ],
  display: 'swap',
  preload: true,
  variable: '--font-clash-display' // Для использования как CSS переменной
});

export const metadata: Metadata = {
  title: 'Chain Spy Robot',
  description: 'Store, buy and swap crypto',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en">
    <Head>
      <meta name="viewport"
            content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0" />
    </Head>
    <Script src="https://telegram.org/js/telegram-web-app.js" />
    <body className={clashDisplay.className} id="root">
    <StoreProvider>
      {children}
      <Toaster />
    </StoreProvider>
    </body>
    </html>
  );
}
