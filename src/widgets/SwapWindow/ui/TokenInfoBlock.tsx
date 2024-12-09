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
  const { data: poolData, isLoading, error } = usePoolData(token);

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
          {error && <div style={{color: 'red'}}>Error: {error}</div>}
        </div>
      )}
    </div>
  );
};

export default TokenInfoBlock;