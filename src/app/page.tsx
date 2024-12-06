'use client';
import { useWalletPageLogic } from '@/fsdpages/WalletPage/lib/hooks/useWalletPageLogic';
import dynamic from 'next/dynamic';

const InitializedApp = dynamic(
  () => import('@/fsdpages/WalletPage/ui/WalletPage/WalletPage'), 
  {
    loading: () => null
  }
);

export default function NextJsPage() {
  const { state } = useWalletPageLogic();
  
  if (!state) return null;

  return <InitializedApp state={state} />; // Передаем состояние
}