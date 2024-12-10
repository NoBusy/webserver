import React, { memo, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/shared/ui/Button/Button';
import { getTokenImage } from '@/fsdpages/WalletPage';
import styles from './PrepareSwapWindow.module.scss';
import arrowIcon from '@/shared/assets/icons/arrow-icon.svg';
import { Token, Network } from '@/entities/Wallet';
import { useHapticFeedback } from '@/shared/lib/hooks/useHapticFeedback/useHapticFeedback';

interface TokenBlockProps {
  isFrom: boolean;
  token?: Token;
  amount: number;
  usdAmount: string;
  onAmountChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onTokenSelect: () => void;
  onMaxClick?: () => void;
  showTokenInfoButton?: boolean;
  onShowTokenInfo?: () => void;
  showTokenInfo?: boolean;
  estimatedFee?: { estimated_fee: number; estimated_fee_usd: number };
}

const NETWORK_FEES = {
  ETH: 0.008,
  BSC: 0.0004,
  SOL: 0.00022,
  TON: 0.18
} as const;

const TokenBlock: React.FC<TokenBlockProps> = ({
  isFrom,
  token,
  amount,
  usdAmount,
  onAmountChange,
  onTokenSelect,
  onMaxClick,
  showTokenInfoButton,
  onShowTokenInfo,
  showTokenInfo,
}) => {
  const handlePercentageClick = useCallback((percent: number) => {
    if (!token || !onAmountChange) return;

    let newAmount: number;
    const isNativeToken = token.symbol === 'ETH' || 
                         token.symbol === 'BSC' || 
                         token.symbol === 'SOL' || 
                         token.symbol === 'TON';

    if (percent === 100 && isNativeToken) {
      const networkFee = NETWORK_FEES[token.symbol as keyof typeof NETWORK_FEES] || 0;
      newAmount = token.balance - networkFee;
      
      if (newAmount <= 0) {
        newAmount = 0;
      }
    } else {
      newAmount = token.balance * (percent / 100);
    }

    onAmountChange({
      target: { value: newAmount.toString() }
    } as React.ChangeEvent<HTMLInputElement>);
  }, [token, onAmountChange]);


  const [inputValue, setInputValue] = React.useState(amount.toString());

  
  React.useEffect(() => {
    // Не обновляем если инпут в фокусе
    if (document.activeElement?.id !== (isFrom ? "fromAmount" : "toAmount")) {
      setInputValue(amount === 0 && inputValue === '' ? '' : amount.toString());
    }
  }, [amount, isFrom]); // Убрал inputValue из зависимостей, чтобы избежать лишних обновлений
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Разрешаем пустую строку
    if (value === '') {
      setInputValue('');
      onAmountChange?.({
        ...e,
        target: {
          ...e.target,
          value: '0'
        }
      });
      return;
    }
  
    value = value.replace(',', '.');
    
    // Проверяем, что в строке только одна точка
    if ((value.match(/\./g) || []).length > 1) {
      return;
    }
  
    // Возвращаем ваш оригинальный regex, который корректно работал с нулями
    const validNumberFormat = /^(0$|0\.\d*$|[1-9]\d*\.?\d*$)$/;
    
    if (!validNumberFormat.test(value)) {
      return;
    }
  
    setInputValue(value);
    onAmountChange?.({
      ...e,
      target: {
        ...e.target,
        value
      }
    });

    // Если значение не соответствует формату, игнорируем ввод
    if (!validNumberFormat.test(value)) {
      return;
    }

    setInputValue(value);
    onAmountChange?.({
      ...e,
      target: {
        ...e.target,
        value
      }
    });
  };

  return (
    <div className={styles.tokenBlock}>
      <div className={styles.label}>{isFrom ? "You give" : "You receive"}</div>
      <div className={styles.tokenInfo}>
        <div className={styles.amountInfo}>
          <input
            id={isFrom ? "fromAmount" : "toAmount"}
            name={isFrom ? "fromAmount" : "toAmount"}
            type="text"
            value={inputValue}
            onChange={handleAmountChange}
            placeholder="0"
            className={styles.amountInput}
            readOnly={!isFrom}
            inputMode="decimal"
            pattern="^(0|[1-9]\d*\.?\d*|\.\d+)$"
          />
          <div className={styles.usdAmount}>{usdAmount} $</div>
        </div>
        <div className={styles.tokenSelector} onClick={onTokenSelect}>
          {token && (
            <Image
              src={getTokenImage(token)}
              alt={`${token.symbol} icon`}
              width={24}
              height={24}
            />
          )}
          <span>{token ? token.symbol : "Token"}</span>
          <span className={styles.arrow}>
            <Image src={arrowIcon} alt='' width={24} height={24} />
          </span>
        </div>
      </div>
      <div className={styles.bottomContainer}>
        <div className={styles.buttonWrapper}>
          {isFrom ? (
            <div className={styles.percentButtons}>
              {[25, 50, 75, 100].map((percent) => (
                <button
                  key={`${percent}%`}
                  onClick={() => handlePercentageClick(percent)}
                  className={styles.actionButton}
                >
                  {percent === 100 ? 'Max' : `${percent}%`}
                </button>
              ))}
            </div>
          ) : (
            showTokenInfoButton && (
              <button
                onClick={onShowTokenInfo}
                className={styles.actionButton}
              >
                {showTokenInfo ? 'Hide' : 'Show'} Info
              </button>
            )
          )}
        </div>
        <div className={styles.balance}>
          {token ? `${token.balance === 0 ? 0 : token.balance.toFixed(4)} ${token.symbol}` : ''}
        </div>
      </div>
    </div>
  );
};

export default memo(TokenBlock);