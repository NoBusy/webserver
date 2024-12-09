import React, { useRef, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Typography } from '@/shared/ui/Typography/Typography';
import { Token } from '@/entities/Wallet';
import InfoItem from './InfoItem';
import { CopyFillIcon } from '@/shared/assets/icons/CopyFillIcon';
import { SuccessFillIcon } from '@/shared/assets/icons/SuccessFillIcon';
import { useToasts } from '@/shared/lib/hooks/useToasts/useToasts';

interface TokenInfoBlockProps {
  token: Token;
  tokenExtendedInfo: any;
  tokenImage: string;
  historicalData: { timestamp: string; price: number }[];
}

interface TradingViewChartProps {
  token: Token;
  theme?: 'light' | 'dark';
}

interface NetworkMap {
  [key: string]: string;
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({ token, theme = "dark" }) => {
  const container = useRef<HTMLDivElement>(null);
  
  const networkMap: NetworkMap = {
    'ethereum': 'UNISWAP',
    'bsc': 'PANCAKESWAP',
    'polygon': 'QUICKSWAP',
  };

  const getTradingViewSymbol = useMemo(() => {
    if (token.network && networkMap[token.network.toLowerCase()]) {
      return `${networkMap[token.network.toLowerCase()]}:${token.symbol}USD`;
    }

    const majorTokens = ['BTC', 'ETH', 'BNB', 'USDT', 'USDC'];
    if (majorTokens.includes(token.symbol.toUpperCase())) {
      return `BINANCE:${token.symbol}USD`;
    }

    const exchanges = ['BINANCE', 'COINBASE', 'KUCOIN'];
    for (const exchange of exchanges) {
      return `${exchange}:${token.symbol}USD`;
    }

    return null;
  }, [token, networkMap]);

  useEffect(() => {
    if (!getTradingViewSymbol || !container.current) {
      console.warn('No suitable trading pair found for TradingView widget');
      return;
    }

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;

    const widgetConfig = {
      autosize: true,
      symbol: getTradingViewSymbol,
      interval: "D",
      timezone: "Etc/UTC",
      theme,
      style: "1",
      locale: "en",
      enable_publishing: false,
      allow_symbol_change: true,
      calendar: false,
      hide_top_toolbar: false,
      hide_legend: true,
      support_host: "https://www.tradingview.com"
    };

    script.innerHTML = JSON.stringify(widgetConfig);

    container.current.appendChild(script);

    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [getTradingViewSymbol, theme]);

  if (!getTradingViewSymbol) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center bg-gray-100 rounded">
        <Typography.Text text="Chart not available for this token" className="text-gray-500" />
      </div>
    );
  }

  return (
    <div className="tradingview-widget-container" ref={container} style={{ height: "300px", width: "100%" }}>
      <div className="tradingview-widget-container__widget" style={{ height: "calc(100% - 32px)", width: "100%" }} />
    </div>
  );
};

const TokenInfoBlock: React.FC<TokenInfoBlockProps> = ({ token, tokenExtendedInfo, tokenImage }) => {
  const { successToast } = useToasts();

  const getPriceChangeClass = (value: number | undefined): string => {
    if (value === undefined) return '';
    return value < 0 ? 'text-red-500' : 'text-green-500';
  };

  const formatPriceChange = (value: number | undefined): string => {
    if (value === undefined) return 'N/A';
    return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const handleOnCopy = (): void => {
    navigator.clipboard.writeText(token.contract ?? '');
    successToast('Copied', { icon: <SuccessFillIcon width={21} height={21} /> });
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <Image src={tokenImage} alt={token.symbol} width={40} height={40} className="rounded-full" />
          <div>
            <Typography.Text text={token.symbol} className="font-bold text-lg" />
            <Typography.Text text={`$${tokenExtendedInfo.price?.toFixed(6) || 'N/A'}`} className="text-gray-600" />
          </div>
        </div>
        <div>
          <Typography.Text 
            text={formatPriceChange(tokenExtendedInfo.percent_change_24h)}
            className={getPriceChangeClass(tokenExtendedInfo.percent_change_24h)}
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2 mb-4">
        <Typography.Text 
          text={token.contract || 'Address not available'} 
          className="text-sm text-gray-500 truncate"
          onClick={handleOnCopy}
        />
        <CopyFillIcon 
          className="cursor-pointer w-4 h-4 text-gray-400 hover:text-gray-600"
          onClick={handleOnCopy}
        />
      </div>

      <div className="mb-4">
        <TradingViewChart token={token} />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <InfoItem label="Total Supply" value={tokenExtendedInfo.total_supply?.toLocaleString() || 'N/A'} />
        <InfoItem label="Max Supply" value={tokenExtendedInfo.max_supply?.toLocaleString() || 'N/A'} />
        <InfoItem label="Market Cap" value={`$${tokenExtendedInfo.market_cap?.toLocaleString() || 'N/A'}`} />
        <InfoItem 
          label="24h Change" 
          value={formatPriceChange(tokenExtendedInfo.percent_change_24h)}
          className={getPriceChangeClass(tokenExtendedInfo.percent_change_24h)}
        />
        <InfoItem 
          label="7d Change" 
          value={formatPriceChange(tokenExtendedInfo.percent_change_7d)}
          className={getPriceChangeClass(tokenExtendedInfo.percent_change_7d)}
        />
        <InfoItem
          label="30d Change" 
          value={formatPriceChange(tokenExtendedInfo.percent_change_30d)}
          className={getPriceChangeClass(tokenExtendedInfo.percent_change_30d)}
        />
      </div>
    </div>
  );
};

export default TokenInfoBlock;