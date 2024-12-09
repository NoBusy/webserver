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
const CACHE_TTL = 60 * 1000;

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

      if (poolDataCache[cacheKey] && (now - poolDataCache[cacheKey].timestamp) < CACHE_TTL) {
        setData(poolDataCache[cacheKey].data);
        setIsLoading(false);
        return;
      }

      try {
        const url = `https://pro-api.coingecko.com/api/v3/onchain/networks/${network}/pools/${token.contract}`;
        console.log('Fetching pool data:', { network, contract: token.contract, url });

        const response = await fetch(url, {
          headers: { 'accept': 'application/json' }
        });

        if (!response.ok) throw new Error('Failed to fetch pool data');

        const jsonData = await response.json();
        console.log('Pool data response:', jsonData);

        if (!jsonData.data?.[0]) throw new Error('No pool data available');

        poolDataCache[cacheKey] = {
          data: jsonData.data[0],
          timestamp: now
        };

        if (isMounted) {
          setData(jsonData.data[0]);
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
    const interval = setInterval(fetchPoolData, CACHE_TTL);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [token.contract, token.network]);

  return { data, isLoading, error };
};