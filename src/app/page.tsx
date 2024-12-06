'use client';
import WalletPage from '@/fsdpages/WalletPage/ui/WalletPage/WalletPage';
import { useWalletPageLogic } from '@/fsdpages/WalletPage/lib/hooks/useWalletPageLogic';
import { LoadingWindow } from '@/widgets/LoadingWindow';
import { useEffect, useState } from 'react';

export default function NextJsPage() {
  const { state } = useWalletPageLogic();
  const [shouldRender, setShouldRender] = useState(false);
  
  useEffect(() => {
    if (state) {
      // Используем RAF для синхронизации с браузерным рендерингом
      requestAnimationFrame(() => {
        setShouldRender(true);
      });
    }
  }, [state]);

  // Показываем loading пока state не готов
  if (!shouldRender) {
    return <LoadingWindow />;
  }
  
  return <WalletPage state={state} />;
}