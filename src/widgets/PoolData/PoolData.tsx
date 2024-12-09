import React from 'react';
import { Token } from '@/entities/Wallet';
import { usePoolData } from './usePoolData';
import styles from './PoolData.module.scss';

interface PoolDataProps {
  token: Token;
}

export const PoolData: React.FC<PoolDataProps> = ({ token }) => {
    const { data, isLoading, error } = usePoolData(token);
  
    console.log('PoolData render:', { data, isLoading, error, token }); // Добавляем логирование
  
    if (isLoading) {
      return <div className={styles.loading}>Loading pool data...</div>;
    }
  
    // Показываем ошибку вместо скрытия компонента
    if (error) {
      console.error('Pool data error:', error);
      return <div className={styles.error}>{error}</div>;
    }
  
    // Проверяем наличие необходимых данных
    if (!data?.attributes) {
      console.log('No pool data available');
      return null;
    }
  
    const {
      attributes: {
        transactions = {},
        price_change_percentage: priceChanges = {},
        volume_usd: volumeUsd = {}
      }
    } = data;
  
    // Проверяем наличие необходимых данных перед рендерингом
    if (!transactions.m5 || !transactions.h1 || !priceChanges) {
      console.log('Missing required data fields');
      return null;
    }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    }).format(num);
  };

  const formatVolume = (volume: string) => {
    return Number(volume).toLocaleString(undefined, { maximumFractionDigits: 0 });
  };

  return (
    <div className={styles.poolData}>
      <div className={styles.poolDataSection}>
        <h3 className={styles.poolDataTitle}>Trading Activity</h3>
        <div className={styles.poolDataGrid}>
          <div className={styles.poolDataItem}>
            <div className={styles.label}>Last 5 Minutes</div>
            <div className={styles.valueRow}>
              <div>
                <span className={styles.positiveChange}>
                  Buys: {transactions.m5.buys}
                </span>
              </div>
              <div>
                <span className={styles.negativeChange}>
                  Sells: {transactions.m5.sells}
                </span>
              </div>
            </div>
            <div className={styles.subValue}>
              Volume: ${formatVolume(volumeUsd.m5)}
            </div>
          </div>

          <div className={styles.poolDataItem}>
            <div className={styles.label}>Last Hour</div>
            <div className={styles.valueRow}>
              <div>
                <span className={styles.positiveChange}>
                  Buys: {transactions.h1.buys}
                </span>
              </div>
              <div>
                <span className={styles.negativeChange}>
                  Sells: {transactions.h1.sells}
                </span>
              </div>
            </div>
            <div className={styles.subValue}>
              Volume: ${formatVolume(volumeUsd.h1)}
            </div>
          </div>

          <div className={styles.poolDataItem}>
            <div className={styles.label}>Price Changes</div>
            <div className={styles.valueColumn}>
              <div>
                1h: <span className={priceChanges.h1 >= 0 ? styles.positiveChange : styles.negativeChange}>
                  {formatNumber(priceChanges.h1)}%
                </span>
              </div>
              <div>
                24h: <span className={priceChanges.h24 >= 0 ? styles.positiveChange : styles.negativeChange}>
                  {formatNumber(priceChanges.h24)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};