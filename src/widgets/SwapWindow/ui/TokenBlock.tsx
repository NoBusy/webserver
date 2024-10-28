import React, { memo, useCallback } from 'react';
import Image from 'next/image';
import { Button } from '@/shared/ui/Button/Button';
import { getTokenImage } from '@/fsdpages/WalletPage';
import styles from './PrepareSwapWindow.module.scss';
import arrowIcon from '@/shared/assets/icons/arrow-icon.svg';
import { Token, Network } from '@/entities/Wallet';

interface TokenBlockProps {
  isFrom: boolean;
  token?: Token;
  amount: string;
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
  ETH: 0.005,
  BSC: 0.003,
  SOL: 0.00015,
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

    // Определяем является ли токен нативным
    const isNativeToken = token.symbol === 'ETH' || 
                         token.symbol === 'BNB' || 
                         token.symbol === 'SOL' || 
                         token.symbol === 'TON';

    if (percent === 100 && isNativeToken) {
      // Получаем фиксированную комиссию для сети
      const networkFee = NETWORK_FEES[token.symbol as keyof typeof NETWORK_FEES];
      
      // Добавляем небольшой запас в 10% к комиссии для надежности
      const safetyBuffer = networkFee * 1.1;
      
      // Вычисляем максимальную сумму
      newAmount = token.balance - safetyBuffer;
      
      // Проверяем что сумма положительная
      if (newAmount <= 0) {
        newAmount = 0;
      }
    } else {
      newAmount = token.balance * (percent / 100);
    }

    // Преобразуем в строку, сохраняя все значащие цифры
    const formattedAmount = newAmount.toFixed(9); // Используем 9 знаков для SOL
    
    // Удаляем лишние нули в конце, но сохраняем необходимые
    const trimmedAmount = formattedAmount.replace(/\.?0+$/, '');

    onAmountChange({
      target: { value: trimmedAmount }
    } as React.ChangeEvent<HTMLInputElement>);
  }, [token, onAmountChange]);

  return (
    <div className={styles.tokenBlock}>
      <div className={styles.label}>{isFrom ? "You give" : "You receive"}</div>
      <div className={styles.tokenInfo}>
        <div className={styles.amountInfo}>
          <input
            id={isFrom ? "fromAmount" : "toAmount"}
            name={isFrom ? "fromAmount" : "toAmount"}
            type="number"
            value={amount}
            onChange={onAmountChange}
            placeholder="0"
            className={styles.amountInput}
            readOnly={!isFrom}
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