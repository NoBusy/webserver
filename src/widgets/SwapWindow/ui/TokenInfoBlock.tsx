import React, { useRef, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Typography } from '@/shared/ui/Typography/Typography';
import { Token } from '@/entities/Wallet';
import InfoItem from './InfoItem';
import { CopyFillIcon } from '@/shared/assets/icons/CopyFillIcon';
import { SuccessFillIcon } from '@/shared/assets/icons/SuccessFillIcon';
import { useToasts } from '@/shared/lib/hooks/useToasts/useToasts';
import styles from './TokenInfoBlock.module.scss';

interface TradingViewChartProps {
  symbol: string;
  theme?: 'light' | 'dark';
}

interface TokenInfoBlockProps {
  token: Token;
  tokenExtendedInfo: any;
  tokenImage: string;
  historicalData: { timestamp: string; price: number }[];
}


const TradingViewChart: React.FC<TradingViewChartProps> = ({ symbol, theme = "dark" }) => {
  const container = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!container.current) return;

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;

    const widgetConfig = {
      autosize: true,
      symbol: `${symbol}USDT`,
      interval: "D",
      timezone: "Etc/UTC",
      theme,
      style: "1",
      locale: "en",
      enable_publishing: false,
      allow_symbol_change: true,
      save_image: false,
      withdateranges: true,
      hide_side_toolbar: false,
      height: "500",
      width: "100%",
      backgroundColor: "#1e222d",
      gridColor: "rgba(255, 255, 255, 0.06)",
      container_id: "tradingview_widget",
      support_host: "https://www.tradingview.com"
    };

    script.innerHTML = JSON.stringify(widgetConfig);
    container.current.innerHTML = '';
    container.current.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [symbol, theme]);

  return (
    <div className={styles.chartContainer}>
      <div ref={container} style={{ height: "100%", width: "100%" }} />
    </div>
  );
};

const TokenInfoBlock: React.FC<TokenInfoBlockProps> = ({ token, tokenExtendedInfo, tokenImage }) => {
  const { successToast } = useToasts();

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

  const getBaseSymbol = (symbol: string) => {
    const wrappedTokens: Record<string, string> = {
      'WETH': 'ETH',
      'WBTC': 'BTC',
      'WBNB': 'BNB',
      'WMATIC': 'MATIC',
      'WAVAX': 'AVAX',
    };
    return wrappedTokens[symbol] || symbol;
  };

  return (
    <div className={styles.tokenInfoBlock}>
      <div className={styles.header}>
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

      <TradingViewChart symbol={getBaseSymbol(token.symbol)} />
      
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