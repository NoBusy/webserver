'use client';
import dynamic from 'next/dynamic';
import { LoadingWindow } from '@/widgets/LoadingWindow';

// Добавляем больше опций для надежности
const WalletPageContent = dynamic(
  () => import('./WalletPageContent'),
  {
    loading: () => null,
    ssr: false,
    suspense: false
  }
);

export const WalletPage = () => {
  return <WalletPageContent />;
};