import React from 'react';
import { Token } from '@/entities/Wallet';
import { usePoolData } from './usePoolData';
import styles from './PoolData.module.scss';

interface PoolDataProps {
  token: Token;
}

export const PoolData: React.FC<PoolDataProps> = ({ token }) => {
    const { data, isLoading, error } = usePoolData(token);
  
    if (error || !data) return null;
    if (isLoading) return <div className={styles.loading}>Loading pool data...</div>;
  
    const {
      attributes: {
        transactions,
        price_change_percentage: priceChanges,
        volume_usd: volumeUsd
      }
    } = data;
  
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
                Volume: ${Number(volumeUsd.m5).toLocaleString(undefined, { maximumFractionDigits: 0 })}
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
                Volume: ${Number(volumeUsd.h1).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </div>
            </div>
  
            <div className={styles.poolDataItem}>
              <div className={styles.label}>Price Changes</div>
              <div className={styles.valueColumn}>
                <div>
                  1h: <span className={priceChanges.h1 >= 0 ? styles.positiveChange : styles.negativeChange}>
                    {priceChanges.h1}%
                  </span>
                </div>
                <div>
                  24h: <span className={priceChanges.h24 >= 0 ? styles.positiveChange : styles.negativeChange}>
                    {priceChanges.h24}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };