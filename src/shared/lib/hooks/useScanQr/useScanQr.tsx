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

// Функция очистки адреса
const cleanQrAddress = (rawAddress: string): string => {
  // Убираем пробелы
  const cleanInput = rawAddress.trim().replace(/\s+/g, '');
  
  // Проверяем TON адрес
  const tonMatch = cleanInput.match(/(EQ|UQ)[a-zA-Z0-9_-]{46}/);
  if (tonMatch) return tonMatch[0];
  
  // Проверяем ETH/BSC адрес
  const ethMatch = cleanInput.match(/0x[a-fA-F0-9]{40}/);
  if (ethMatch) return ethMatch[0];
  
  // Проверяем SOL адрес
  const solMatch = cleanInput.match(/[a-zA-Z0-9]{32,44}/);
  if (solMatch) return solMatch[0];
  
  // Если ни один формат не подошел, возвращаем исходную строку
  return cleanInput;
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
          console.log('Raw QR scan result:', result);
          const cleanAddress = cleanQrAddress(result);
          console.log('Cleaned QR scan result:', cleanAddress);
          resolve(cleanAddress);
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