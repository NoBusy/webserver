import { useState, useEffect } from 'react';
import { Network, Token } from '@/entities/Wallet';

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

const NETWORK_MAPPING: Record<string, string> = {
    [Network.ETH]: 'ethereum',
    [Network.BSC]: 'bsc',
    [Network.SOL]: 'solana',
    // TON пока не поддерживается в GeckoTerminal
  };
  
  export const usePoolData = (token: Token): UsePoolDataResult => {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
      let isMounted = true;
  
      const fetchPoolData = async () => {
        if (!token.contract || !token.network) {
          setIsLoading(false);
          return;
        }
  
        // Проверяем, поддерживается ли сеть
        const network = NETWORK_MAPPING[token.network];
        if (!network) {
          setError('Network not supported');
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
  
          console.log('Fetching data for:', {
            network,
            contract: token.contract,
            url: `https://api.geckoterminal.com/api/v2/networks/${network}/pools/${token.contract}`
          });
          
          const response = await fetch(
            `https://api.geckoterminal.com/api/v2/networks/${network}/pools/${token.contract}`,
            {
              headers: {
                'Accept': 'application/json'
              }
            }
          );
  
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
  
          const jsonData = await response.json();
          console.log('API Response:', jsonData);
  
          if (!jsonData.data) {
            throw new Error('No data available for this pool');
          }
  
          // Обновляем кеш
          poolDataCache[cacheKey] = {
            data: jsonData.data,
            timestamp: now
          };
  
          if (isMounted) {
            setData(jsonData.data);
          }
        } catch (err) {
          console.error('API Error:', err);
          if (isMounted) {
            setError(err instanceof Error ? err.message : 'Failed to load pool data');
          }
        } finally {
          if (isMounted) {
            setIsLoading(false);
          }
        }
      };
  
      fetchPoolData();
      const interval = setInterval(fetchPoolData, CACHE_TTL);
  
      return () => {
        isMounted = false;
        clearInterval(interval);
      };
    }, [token.contract, token.network]);
  
    return { data, isLoading, error };
  };