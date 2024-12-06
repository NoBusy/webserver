'use client';
import { useWalletPageLogic } from '@/fsdpages/WalletPage/lib/hooks/useWalletPageLogic';
import dynamic from 'next/dynamic';

const InitializedApp = dynamic(() => import('@/fsdpages/WalletPage/ui/WalletPage/WalletPage'), {
  ssr: false,
  loading: () => null // Важно - не показываем ничего во время загрузки
});

export default function NextJsPage() {
  const { state } = useWalletPageLogic();
  
  // Не рендерим ничего, пока не получим состояние
  if (!state) return null;
  
  return <InitializedApp />;
}