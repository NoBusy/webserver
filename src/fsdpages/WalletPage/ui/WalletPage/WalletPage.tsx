'use client';
import dynamic from 'next/dynamic';

const WalletPageContent = dynamic(
  () => import('./WalletPageContent'),
  { ssr: false }
);

const WalletPage = () => <WalletPageContent />;

export default WalletPage;