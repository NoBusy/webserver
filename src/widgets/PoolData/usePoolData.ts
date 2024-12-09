import { useState, useEffect } from 'react';
import { Token, Network } from '@/entities/Wallet';

interface PoolDataCache {
  [key: string]: {
    data: any;
    timestamp: number;
  }
}

interface TradesCache {
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
const tradesCache: TradesCache = {};
const DATA_CACHE_TTL = 60 * 1000;
const TRADES_CACHE_TTL = 30 * 1000; // 30 секунд для торгов

export const usePoolData = (token: Token) => {
  const [data, setData] = useState<any>(null);
  const [trades, setTrades] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const getTokenPools = async () => {
      try {
        const network = NETWORK_MAPPING[token.network];
        console.log('Getting pools for token:', { network, contract: token.contract });

        const response = await fetch(
          `https://api.geckoterminal.com/api/v2/networks/${network}/tokens/${token.contract}/pools?sort=h24_volume_usd_desc`,
          {
            headers: { 'Accept': 'application/json' }
          }
        );

        if (!response.ok) throw new Error('Failed to fetch token pools');

        const jsonData = await response.json();
        console.log('Token pools data:', jsonData);

        // Берем пул с наибольшим объемом
        const topPool = jsonData.data?.[0];
        if (!topPool) throw new Error('No pools found for token');

        return topPool;
      } catch (err) {
        console.error('Error getting token pools:', err);
        throw err;
      }
    };

    const getPoolTrades = async (poolAddress: string) => {
      const cacheKey = `${token.network}_${poolAddress}_trades`;
      const now = Date.now();

      if (tradesCache[cacheKey] && 
          (now - tradesCache[cacheKey].timestamp) < TRADES_CACHE_TTL) {
        return tradesCache[cacheKey].data;
      }

      try {
        const network = NETWORK_MAPPING[token.network];
        const response = await fetch(
          `https://api.geckoterminal.com/api/v2/networks/${network}/pools/${poolAddress}/trades`,
          {
            headers: { 'Accept': 'application/json' }
          }
        );

        if (!response.ok) throw new Error('Failed to fetch trades');

        const jsonData = await response.json();
        
        tradesCache[cacheKey] = {
          data: jsonData.data,
          timestamp: now
        };

        return jsonData.data;
      } catch (err) {
        console.error('Error getting pool trades:', err);
        throw err;
      }
    };

    const fetchData = async () => {
      try {
        const poolData = await getTokenPools();
        console.log('Found pool:', poolData);

        if (!poolData.attributes.address) {
          throw new Error('Pool address not found');
        }

        // Получаем торги для найденного пула
        const tradesData = await getPoolTrades(poolData.attributes.address);
        console.log('Trades data:', tradesData);

        if (isMounted) {
          setData(poolData);
          setTrades(tradesData);
          setError(null);
        }
      } catch (err) {
        console.error('Error:', err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load data');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();
    const interval = setInterval(fetchData, DATA_CACHE_TTL);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [token.contract, token.network]);

  return { data, trades, isLoading, error };
};