import { useState, useEffect } from 'react';
import { Token, Network } from '@/entities/Wallet';

interface PoolDataCache {
  [key: string]: {
    data: any;
    timestamp: number;
  }
}

const NETWORK_MAPPING: Record<string, string> = {
  [Network.ETH]: 'eth',
  [Network.BSC]: 'bsc',
  [Network.SOL]: 'solana',
};

const poolDataCache: PoolDataCache = {};
const CACHE_TTL = 60 * 1000; // 1 минута

export const usePoolData = (token: Token) => {
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

      const network = NETWORK_MAPPING[token.network];
      if (!network) {
        setIsLoading(false);
        return;
      }

      const cacheKey = `${network}_${token.contract}`;
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

        const url = `https://pro-api.coingecko.com/api/v3/onchain/networks/${network}/pools/${token.contract}`;
        
        console.log('Fetching data:', { network, contract: token.contract, url });

        const response = await fetch(url, {
          headers: {
            'accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const jsonData = await response.json();
        console.log('API Response:', jsonData);

        if (!jsonData.data?.[0]) {
          throw new Error('No data available for this pool');
        }

        // Обновляем кеш
        poolDataCache[cacheKey] = {
          data: jsonData.data[0],
          timestamp: now
        };

        if (isMounted) {
          setData(jsonData.data[0]);
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