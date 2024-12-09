import { useState, useEffect } from 'react';
import { Token } from '@/entities/Wallet';

interface PoolDataCache {
  [key: string]: {
    data: any;
    timestamp: number;
  }
}

interface UsePoolDataResult {
  data: any;
  isLoading: boolean;
  error: string | null;
}

// Кеш для хранения данных пулов
const poolDataCache: PoolDataCache = {};

// Время жизни кеша в миллисекундах (1 минута)
const CACHE_TTL = 60 * 5000;

export const usePoolData = (token: Token): UsePoolDataResult => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchPoolData = async () => {
      if (!token.contract) {
        setIsLoading(false);
        return;
      }

      const cacheKey = `${token.network}_${token.contract}`;
      const now = Date.now();

      // Проверяем кеш
      const cachedData = poolDataCache[cacheKey];
      if (cachedData && (now - cachedData.timestamp) < CACHE_TTL) {
        setData(cachedData.data);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const network = token.network?.toLowerCase() || 'eth';
        const response = await fetch(
          `https://api.geckoterminal.com/api/v2/networks/${network}/pools/${token.contract}`
        );

        if (!response.ok) {
          throw new Error('Failed to fetch pool data');
        }

        const jsonData = await response.json();

        // Обновляем кеш
        poolDataCache[cacheKey] = {
          data: jsonData.data,
          timestamp: now
        };

        if (isMounted) {
          setData(jsonData.data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load pool data');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Запускаем обновление данных каждую минуту
    fetchPoolData();
    const interval = setInterval(fetchPoolData, CACHE_TTL);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [token.contract, token.network]);

  return { data, isLoading, error };
};