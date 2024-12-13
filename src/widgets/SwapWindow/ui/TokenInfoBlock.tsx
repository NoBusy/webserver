import React, { useEffect } from 'react';
import Image from 'next/image';
import { Typography } from '@/shared/ui/Typography/Typography';
import { Token } from '@/entities/Wallet';
import { CopyFillIcon } from '@/shared/assets/icons/CopyFillIcon';
import { SuccessFillIcon } from '@/shared/assets/icons/SuccessFillIcon';
import { useToasts } from '@/shared/lib/hooks/useToasts/useToasts';
import styles from './TokenInfoBlock.module.scss';
import { NETWORK_MAPPING, usePoolData } from '@/widgets/PoolData/usePoolData';

interface TokenInfoBlockProps {
  token: Token;
  tokenExtendedInfo: any;
  tokenImage: string;
}

const TokenInfoBlock: React.FC<TokenInfoBlockProps> = ({ token, tokenExtendedInfo, tokenImage }) => {
  const { successToast } = useToasts();
  const { data: poolData, liquidity, isLoading, error } = usePoolData(token);

  const formatNumber = (num: number) => {
    if (!num) return '$0';
    
    const str = Math.abs(num).toString();
    const [whole, decimal] = str.split('.');
    
    if (whole.length >= 10) { 
      return `$${(num / 1e9).toFixed(2)}B`;
    } else if (whole.length >= 7) { 
      return `$${(num / 1e6).toFixed(2)}M`;
    } else if (whole.length >= 4) { 
      return `$${(num / 1e3).toFixed(2)}K`;
    }
    
    return `$${num.toFixed(2)}`;
  };

  const handleOnCopy = (): void => {
    navigator.clipboard.writeText(token.contract ?? '');
    successToast('Copied', { icon: <SuccessFillIcon width={21} height={21} /> });
  };

  const getGeckoTerminalUrl = (): string | undefined => {
    if (!poolData?.attributes?.address) return undefined;

    // Используем напрямую значения из Network enum
    const network = NETWORK_MAPPING[token.network];
    if (!network) return undefined;

    return `https://www.geckoterminal.com/${network}/pools/${poolData.attributes.address}?embed=1&info=0&swaps=1&grayscale=0&light_chart=1`;
  };

  const geckoTerminalUrl = getGeckoTerminalUrl();

  return (
    <div className={styles.wrapper}>
      {/* Информационный блок */}
      <div className={styles.infoCard}>
        <div className={styles.tokenHeader}>
          <div className={styles.leftContent}>
            <Image
              src={tokenImage}
              alt={token.symbol}
              width={48}
              height={48}
              className={styles.tokenLogo}
            />
            <div className={styles.tokenInfo}>
              <div className={styles.tokenName}>{token.symbol}</div>
              <div className={styles.tokenAddress} onClick={handleOnCopy}>
                {token.contract !== null? `${token.contract?.slice(0, 4)}....${token.contract?.slice(-4)}` : ''}
                <CopyFillIcon className={styles.copyIcon} />
              </div>
            </div>
          </div>
          <div className={styles.priceInfo}>
            <div className={styles.price}>
              ${tokenExtendedInfo.price.toFixed(5)}
            </div>
            <div className={`${styles.priceChange} ${tokenExtendedInfo.percent_change_24h >= 0 ? styles.positive : styles.negative}`}>
              {tokenExtendedInfo.percent_change_24h > 0 ? '+' : ''}
              {tokenExtendedInfo.percent_change_24h.toFixed(2)}%
            </div>
          </div>
        </div>
        <div className={styles.statsContainer}>
          <div className={styles.statBox}>
            <div className={styles.statLabel}>Market Cap</div>
            <div className={styles.statValue}>
              {formatNumber(tokenExtendedInfo.market_cap)}
            </div>
          </div>
          <div className={styles.statBox}>
            <div className={styles.statLabel}>Liquidity</div>
            <div className={styles.statValue}>
              {formatNumber(liquidity)}
            </div>
          </div>
          <div className={styles.statBox}>
            <div className={styles.statLabel}>24h Volume</div>
            <div className={styles.statValue}>
              {formatNumber(tokenExtendedInfo.volume_24h)}
            </div>
          </div>
        </div>
      </div>
  
      {/* График в отдельном блоке */}
      {isLoading ? (
        <div className={styles.chartContainer}>Loading...</div>
      ) : geckoTerminalUrl ? (
        <div className={styles.chartContainer}>
          <iframe
            height="100%"
            width="100%"
            title="GeckoTerminal Embed"
            src={geckoTerminalUrl}
            frameBorder="0"
            allow="clipboard-write"
            allowFullScreen
          />
        </div>
      ) : (
        <div className={styles.chartContainer}>
          <div>No pool data available</div>
          {error && <div style={{color: 'red'}}>Error: {error}</div>}
        </div>
      )}
    </div>
  );
}
export default TokenInfoBlock;