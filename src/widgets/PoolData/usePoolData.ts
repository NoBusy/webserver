// usePoolData.ts
import { useState, useEffect } from 'react';
import { Token, Network } from '@/entities/Wallet';

// Добавим типы для данных пула
interface PoolAttributes {
  address: string;
  base_token_price_usd: string;
  quote_token_price_usd: string;
  // другие поля если нужны
}

interface PoolRelationships {
  base_token: {
    data: {
      attributes?: {
        symbol: string;
      }
    }
  };
  quote_token: {
    data: {
      attributes?: {
        symbol: string;
      }
    }
  };
}

interface Pool {
  id: string;
  type: string;
  attributes: PoolAttributes;
  relationships: PoolRelationships;
}

interface PoolDataCache {
  [key: string]: {
    data: Pool;
    timestamp: number;
  }
}

interface TradesCache {
  [key: string]: {
    data: any;
    timestamp: number;
  }
}

// Используем значения из enum Network
export const NETWORK_MAPPING: Record<string,string> = {
  [Network.ETH]: 'eth',
  [Network.BSC]: 'bsc',
  [Network.SOL]: 'solana',
  [Network.TON]: 'ton'
};

const nativeTokens: Record<string, string> = {
  'BNB': 'USDT',
  'ETH': 'USDT',
  'SOL': 'USDT',
  'TON': 'USDT',
  'WBNB': 'USDT',
  'WETH': 'USDT',
  'WSOL': 'USDT',
  'WTON': 'USDT'
};

const poolDataCache: PoolDataCache = {};
const tradesCache: TradesCache = {};
const DATA_CACHE_TTL = 60 * 1000;
const TRADES_CACHE_TTL = 30 * 1000;

interface NativePoolInfo {
    address: string;
    symbols: string[];
  }
  
  const NATIVE_POOLS: Record<string, NativePoolInfo> = {
    [Network.ETH]: {
      address: '0xc7bbec68d12a0d1830360f8ec58fa599ba1b0e9b',
      symbols: ['ETH', 'WETH']
    },
    [Network.BSC]: {
      address: '0x172fcd41e0913e95784454622d1c3724f546f849',
      symbols: ['BNB', 'WBNB']
    },
    [Network.SOL]: {
      address: '3nMFwZXwY1s1M5s8vYAHqd4wGs4iSxXE4LRoUMMYqEgF',
      symbols: ['SOL', 'WSOL']
    },
    [Network.TON]: {
      address: 'EQA-X_yo3fzzbDbJ_0bzFWKqtRuZFIRa1sJsveZJ1YpViO3r',
      symbols: ['TON', 'WTON']
    }
  };
  
  export const usePoolData = (token: Token) => {
    const [data, setData] = useState<Pool | null>(null);
    const [trades, setTrades] = useState<any[] | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
  
    useEffect(() => {
      let isMounted = true;
  
      const getTokenPools = async () => {
        try {
          // Проверяем, является ли токен нативным
          const nativePool = NATIVE_POOLS[token.network];
          if (nativePool && nativePool.symbols.includes(token.symbol)) {
            // Для нативного токена создаем объект пула с хардкоженным адресом
            return {
              id: `${NETWORK_MAPPING[token.network]}_${nativePool.address}`,
              type: 'pool',
              attributes: {
                address: nativePool.address,
                // другие атрибуты если нужны
              },
              relationships: {
                base_token: { data: { attributes: { symbol: token.symbol } } },
                quote_token: { data: { attributes: { symbol: 'USDT' } } }
              }
            } as Pool;
          }
  
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
  
          const topPool = jsonData.data?.[0];
          if (!topPool) throw new Error('No pools found for token');
          return topPool;
  
        } catch (err) {
          console.error('Error getting token pools:', err);
          throw err;
        }
      };
  
      const fetchData = async () => {
        try {
          const poolData = await getTokenPools();
          console.log('Found pool:', poolData);
          
          if (isMounted) {
            setData(poolData);
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
    }, [token.contract, token.network, token.symbol]);
  
    return { data, trades, isLoading, error };
  };