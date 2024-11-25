'use client';
import dynamic from 'next/dynamic';
import { LoadingWindow } from '@/widgets/LoadingWindow';
import { useEffect } from 'react';


const WalletPageContent = dynamic(
  () => import('./WalletPageContent'), 
  {
    loading: () => null,
    ssr: false
  }
);

export const WalletPage = () => {
  useEffect(() => {
    const root = document.getElementById('wallet-page-root');
    if (root) {
      setTimeout(() => {
        root.classList.add('initialized');
        const loader = document.getElementById('initial-loader');
        if (loader) {
          loader.style.opacity = '0';
          setTimeout(() => {
            loader.remove();
          }, 300);
        }
      }, 100);
    }
  }, []);

  return (
    <>
      <div id="initial-loader">
        <LoadingWindow />
      </div>
      <div id="wallet-page-root">
        <WalletPageContent />
      </div>
    </>
  );
};