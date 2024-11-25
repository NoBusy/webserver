'use client';
import dynamic from 'next/dynamic';
import { LoadingWindow } from '@/widgets/LoadingWindow';

const WalletPageContent = dynamic(
  () => import('./WalletPageContent').then(mod => mod.default),
  { 
    loading: () => <LoadingWindow />,
    ssr: false 
  }
);

const WalletPage = () => <WalletPageContent />;

export default WalletPage;