'use client';
import dynamic from 'next/dynamic';
import { LoadingWindow } from '@/widgets/LoadingWindow';

// Указываем правильный путь к файлу
const WalletPageContent = dynamic(
  () => import('./WalletPageContent').then(mod => mod.WalletPageContent),
  {
    loading: () => <LoadingWindow />,
    ssr: false
  }
);

export const WalletPage = () => {
  return <WalletPageContent />;
};