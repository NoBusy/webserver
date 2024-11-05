import { useCallback, useEffect } from 'react';
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
        
        // Подписываемся на событие получения QR кода
        const handleQrReceived = (event: any) => {
          console.log('QR data received:', event);
          webApp.removeEventListener('qrTextReceived', handleQrReceived);
          resolve(event.data);
        };

        // Добавляем слушатель события
        webApp.addEventListener('qrTextReceived', handleQrReceived);
        
        // Показываем попап сканера
        webApp.showScanQrPopup({
          text: "Scan QR code to get address"
        });

      } catch (error) {
        console.error('QR scan error:', error);
        resolve(null);
      }
    });
  }, []);

  // Очищаем слушатель при размонтировании компонента
  useEffect(() => {
    return () => {
      getWebApp().then(webApp => {
        webApp?.removeEventListener('qrTextReceived', () => {});
      });
    };
  }, []);

  return { scanQr };
};