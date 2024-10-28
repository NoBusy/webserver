import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Window } from '@/shared/ui/Window/Window';
import { Flex } from '@/shared/ui/Flex/Flex';
import { Button } from '@/shared/ui/Button/Button';
import { Typography } from '@/shared/ui/Typography/Typography';
import { getTokenImage } from '../../lib/helpers/getTokenImage';
import { Token, getSelectedToken, walletActions, Transaction as TransactionInterface } from '@/entities/Wallet';
import { globalActions, GlobalWindow, getIsWindowOpen } from '@/entities/Global';
import { useSwapWindowLogic } from '@/widgets/SwapWindow/lib/hooks/useSwapWindowLogic';
import { useTransferWindowLogic } from '@/widgets/TransferWindow/lib/hooks/useTransferWindowLogic';
import { useToasts } from '@/shared/lib/hooks/useToasts/useToasts';
import { DepositFillIcon } from '@/shared/assets/icons/DepositFillIcon';
import { SendFillIcon } from '@/shared/assets/icons/SendFillIcon';
import { SwapFillIcon } from '@/shared/assets/icons/SwapFillIcon';
import Image from 'next/image';
import { StateSchema } from '@/shared/lib/providers/StoreProvider';
import { useTokenTransactionsWindowLogic } from './useTokenTransactionWindowLogic';
import moment from 'moment';
import { Transaction } from '@/widgets/TransactionsHistoryWindow/ui/Transaction';
import { WindowHeader } from '@/shared/ui/Header/WindowHeader';
import notrans from '@/shared/assets/icons/notransicon.svg';
import TokenInfoBlock from '@/widgets/SwapWindow/ui/TokenInfoBlock';
import styles from '@/widgets/SwapWindow/ui/PrepareSwapWindow.module.scss';
import { useToastManager } from '@/shared/lib/hooks/useToastManager/useToastManager';
import { AnimatePresence, motion } from 'framer-motion';
import Spinner from '@/shared/ui/Spinner/Spinner';

export const TokenDetailsWindow: React.FC = () => {
  const dispatch = useDispatch();
  const swapLogic = useSwapWindowLogic();
  const transferLogic = useTransferWindowLogic();
  const { errorToast } = useToasts();
  const { showToast } = useToastManager({maxCount: 2});

  const selectedToken = useSelector(getSelectedToken);
  const isWindowOpen = useSelector((state: StateSchema) => getIsWindowOpen(state)(GlobalWindow.TokenDetails));
  const isTokenInfoWindowOpen = useSelector((state: StateSchema) => getIsWindowOpen(state)(GlobalWindow.TokenInfo));

  const { state: tokenTransactionsState } = useTokenTransactionsWindowLogic();
  const { state: swapState, flow: swapFlow } = swapLogic;

  const [isInfoLoaded, setIsInfoLoaded] = useState(false);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(true);

  const localToken = useMemo(() => selectedToken, [selectedToken]);

  useEffect(() => {
    setIsTransactionsLoading(true);
    const loadTransactions = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000)); 
        setIsTransactionsLoading(false);
      } catch (error) {
        setIsTransactionsLoading(false);
      }
    };

    if (localToken) {
      loadTransactions();
    }
  }, [localToken, errorToast, showToast]);

  const loadTokenInfo = useCallback(async () => {
    if (localToken && !isInfoLoaded) {
      try {
        swapFlow.handleSelectToToken(localToken);
        setIsInfoLoaded(true);
      } catch (error) {
        showToast(errorToast, 'Failed to load token info')
      }
    }
  }, [localToken, isInfoLoaded, swapFlow, showToast, errorToast]);

  useEffect(() => {
    setIsInfoLoaded(false);
  }, [localToken]);

  const handleClose = useCallback(() => {
    dispatch(globalActions.removeWindow(GlobalWindow.TokenDetails));
    dispatch(walletActions.clearSelectedToken());
  }, [dispatch]);

  const handleDeposit = useCallback(() => {
    dispatch(globalActions.addWindow({ window: GlobalWindow.Deposit }));
    handleClose();
  }, [dispatch, handleClose]);

  const handleSend = useCallback(() => {
    if (localToken && localToken.balance <= 0) {
      showToast(errorToast, 'Insufficient funds');
      return;
    }
    if (localToken) {
      dispatch(walletActions.setSelectedToken(localToken));
      dispatch(globalActions.addWindow({ window: GlobalWindow.Transfer }));
      transferLogic.flow.handleTokenSelect(localToken);
      handleClose();
    }
  }, [localToken, dispatch, showToast, transferLogic.flow, handleClose, errorToast]);

  const handleSwap = useCallback(() => {
    if (localToken && localToken.balance <= 0) {
      showToast(errorToast, 'Insufficient funds');
      return;
    }
    if (localToken) {
      dispatch(walletActions.setSelectedToken(localToken));
      dispatch(globalActions.addWindow({ window: GlobalWindow.Swap }));
      swapFlow.handleSelectFromToken(localToken);
      handleClose();
    }
  }, [localToken, dispatch, errorToast, swapFlow, handleClose]);

  const handleTransactionClick = useCallback((transaction: TransactionInterface) => {
    dispatch(globalActions.addWindow({ window: GlobalWindow.TransactionDetails, payload: transaction }));
    setTimeout(() => {
      dispatch(globalActions.removeWindow(GlobalWindow.TokenDetails));
    }, 50);
  }, [dispatch]);

  const handleShowInfo = useCallback(() => {
    dispatch(globalActions.addWindow({ window: GlobalWindow.TokenInfo }));
    loadTokenInfo();
  }, [dispatch, loadTokenInfo]);

  const handleCloseTokenInfo = useCallback(() => {
    dispatch(globalActions.removeWindow(GlobalWindow.TokenInfo));
  }, [dispatch]);

  if (!localToken) {
    return null;
  }

  return (
    <>
      <Window isOpen={isWindowOpen} onClose={handleClose}>
        <Flex direction="column" align="center" gap={12}>
          <Image width={64} height={64} src={getTokenImage(localToken)} alt={`${localToken.name} icon`} />
          <Flex align="baseline" gap={4}>
            <Typography.Text text={`${localToken.balance !== 0? localToken.balance.toFixed(7) : 0 }`} fontFamily="Clash Display" fontSize={25}/>
            <Typography.Text text={localToken.symbol} fontFamily="Clash Display" fontSize={25} type="secondary"/>
          </Flex>
          <Typography.Text text={`≈ ${localToken.balance_usd.toFixed(2)} $`} type="secondary" />
          
          <button 
            onClick={handleShowInfo} 
            className={styles.actionButton}
          >
            Show Info
          </button>
          
          <Flex gap={8} align="center" justify="center">
            <Button width={100} padding="12px 8px" direction="column" onClick={handleDeposit}>
              <DepositFillIcon />
              <Typography.Text text="Deposit" weight="450" color="var(--accent)" fontSize={14} />
            </Button>
            <Button 
              width={100} 
              padding="12px 8px" 
              direction="column" 
              onClick={handleSend}
            >
              <SendFillIcon />
              <Typography.Text text="Send" weight="450" color="var(--accent)" fontSize={14} />
            </Button>
            <Button 
              width={100} 
              padding="12px 8px" 
              direction="column" 
              onClick={handleSwap}
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
                {isTransactionsLoading && (
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

            {tokenTransactionsState.transactions.length > 0 ? (
              Object.entries(tokenTransactionsState.groupedTransactions).map(([date, transactions]) => (
                <React.Fragment key={date}>
                  <Typography.Text text={moment(date).format('D MMMM YYYY')} type="secondary" />
                  {transactions.map((transaction) => (
                    <Transaction 
                      key={transaction.id} 
                      transaction={transaction}
                      onTransactionClick={() => handleTransactionClick(transaction)}
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

      <Window isOpen={isTokenInfoWindowOpen} onClose={handleCloseTokenInfo}>
        <WindowHeader title="Token Info" isLoading={swapState.isTokenInfoLoading} />
        {isInfoLoaded && swapState.tokenExtendedInfo && swapState.historicalData && (
          <TokenInfoBlock
            token={localToken}
            tokenExtendedInfo={swapState.tokenExtendedInfo}
            tokenImage={getTokenImage(localToken)}
            historicalData={swapState.historicalData}
          />
        )}
      </Window>
    </>
  );
};