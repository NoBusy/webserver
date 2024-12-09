import { useState, useEffect } from 'react';
import { Token, Network } from '@/entities/Wallet';

interface PoolDataCache {
  [key: string]: {
    data: any;
    timestamp: number;
  }
}

interface PoolSearchCache {
  [key: string]: {
    poolId: string;
    timestamp: number;
  }
}

interface UsePoolDataResult {
  data: any;
  isLoading: boolean;
  error: string | null;
}

const NETWORK_MAPPING: Record<string, string> = {
  [Network.ETH]: 'ethereum',
  [Network.BSC]: 'bsc',
  [Network.SOL]: 'solana',
};

// Кеши для данных пула и результатов поиска
const poolDataCache: PoolDataCache = {};
const poolSearchCache: PoolSearchCache = {};

// TTL кеша (1 час для поиска пула, 1 минута для данных)
const SEARCH_CACHE_TTL = 60 * 60 * 1000;
const DATA_CACHE_TTL = 60 * 1000;

export const usePoolData = (token: Token): UsePoolDataResult => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const getPoolAddress = async () => {
      const cacheKey = `${token.network}_${token.symbol}`;
      const now = Date.now();

      // Проверяем кеш поиска
      const cachedSearch = poolSearchCache[cacheKey];
      if (cachedSearch && (now - cachedSearch.timestamp) < SEARCH_CACHE_TTL) {
        return cachedSearch.poolId;
      }

      try {
        const network = NETWORK_MAPPING[token.network];
        if (!network) return null;

        const response = await fetch(
          `https://api.geckoterminal.com/api/v2/search?query=${token.symbol}&network=${network}`,
          {
            headers: {
              'Accept': 'application/json'
            }
          }
        );

        if (!response.ok) throw new Error('Search failed');

        const searchData = await response.json();
        console.log('Search results:', searchData);

        // Ищем пул с наибольшим объемом или первый доступный
        const pool = searchData.data?.find((item: any) => 
          item.type === 'pool' && 
          item.attributes.name.toLowerCase().includes(token.symbol.toLowerCase())
        );

        if (!pool) return null;

        // Сохраняем в кеш
        poolSearchCache[cacheKey] = {
          poolId: pool.id,
          timestamp: now
        };

        return pool.id;
      } catch (err) {
        console.error('Pool search error:', err);
        return null;
      }
    };

    const fetchPoolData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Получаем адрес пула
        const poolId = await getPoolAddress();
        if (!poolId) {
          setError('Pool not found');
          return;
        }

        const network = NETWORK_MAPPING[token.network];
        if (!network) {
          setError('Network not supported');
          return;
        }

        // Проверяем кеш данных
        const cacheKey = poolId;
        const now = Date.now();
        const cachedData = poolDataCache[cacheKey];
        if (cachedData && (now - cachedData.timestamp) < DATA_CACHE_TTL) {
          setData(cachedData.data);
          return;
        }

        const response = await fetch(
          `https://api.geckoterminal.com/api/v2/networks/${network}/pools/${poolId}`,
          {
            headers: {
              'Accept': 'application/json'
            }
          }
        );

        if (!response.ok) throw new Error('Failed to fetch pool data');

        const jsonData = await response.json();
        console.log('Pool data:', jsonData);

        if (!jsonData.data) throw new Error('No data available');

        // Обновляем кеш
        poolDataCache[cacheKey] = {
          data: jsonData.data,
          timestamp: now
        };

        if (isMounted) {
          setData(jsonData.data);
        }
      } catch (err) {
        console.error('Error:', err);
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
    const interval = setInterval(fetchPoolData, DATA_CACHE_TTL);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [token.network, token.symbol]);

  return { data, isLoading, error };
};