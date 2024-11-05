

// shared/lib/hooks/useCloudStorage.ts
import { useCallback } from 'react';
import { getTgWebAppSdk } from '../../helpers/getTgWebAppSdk';

let webAppInstance: any = null;

// Функция для получения инстанса WebApp
const getWebApp = async () => {
  if (!webAppInstance) {
    webAppInstance = await getTgWebAppSdk();
  }
  return webAppInstance;
};

export const useCloudStorage = () => {
  const getItem = useCallback(async (key: string) => {
    const webApp = await getWebApp();
    return new Promise((resolve, reject) => {
      webApp.CloudStorage.getItem(key, (error: Error | null, value: string | null) => {
        if (error) reject(error);
        else resolve(value);
      });
    });
  }, []);

  const setItem = useCallback(async (key: string, value: string) => {
    const webApp = await getWebApp();
    return new Promise((resolve, reject) => {
      webApp.CloudStorage.setItem(key, value, (error: Error | null, success: boolean) => {
        if (error) reject(error);
        else resolve(success);
      });
    });
  }, []);

  return { getItem, setItem };
};