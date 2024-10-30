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

export const useHapticFeedback = () => {
  const impact = useCallback(async (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => {
    const webApp = await getWebApp();
    webApp?.HapticFeedback?.impactOccurred(style);
  }, []);

  const notify = useCallback(async (type: 'error' | 'success' | 'warning') => {
    const webApp = await getWebApp();
    webApp?.HapticFeedback?.notificationOccurred(type);
  }, []);

  const select = useCallback(async () => {
    const webApp = await getWebApp();
    webApp?.HapticFeedback?.selectionChanged();
  }, []);

  return { impact, notify, select };
};