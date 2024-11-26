'use client';
import { LoadingWindow } from '@/widgets/LoadingWindow';
import dynamic from 'next/dynamic';

const WalletPageContent = dynamic(
  () => import('./WalletPageContent').then(mod => mod.default),
  { 
    loading: () => <LoadingWindow />,
    ssr: false 
  }
);

const WalletPage = () => <WalletPageContent />;

export default WalletPage;