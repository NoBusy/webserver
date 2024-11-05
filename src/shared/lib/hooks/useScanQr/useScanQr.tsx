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
  const scanQr = useCallback(() => {
    return new Promise<string | null>(async (resolve) => {
      try {
        const webApp = await getWebApp();
        
        webApp?.showScanQrPopup({
          text: "Scan QR code to get address"
        }, (result: string) => {
          console.log('QR scan result:', result);
          resolve(result);
          return true; // закрываем попап после успешного сканирования
        });
        
      } catch (error) {
        console.error('QR scan error:', error);
        resolve(null);
      }
    });
  }, []);

  return { scanQr };
};