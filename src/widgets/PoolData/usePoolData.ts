import { useState, useEffect } from 'react';
import { Token, Network, useGetTokenLiquidityQuery } from '@/entities/Wallet';

// Типы для данных пула
interface PoolAttributes {
  address: string;
  base_token_price_usd: string;
  quote_token_price_usd: string;
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
    data: Pool | null;
    timestamp: number;
  }
}

export const NETWORK_MAPPING: Record<string, string> = {
  [Network.ETH]: 'eth',
  [Network.BSC]: 'bsc',
  [Network.SOL]: 'solana',
  [Network.TON]: 'ton'
};

const NETWORK_IDS: Record<string, string> = {
  'Binance Smart Chain': '14',
  'Ethereum': '1', 
  'Solana': '16',
  'The Open Network': '173'
};

const NATIVE_POOLS: Record<string, { address: string; symbols: string[] }> = {
  [Network.ETH]: {
    address: '0x0d4a11d5EEaaC28EC3F61d100daF4d40471f1852',
    symbols: ['ETH', 'WETH']
  },
  [Network.BSC]: {
    address: '0x16b9a82891338f9ba80e2d6970fdda79d1eb0dae',
    symbols: ['BNB', 'WBNB']
  },
  [Network.SOL]: {
    address: '3nMFwZXwY1s1M5s8vYAHqd4wGs4iSxXE4LRoUMMYqEgF',
    symbols: ['SOL', 'WSOL']
  },
  [Network.TON]: {
    address: 'EQCGScrZe1xbyWqWDvdI6mzP-GAcAWFv6ZXuaJOuSqemxku4',
    symbols: ['TON', 'WTON']
  }
};

const poolDataCache: PoolDataCache = {};
const DATA_CACHE_TTL = 60 * 60 * 1000;

export const usePoolData = (token: Token) => {
  const [data, setData] = useState<Pool | null>(null);
  const [liquidity, setLiquidity] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liquidityParams, setLiquidityParams] = useState<{
    contract_address: string;
    network: string;
  } | null>(null);

  const { data: liquidityData, error: liquidityError } = useGetTokenLiquidityQuery(
    liquidityParams ?? { contract_address: '', network: '' },
    { skip: !liquidityParams }
  );

  useEffect(() => {
    let isMounted = true;

    const getTokenPools = async () => {
      try {
        const cacheKey = `${token.network}_${token.contract}_${token.symbol}`;
        const cachedData = poolDataCache[cacheKey];
        
        let poolData: Pool | null = null;

        if (cachedData && Date.now() - cachedData.timestamp < DATA_CACHE_TTL) {
          poolData = cachedData.data;
        } else {
          const nativePool = NATIVE_POOLS[token.network];
          if (nativePool && nativePool.symbols.includes(token.symbol)) {
            poolData = {
              id: `${NETWORK_MAPPING[token.network]}_${nativePool.address}`,
              type: 'pool',
              attributes: {
                address: nativePool.address,
                base_token_price_usd: '',
                quote_token_price_usd: ''
              },
              relationships: {
                base_token: { data: { attributes: { symbol: token.symbol } } },
                quote_token: { data: { attributes: { symbol: 'USDT' } } }
              }
            };
          } else {
            const network = NETWORK_MAPPING[token.network];
            const response = await fetch(
              `https://api.geckoterminal.com/api/v2/networks/${network}/tokens/${token.contract}/pools?sort=h24_volume_usd_desc`
            );

            if (!response.ok) throw new Error('Failed to fetch token pools');
            const jsonData = await response.json();
            poolData = jsonData.data?.[0];
          }

          poolDataCache[cacheKey] = {
            data: poolData,
            timestamp: Date.now()
          };
        }

        if (!poolData) throw new Error('No pools found for token');

        if (poolData.attributes.address) {
          const networkId = NETWORK_IDS[token.network];
          if (!networkId) {
            console.error('Unknown network:', token.network);
            return;
          }

          setLiquidityParams({
            contract_address: poolData.attributes.address,
            network: networkId
          });
        }

        if (isMounted) {
          setData(poolData);
        }

      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load data');
        }
        console.error('Failed to fetch pool data:', err);
      }
    };

    setIsLoading(true);
    getTokenPools()
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [token.contract, token.network, token.symbol]);

  useEffect(() => {
    if (liquidityData?.data?.liquidity !== undefined) {
      setLiquidity(liquidityData.data.liquidity);
    }
    if (liquidityError) {
      console.error('Failed to fetch liquidity:', liquidityError);
    }
  }, [liquidityData, liquidityError]);

  return { data, liquidity, isLoading, error };
};