import { useCallback, useEffect } from 'react';
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
        
        // Обработчик получения QR кода
        const handleQrReceived = (event: any) => {
          console.log('QR data received:', event);
          cleanup();
          resolve(event.data);
        };

        // Обработчик закрытия попапа
        const handlePopupClosed = () => {
          console.log('QR popup closed');
          cleanup();
          resolve(null);
        };

        // Функция очистки слушателей
        const cleanup = () => {
          webApp.removeEventListener('qrTextReceived', handleQrReceived);
          webApp.removeEventListener('scanQrPopupClosed', handlePopupClosed);
        };

        // Добавляем слушатели
        webApp.addEventListener('qrTextReceived', handleQrReceived);
        webApp.addEventListener('scanQrPopupClosed', handlePopupClosed);
        
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

  // Очищаем слушатели при размонтировании
  useEffect(() => {
    return () => {
      getWebApp().then(webApp => {
        webApp?.removeEventListener('qrTextReceived', () => {});
        webApp?.removeEventListener('scanQrPopupClosed', () => {});
      });
    };
  }, []);

  return { scanQr };
};