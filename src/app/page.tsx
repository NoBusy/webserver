'use client';
import { useWalletPageLogic } from '@/fsdpages/WalletPage/lib/hooks/useWalletPageLogic';
import { LoadingWindow } from '@/widgets/LoadingWindow';
import dynamic from 'next/dynamic';

const InitializedApp = dynamic(
  () => import('@/fsdpages/WalletPage/ui/WalletPage/WalletPage'), 
  {
    // ssr: false,
    loading: () => <LoadingWindow />
  }
);

export default function NextJsPage() {
  const { state } = useWalletPageLogic();
  
  if (!state) return null;

  return <InitializedApp state={state} />; // Передаем состояние
}