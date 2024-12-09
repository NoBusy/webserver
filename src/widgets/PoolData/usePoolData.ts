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

    const getPoolAddress = async () => {
      const cacheKey = `${token.network}_${token.contract}`;
      const now = Date.now();

      // Проверяем кеш адресов
      if (poolAddressCache[cacheKey] && 
          (now - poolAddressCache[cacheKey].timestamp) < ADDRESS_CACHE_TTL) {
        return poolAddressCache[cacheKey].address;
      }

      try {
        const network = NETWORK_MAPPING[token.network];
        const response = await fetch(
          `https://pro-api.coingecko.com/api/v3/onchain/networks/${network}/pools/${token.contract}`,
          {
            headers: { 'accept': 'application/json' }
          }
        );

        if (!response.ok) throw new Error('Failed to fetch pool address');

        const jsonData = await response.json();
        const poolAddress = jsonData.data?.[0]?.attributes?.address;

        if (!poolAddress) throw new Error('Pool address not found');

        // Кешируем адрес пула
        poolAddressCache[cacheKey] = {
          address: poolAddress,
          timestamp: now
        };

        return poolAddress;
      } catch (err) {
        console.error('Pool address error:', err);
        throw err;
      }
    };

    const fetchPoolData = async () => {
      try {
        const poolAddress = await getPoolAddress();
        if (!poolAddress) {
          throw new Error('Failed to get pool address');
        }

        const cacheKey = poolAddress;
        const now = Date.now();

        // Проверяем кеш данных
        if (poolDataCache[cacheKey] && 
            (now - poolDataCache[cacheKey].timestamp) < DATA_CACHE_TTL) {
          setData(poolDataCache[cacheKey].data);
          return;
        }

        const network = NETWORK_MAPPING[token.network];
        const response = await fetch(
          `https://api.geckoterminal.com/api/v2/networks/${network}/pools/${poolAddress}`,
          {
            headers: { 'Accept': 'application/json' }
          }
        );

        if (!response.ok) throw new Error('Failed to fetch pool data');

        const jsonData = await response.json();
        
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
  }, [token.contract, token.network]);

  return { data, isLoading, error };
};