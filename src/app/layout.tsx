import { StoreProvider } from '@/shared/lib/providers/StoreProvider';
import { NextFont } from 'next/dist/compiled/@next/font';
import { Toaster } from 'react-hot-toast';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import '@/shared/styles/index.scss';
import Script from 'next/script';
import Head from 'next/head';
import React from 'react';

const inter: NextFont = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Chain Spy Robot',
  description: 'Store, buy and swap crypto',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0"
        />
        <style dangerouslySetInnerHTML={{
          __html: `
            #app-content {
              display: none !important;
            }
            html.app-ready #app-content {
              display: block !important;
            }
            #initial-app-loader {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              display: flex;
              align-items: center;
              justify-content: center;
              background: var(--bg);
              z-index: 99999;
            }
            html.app-ready #initial-app-loader {
              display: none !important;
            }
            .gradient-spinner {
              width: 40px;
              height: 40px;
              border: 3px solid var(--bg);
              border-top: 3px solid var(--primary);
              border-radius: 50%;
              animation: spin 1s linear infinite;
            }
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `
        }} />
      </head>
      <Script src="https://telegram.org/js/telegram-web-app.js" />
      <body className={inter.className} id="root">
        <div id="initial-app-loader">
          <div className="gradient-spinner"></div>
        </div>
        
        <div id="app-content">
          <StoreProvider>
            {children}
            <Toaster />
          </StoreProvider>
        </div>

        <script dangerouslySetInnerHTML={{
          __html: `
            function initApp() {
              if (window.Telegram?.WebApp) {
                // Увеличим задержку для надежности
                setTimeout(() => {
                  document.documentElement.classList.add('app-ready');
                }, 200);
              } else {
                setTimeout(initApp, 50);
              }
            }
            
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', initApp);
            } else {
              initApp();
            }
          `
        }} />
      </body>
    </html>
  );
}