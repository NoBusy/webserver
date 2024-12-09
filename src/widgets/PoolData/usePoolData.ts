import { useState, useEffect } from 'react';
import { Token, Network } from '@/entities/Wallet';

interface PoolDataCache {
  [key: string]: {
    data: any;
    timestamp: number;
  }
}

interface PoolAddressCache {
  [key: string]: {
    address: string;
    timestamp: number;
  }
}

const NETWORK_MAPPING: Record<string, string> = {
  [Network.ETH]: 'eth',
  [Network.BSC]: 'bsc',
  [Network.SOL]: 'solana',
};

const poolDataCache: PoolDataCache = {};
const poolAddressCache: PoolAddressCache = {};
const DATA_CACHE_TTL = 60 * 1000;
const ADDRESS_CACHE_TTL = 60 * 60 * 24000;

export const usePoolData = (token: Token) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const findPool = async () => {
      const cacheKey = `${token.network}_${token.symbol}`;
      const now = Date.now();

      console.log('Checking pool cache for:', cacheKey);
      
      // Проверяем кеш адресов
      if (poolAddressCache[cacheKey] && 
          (now - poolAddressCache[cacheKey].timestamp) < ADDRESS_CACHE_TTL) {
        console.log('Found cached pool address:', poolAddressCache[cacheKey].address);
        return poolAddressCache[cacheKey].address;
      }

      try {
        const network = NETWORK_MAPPING[token.network];
        console.log('Searching pool for:', { symbol: token.symbol, network });

        const searchResponse = await fetch(
          `https://api.geckoterminal.com/api/v2/search?query=${token.symbol}&network=${network}`,
          {
            headers: {
              'Accept': 'application/json'
            }
          }
        );

        if (!searchResponse.ok) {
          throw new Error(`Search failed: ${searchResponse.status}`);
        }

        const searchData = await searchResponse.json();
        console.log('Search results:', searchData);

        const pool = searchData.data?.find((item: any) => 
          item.type === 'pool' && 
          item.attributes?.name?.toLowerCase().includes(token.symbol.toLowerCase())
        );

        console.log('Found pool:', pool);

        if (!pool) {
          throw new Error('Pool not found in search results');
        }

        // Кешируем адрес пула
        poolAddressCache[cacheKey] = {
          address: pool.id,
          timestamp: now
        };

        return pool.id;
      } catch (err) {
        console.error('Error finding pool:', err);
        throw err;
      }
    };

    const fetchPoolData = async () => {
      if (!token.contract || !token.network) {
        console.log('Missing token data:', { contract: token.contract, network: token.network });
        setError('Invalid token data');
        setIsLoading(false);
        return;
      }

      try {
        const poolId = await findPool();
        console.log('Retrieved pool ID:', poolId);

        if (!poolId) {
          throw new Error('Failed to get pool ID');
        }

        const cacheKey = poolId;
        const now = Date.now();

        // Проверяем кеш данных
        if (poolDataCache[cacheKey] && 
            (now - poolDataCache[cacheKey].timestamp) < DATA_CACHE_TTL) {
          console.log('Using cached pool data');
          setData(poolDataCache[cacheKey].data);
          return;
        }

        console.log('Fetching fresh data from GeckoTerminal');
        const network = NETWORK_MAPPING[token.network];
        const response = await fetch(
          `https://api.geckoterminal.com/api/v2/networks/${network}/pools/${poolId}`,
          {
            headers: { 'Accept': 'application/json' }
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch pool data: ${response.status}`);
        }

        const jsonData = await response.json();
        console.log('GeckoTerminal data:', jsonData);

        // Кешируем данные
        poolDataCache[cacheKey] = {
          data: jsonData.data,
          timestamp: now
        };

        if (isMounted) {
          setData(jsonData.data);
        }
      } catch (err) {
        console.error('Pool data error:', err);
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
  }, [token.contract, token.network, token.symbol]);

  return { data, isLoading, error };
};