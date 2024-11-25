'use client';
import dynamic from 'next/dynamic';
import { LoadingWindow } from '@/widgets/LoadingWindow';

// Динамически импортируем основной контент
const WalletPageContent = dynamic(
  () => import('./WalletPageContent'),
  {
    loading: () => <LoadingWindow />,
    ssr: false // Отключаем SSR для предотвращения мелькания
  }
);

export const WalletPage = () => {
  return <WalletPageContent />;
};