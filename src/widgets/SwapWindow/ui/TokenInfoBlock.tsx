import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import { Typography } from '@/shared/ui/Typography/Typography';
import { Token } from '@/entities/Wallet';
import { CopyFillIcon } from '@/shared/assets/icons/CopyFillIcon';
import { SuccessFillIcon } from '@/shared/assets/icons/SuccessFillIcon';
import { useToasts } from '@/shared/lib/hooks/useToasts/useToasts';
import styles from './TokenInfoBlock.module.scss';
import { usePoolData } from '@/widgets/PoolData/usePoolData';

interface TokenInfoBlockProps {
  token: Token;
  tokenExtendedInfo: any;
  tokenImage: string;
}

const TokenInfoBlock: React.FC<TokenInfoBlockProps> = ({ token, tokenExtendedInfo, tokenImage }) => {
  const { successToast } = useToasts();
  const { data: poolData, isLoading, error } = usePoolData(token);

  useEffect(() => {
    console.log('TokenInfoBlock Debug:', {
      poolData,
      isLoading,
      error,
      hasAttributes: poolData?.attributes,
      poolAddress: poolData?.attributes?.address,
      network: token.network,
    });
  }, [poolData, isLoading, error, token.network]);

  const getPriceChangeClass = (value: number | undefined): string => {
    if (value === undefined) return '';
    return value < 0 ? styles.negativeChange : styles.positiveChange;
  };

  const formatPriceChange = (value: number | undefined): string => {
    if (value === undefined) return 'N/A';
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const handleOnCopy = (): void => {
    navigator.clipboard.writeText(token.contract ?? '');
    successToast('Copied', { icon: <SuccessFillIcon width={21} height={21} /> });
  };

  const networkMapping: Record<string, string> = {
    'ETH': 'eth',
    'BSC': 'bsc',
    'SOL': 'solana',
    'Solana': 'solana'  // обратите внимание, у вас 'Solana' а не 'SOL'
  };

  const getGeckoTerminalUrl = (): string | undefined => {
    // Добавим подробные логи
    console.log('Creating URL with:', {
      network: token.network,
      mappedNetwork: networkMapping[token.network],
      poolAddress: poolData?.attributes?.address
    });
  
    if (!poolData?.attributes?.address) {
      return undefined;
    }
  
    const network = networkMapping[token.network];
    if (!network) {
      return undefined;
    }
  
    const url = `https://www.geckoterminal.com/ru/${network}/pools/${poolData.attributes.address}?embed=1&info=0&swaps=1&grayscale=1&light_chart=0`;
    console.log('Final URL:', url);
    return url;
  };

  const geckoTerminalUrl = getGeckoTerminalUrl();

  console.log('Token:', token);
  console.log('Pool Data:', poolData);
  console.log('Loading:', isLoading);
  console.log('Error:', Error);


  return (
    <div>
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.tokenIdentity}>
            <Image src={tokenImage} alt={token.symbol} width={40} height={40} className={styles.tokenIcon} />
            <div className={styles.tokenDetails}>
              <Typography.Text text={token.symbol} className={styles.tokenSymbol} />
              <Typography.Text text={`$${tokenExtendedInfo.price?.toFixed(6) || 'N/A'}`} className={styles.price} />
            </div>
          </div>
          <div className={styles.tokenPriceChange}>
            <Typography.Text 
              text={formatPriceChange(tokenExtendedInfo.percent_change_24h)}
              className={`${styles.priceChange} ${getPriceChangeClass(tokenExtendedInfo.percent_change_24h)}`}
            />
          </div>
        </div>
        
        <div onClick={handleOnCopy} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Typography.Text 
            text={token.contract || 'Address not available'} 
            className={styles.tokenAddress}
          />
          <CopyFillIcon className={styles.copyIcon} />
        </div>
      </div>

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
          <div>Debug info:</div>
          <pre style={{fontSize: '12px', overflow: 'auto', maxHeight: '200px'}}>
            {JSON.stringify({
              hasPoolData: !!poolData,
              poolId: poolData?.id,
              poolAddress: poolData?.attributes?.address,
              network: token.network,
              error: error,
              url: geckoTerminalUrl
            }, null, 2)}
          </pre>
        </div>
      )}

      <div className={styles.infoGrid}>
        <div className={styles.infoItem}>
          <Typography.Text text="Total Supply" className={styles.label} />
          <Typography.Text text={tokenExtendedInfo.total_supply?.toLocaleString() || 'N/A'} className={styles.value} />
        </div>
        <div className={styles.infoItem}>
          <Typography.Text text="Max Supply" className={styles.label} />
          <Typography.Text text={tokenExtendedInfo.max_supply?.toLocaleString() || 'N/A'} className={styles.value} />
        </div>
        <div className={styles.infoItem}>
          <Typography.Text text="Market Cap" className={styles.label} />
          <Typography.Text text={`$${tokenExtendedInfo.market_cap?.toLocaleString() || 'N/A'}`} className={styles.value} />
        </div>
        <div className={styles.infoItem}>
          <Typography.Text text="24h Change" className={styles.label} />
          <Typography.Text 
            text={formatPriceChange(tokenExtendedInfo.percent_change_24h)}
            className={`${styles.value} ${getPriceChangeClass(tokenExtendedInfo.percent_change_24h)}`}
          />
        </div>
        <div className={styles.infoItem}>
          <Typography.Text text="7d Change" className={styles.label} />
          <Typography.Text 
            text={formatPriceChange(tokenExtendedInfo.percent_change_7d)}
            className={`${styles.value} ${getPriceChangeClass(tokenExtendedInfo.percent_change_7d)}`}
          />
        </div>
        <div className={styles.infoItem}>
          <Typography.Text text="30d Change" className={styles.label} />
          <Typography.Text 
            text={formatPriceChange(tokenExtendedInfo.percent_change_30d)}
            className={`${styles.value} ${getPriceChangeClass(tokenExtendedInfo.percent_change_30d)}`}
          />
        </div>
      </div>
    </div>
  );
};

export default TokenInfoBlock;