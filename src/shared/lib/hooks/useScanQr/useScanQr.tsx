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

// Hook для сканирования QR
export const useScanQrCode = () => {
  const scanQr = useCallback(async () => {
    try {
      const webApp = await getWebApp();
      const result = await webApp?.showScanQrPopup({
        text: "Scan QR code to get address"
      });
      return result;
    } catch (error) {
      console.error('QR scan error:', error);
      return null;
    }
  }, []);

  return { scanQr };
};
