import { useCallback } from 'react';
import { getTgWebAppSdk } from '@/shared/lib/helpers/getTgWebAppSdk';

// Создаем синглтон для WebApp
let webAppInstance: any = null;

// Функция для получения инстанса WebApp
const getWebApp = async () => {
  if (!webAppInstance) {
    webAppInstance = await getTgWebAppSdk();
  }
  return webAppInstance;
};

export const useTelegramLink = () => {
    const openLink = useCallback(async (url: string) => {
      const webApp = await getWebApp();
      webApp?.openTelegramLink?.(url);
    }, []);
  
    return { openLink };
  };