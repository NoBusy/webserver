import React from 'react';
import { Window } from '@/shared/ui/Window/Window';
import { Flex } from '@/shared/ui/Flex/Flex';
import { Button } from '@/shared/ui/Button/Button';
import { Typography } from '@/shared/ui/Typography/Typography';
import { getTokenImage } from '../../lib/helpers/getTokenImage';
import { DepositFillIcon } from '@/shared/assets/icons/DepositFillIcon';
import { SendFillIcon } from '@/shared/assets/icons/SendFillIcon';
import { SwapFillIcon } from '@/shared/assets/icons/SwapFillIcon';
import Image from 'next/image';
import { useTokenTransactionsWindowLogic } from './useTokenTransactionWindowLogic';
import moment from 'moment';
import { Transaction } from '@/widgets/TransactionsHistoryWindow/ui/Transaction';
import { WindowHeader } from '@/shared/ui/Header/WindowHeader';
import notrans from '@/shared/assets/icons/notransicon.svg';
import TokenInfoBlock from '@/widgets/SwapWindow/ui/TokenInfoBlock';
import styles from '@/widgets/SwapWindow/ui/PrepareSwapWindow.module.scss';
import { AnimatePresence, motion } from 'framer-motion';
import Spinner from '@/shared/ui/Spinner/Spinner';

export const TokenDetailsWindow: React.FC = () => {
  const { flow, state } = useTokenTransactionsWindowLogic();

  if (!state.selectedToken) {
    return null;
  }

  return (
    <>
      <Window isOpen={state.isWindowOpen} onClose={flow.handleClose}>
        <Flex direction="column" align="center" gap={12}>
          <Image 
            width={64} 
            height={64} 
            src={getTokenImage(state.selectedToken)} 
            alt={`${state.selectedToken.name} icon`}
            style={{ borderRadius: '50%' }}
          />
          <Flex align="baseline" gap={4}>
            <Typography.Text 
              text={flow.formatBalance(state.selectedToken.balance)}
              fontFamily="Clash Display" 
              fontSize={25}
            />
            <Typography.Text 
              text={state.selectedToken.symbol}
              fontFamily="Clash Display" 
              fontSize={25} 
              type="secondary"
            />
          </Flex>
          <Typography.Text 
            text={`≈ ${state.selectedToken.balance_usd.toFixed(2)} $`} 
            type="secondary" 
          />
          
          <button 
            onClick={flow.handleShowInfo} 
            className={styles.actionButton}
          >
            Show Info
          </button>
          
          <Flex gap={8} align="center" justify="center">
            <Button 
              width={100} 
              padding="12px 8px" 
              direction="column" 
              onClick={() => flow.handleAction('deposit')}
            >
              <DepositFillIcon />
              <Typography.Text text="Deposit" weight="450" color="var(--accent)" fontSize={14} />
            </Button>
            <Button 
              width={100} 
              padding="12px 8px" 
              direction="column" 
              onClick={() => flow.handleAction('send')}
            >
              <SendFillIcon />
              <Typography.Text text="Send" weight="450" color="var(--accent)" fontSize={14} />
            </Button>
            <Button 
              width={100} 
              padding="12px 8px" 
              direction="column" 
              onClick={() => flow.handleAction('swap')}
            >
              <SwapFillIcon />
              <Typography.Text text="Swap" weight="450" color="var(--accent)" fontSize={14} />
            </Button>
          </Flex>

          <div style={{ width: '100%', height: '1px', backgroundColor: '#d3d3d3', margin: '16px 0' }} />

          <Flex direction="column" width="100%" gap={8}>
            <Flex align="center" justify="flex-start" height="24px">
              <Typography.Text text="Transaction History" weight={600} fontSize={16} />
              <AnimatePresence>
                {state.isTransactionsLoading && (
                  <motion.div
                    exit={{ width: 0, opacity: 0, paddingLeft: 0 }}
                    animate={{ width: 30.6, opacity: 1, paddingLeft: '9px' }}
                    initial={{ width: 0, opacity: 0, paddingLeft: 0 }}
                    transition={{ ease: [0.32, 0.72, 0, 1], duration: 0.6 }}
                  >
                    <Spinner size="md" />
                  </motion.div>
                )}
              </AnimatePresence>
            </Flex>

            {state.transactions.length > 0 ? (
              Object.entries(state.groupedTransactions).map(([date, transactions]) => (
                <React.Fragment key={date}>
                  <Typography.Text text={moment(date).format('D MMMM YYYY')} type="secondary" />
                  {transactions.map((transaction) => (
                    <Transaction 
                      key={transaction.id} 
                      transaction={transaction}
                      onTransactionClick={() => flow.handleTransactionClick(transaction)}
                    />
                  ))}
                </React.Fragment>
              ))
            ) : (
              <Flex 
                direction="column" 
                align="center" 
                justify="center" 
                style={{ 
                  padding: '20px',
                  minHeight: '400px', 
                  height: '100%'     
                }}
              >
                <Image 
                  src={notrans} 
                  alt="No transactions" 
                  width={120}       
                  height={120}      
                  style={{
                    marginBottom: '16px' 
                  }}
                />
                <Typography.Text 
                  text="No transactions found" 
                  type="secondary" 
                  align="center"
                  fontSize={16}     
                />
              </Flex>
            )}
          </Flex>
        </Flex>
      </Window>

      <Window isOpen={state.isTokenInfoWindowOpen} onClose={flow.handleClose}>
        <WindowHeader title="Token Info" isLoading={state.swapState.isTokenInfoLoading} />
        {state.isInfoLoaded && state.swapState.tokenExtendedInfo && state.swapState.historicalData && (
          <TokenInfoBlock
            token={state.selectedToken}
            tokenExtendedInfo={state.swapState.tokenExtendedInfo}
            tokenImage={getTokenImage(state.selectedToken)}
            //historicalData={state.swapState.historicalData}
          />
        )}
      </Window>
    </>
  );
};
