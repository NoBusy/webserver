// import React, { useState } from 'react';
// import { Token } from '@/entities/Wallet';
// import { usePoolData } from './usePoolData';
// import styles from './PoolData.module.scss';

// interface PoolDataProps {
//   token: Token;
// }

// export const PoolData: React.FC<PoolDataProps> = ({ token }) => {
//   const { data, trades, isLoading, error } = usePoolData(token);
//   const [page, setPage] = useState(1);
//   const tradesPerPage = 20;

//   console.log('PoolData render:', { data, trades, isLoading, error, token });

//   if (isLoading) {
//     return <div className={styles.loading}>Loading pool data...</div>;
//   }

//   if (error) {
//     console.error('Pool data error:', error);
//     return <div className={styles.error}>{error}</div>;
//   }

//   if (!data?.attributes) {
//     console.log('No pool data available');
//     return null;
//   }

//   const {
//     attributes: {
//       transactions = {},
//       price_change_percentage: priceChanges = {},
//       volume_usd: volumeUsd = {}
//     }
//   } = data;

//   if (!transactions.m5 || !transactions.h1 || !priceChanges) {
//     console.log('Missing required data fields');
//     return null;
//   }

//   const formatNumber = (num: number) => {
//     return new Intl.NumberFormat('en-US', {
//       maximumFractionDigits: 2,
//       minimumFractionDigits: 2
//     }).format(num);
//   };

//   const formatVolume = (volume: string) => {
//     return Number(volume).toLocaleString(undefined, { maximumFractionDigits: 0 });
//   };

//   const formatTradeTime = (timestamp: string) => {
//     return new Date(timestamp).toLocaleTimeString();
//   };

//   const totalPages = trades ? Math.ceil(trades.length / tradesPerPage) : 0;
//   const currentTrades = trades ? trades.slice((page - 1) * tradesPerPage, page * tradesPerPage) : [];

//   return (
//     <div className={styles.poolData}>
//       <div className={styles.poolDataSection}>
//         <h3 className={styles.poolDataTitle}>Trading Activity</h3>
//         <div className={styles.poolDataGrid}>
//           <div className={styles.poolDataItem}>
//             <div className={styles.label}>Last 5 Minutes</div>
//             <div className={styles.valueRow}>
//               <div>
//                 <span className={styles.positiveChange}>
//                   Buys: {transactions.m5.buys}
//                 </span>
//               </div>
//               <div>
//                 <span className={styles.negativeChange}>
//                   Sells: {transactions.m5.sells}
//                 </span>
//               </div>
//             </div>
//             <div className={styles.subValue}>
//               Volume: ${formatVolume(volumeUsd.m5)}
//             </div>
//           </div>
//           <div className={styles.poolDataItem}>
//             <div className={styles.label}>Last Hour</div>
//             <div className={styles.valueRow}>
//               <div>
//                 <span className={styles.positiveChange}>
//                   Buys: {transactions.h1.buys}
//                 </span>
//               </div>
//               <div>
//                 <span className={styles.negativeChange}>
//                   Sells: {transactions.h1.sells}
//                 </span>
//               </div>
//             </div>
//             <div className={styles.subValue}>
//               Volume: ${formatVolume(volumeUsd.h1)}
//             </div>
//           </div>
//           <div className={styles.poolDataItem}>
//             <div className={styles.label}>Price Changes</div>
//             <div className={styles.valueColumn}>
//               <div>
//                 1h: <span className={priceChanges.h1 >= 0 ? styles.positiveChange : styles.negativeChange}>
//                   {formatNumber(priceChanges.h1)}%
//                 </span>
//               </div>
//               <div>
//                 24h: <span className={priceChanges.h24 >= 0 ? styles.positiveChange : styles.negativeChange}>
//                   {formatNumber(priceChanges.h24)}%
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {trades && trades.length > 0 && (
//         <div className={styles.poolDataSection}>
//           <div className={styles.sectionHeader}>
//             <h3 className={styles.poolDataTitle}>Recent Trades</h3>
//             <div className={styles.pagination}>
//               <button 
//                 className={styles.paginationButton} 
//                 onClick={() => setPage(p => Math.max(1, p - 1))}
//                 disabled={page === 1}
//               >
//                 Previous
//               </button>
//               <span className={styles.pageInfo}>
//                 {page} / {totalPages}
//               </span>
//               <button 
//                 className={styles.paginationButton} 
//                 onClick={() => setPage(p => Math.min(totalPages, p + 1))}
//                 disabled={page >= totalPages}
//               >
//                 Next
//               </button>
//             </div>
//           </div>
//           <div className={styles.tradesGrid}>
//             {currentTrades.map((trade: any) => {
//                 const isBuy = trade.attributes.kind === 'buy';
//                 const tokenAmount = isBuy 
//                 ? trade.attributes.to_token_amount 
//                 : trade.attributes.from_token_amount;
//                 // const tokenPrice = isBuy 
//                 // ? trade.attributes.price_to_in_usd 
//                 // : trade.attributes.price_from_in_usd;

//                 return (
//                 <div key={trade.id} className={styles.tradeItem}>
//                     <div className={styles.tradeTime}>
//                     {formatTradeTime(trade.attributes.block_timestamp)}
//                     </div>
//                     <div className={styles.tradeType}>
//                     <span className={isBuy ? styles.positiveChange : styles.negativeChange}>
//                         {isBuy ? 'Buy' : 'Sell'}
//                     </span>
//                     </div>
//                     <div className={styles.tradeAmount}>
//                     {Number(tokenAmount).toFixed(2)}
//                     </div>
//                     <div className={styles.tradeTotalValue}>
//                     ${Number(trade.attributes.volume_in_usd).toLocaleString(undefined, { 
//                         maximumFractionDigits: 2 
//                     })}
//                     </div>
//                 </div>
//                 );
//             })}
//             </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PoolData;