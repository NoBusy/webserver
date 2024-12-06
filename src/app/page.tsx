'use client';
import WalletPage from '@/fsdpages/WalletPage/ui/WalletPage/WalletPage';
import { useWalletPageLogic } from '@/fsdpages/WalletPage/lib/hooks/useWalletPageLogic';
import { Suspense } from 'react';

export default function NextJsPage() {
  const { state } = useWalletPageLogic();
  
  if (!state) return null;
  
  return (
    <Suspense fallback={null}>
      <WalletPage state={state} />
    </Suspense>
  );
}