'use client';
import WalletPage from '@/fsdpages/WalletPage/ui/WalletPage/WalletPage';
import { useWalletPageLogic } from '@/fsdpages/WalletPage/lib/hooks/useWalletPageLogic';

export default function NextJsPage() {
  const { state } = useWalletPageLogic();
  
  if (!state) return null;
  
  return <WalletPage state={state} />;
}