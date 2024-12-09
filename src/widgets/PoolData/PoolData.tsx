import React from 'react';
import { Token } from '@/entities/Wallet';
import { usePoolData } from './usePoolData';
import styles from './PoolData.module.scss';

interface PoolDataProps {
  token: Token;
}

export const PoolData: React.FC<PoolDataProps> = ({ token }) => {
  const { data, isLoading, error } = usePoolData(token);

  if (error) {
    return <div className={styles.error}>Failed to load pool data</div>;
  }

  if (isLoading) {
    return <div className={styles.loading}>Loading pool data...</div>;
  }

  if (!data) return null;

  const {
    attributes: {
      transactions,
      price_change_percentage: priceChanges
    }
  } = data;

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    }).format(num);
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
              Traders: {transactions.m5.buyers + transactions.m5.sellers}
            </div>
          </div>

          <div className={styles.poolDataItem}>
            <div className={styles.label}>Last 15 Minutes</div>
            <div className={styles.valueRow}>
              <div>
                <span className={styles.positiveChange}>
                  Buys: {transactions.m15.buys}
                </span>
              </div>
              <div>
                <span className={styles.negativeChange}>
                  Sells: {transactions.m15.sells}
                </span>
              </div>
            </div>
            <div className={styles.subValue}>
              Traders: {transactions.m15.buyers + transactions.m15.sellers}
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