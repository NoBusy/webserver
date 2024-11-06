import { useCallback } from 'react';
import { getTgWebAppSdk } from '@/shared/lib/helpers/getTgWebAppSdk';

let webAppInstance: any = null;

const getWebApp = async () => {
  if (!webAppInstance) {
    webAppInstance = await getTgWebAppSdk();
  }
  return webAppInstance;
};

export const useScanQrCode = () => {
  const scanQr = useCallback(() => {
    return new Promise<string | null>(async (resolve) => {
      try {
        const webApp = await getWebApp();
        webApp?.showScanQrPopup({
          text: "Scan QR code to get address"
        }, (result: string) => {
          // Убираем все пробелы из результата
          const cleanResult = result.replace(/\s+/g, '');
          console.log('QR scan result:', cleanResult);
          resolve(cleanResult);
          return true;
        });
      } catch (error) {
        console.error('QR scan error:', error);
        resolve(null);
      }
    });
  }, []);

  return { scanQr };
};