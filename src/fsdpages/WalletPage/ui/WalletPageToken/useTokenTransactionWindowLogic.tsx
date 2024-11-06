'use client'
import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getSelectedWallet, walletApi, Token, Transaction, walletActions } from '@/entities/Wallet';
import { getIsWindowOpen, GlobalWindow, globalActions } from '@/entities/Global';
import { StateSchema } from '@/shared/lib/providers/StoreProvider';
import { useSwapWindowLogic } from '@/widgets/SwapWindow/lib/hooks/useSwapWindowLogic';
import { useTransferWindowLogic } from '@/widgets/TransferWindow/lib/hooks/useTransferWindowLogic';
import { useToasts } from '@/shared/lib/hooks/useToasts/useToasts';
import { useToastManager } from '@/shared/lib/hooks/useToastManager/useToastManager';
import { useAnimation } from 'framer-motion';

export const useTokenTransactionsWindowLogic = () => {
  const dispatch = useDispatch();
  const { errorToast } = useToasts();
  const { showToast } = useToastManager({ maxCount: 2 });
  const swapLogic = useSwapWindowLogic();
  const transferLogic = useTransferWindowLogic();
  const controls = useAnimation();

  const [isDragging, setIsDragging] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isInfoLoaded, setIsInfoLoaded] = useState(false);
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(true);

  const isWindowOpen = useSelector(getIsWindowOpen)(GlobalWindow.TokenDetails);
  const selectedWallet = useSelector(getSelectedWallet);
  const selectedToken = useSelector((state: StateSchema) => state.wallet.selectedToken);
  const isTokenInfoWindowOpen = useSelector((state: StateSchema) => 
    getIsWindowOpen(state)(GlobalWindow.TokenInfo)
  );

  const { data, isLoading, isError } = walletApi.useGetTokenTransactionsQuery(
    { 
      wallet_id: selectedWallet?.id ?? '', 
      token_symbol: selectedToken?.symbol ?? '' 
    },
    { 
      skip: !selectedWallet || !isWindowOpen || !selectedToken 
    }
  );

  const handleTokenClick = useCallback(async (token: Token) => {
 
    if (!isDragging) {
      dispatch(walletActions.setSelectedToken(token));
      dispatch(globalActions.addWindow({ window: GlobalWindow.TokenDetails }));
    }
  }, [dispatch, isDragging]);

  const handleDragEnd = useCallback((event: any, info: any) => {
    const shouldOpen = !isOpen ? info.offset.x < -40 : info.offset.x > -40;
    if (shouldOpen && !isOpen) {
      controls.start({ x: -80 });
      setIsOpen(true);
    } else {
      controls.start({ x: 0 });
      setIsOpen(false);
    }
    setIsDragging(false);
  }, [controls, isOpen]);

  const handleClose = useCallback(() => {
    dispatch(globalActions.removeWindow(GlobalWindow.TokenDetails));
    dispatch(walletActions.clearSelectedToken());
  }, [dispatch]);

  const handleAction = useCallback(async (action: 'deposit' | 'send' | 'swap') => {
    
    if (!selectedToken) return;
    
    if ((action === 'send' || action === 'swap') && selectedToken.balance <= 0) {
      showToast(errorToast, 'Insufficient funds');
      return;
    }

    switch (action) {
      case 'deposit':
        dispatch(globalActions.addWindow({ window: GlobalWindow.Deposit }));
        break;
      case 'send':
        dispatch(globalActions.addWindow({ window: GlobalWindow.Transfer }));
        transferLogic.flow.handleTokenSelect(selectedToken);
        break;
      case 'swap':
        dispatch(globalActions.addWindow({ window: GlobalWindow.Swap }));
        swapLogic.flow.handleSelectFromToken(selectedToken);
        break;
    }
    handleClose();
  }, [selectedToken, dispatch, showToast, errorToast, transferLogic.flow, swapLogic.flow, handleClose]);

  const handleTransactionClick = useCallback(async (transaction: Transaction) => {
    dispatch(globalActions.addWindow({ 
      window: GlobalWindow.TransactionDetails, 
      payload: transaction 
    }));
    setTimeout(() => {
      dispatch(globalActions.removeWindow(GlobalWindow.TokenDetails));
    }, 50);
  }, [dispatch]);

  const loadTokenInfo = useCallback(async () => {
    if (selectedToken && !isInfoLoaded) {
      try {
        swapLogic.flow.handleSelectToToken(selectedToken);
        setIsInfoLoaded(true);
      } catch (error) {
      
      }
    }
  }, [selectedToken, isInfoLoaded, swapLogic.flow, showToast]);

  const handleShowInfo = useCallback(async () => {
    dispatch(globalActions.addWindow({ window: GlobalWindow.TokenInfo }));
    loadTokenInfo();
  }, [dispatch, loadTokenInfo]);

  const formatBalance = useCallback((balance: number) => {
    return balance !== 0 ? balance.toFixed(7) : '0';
  }, []);

  useEffect(() => {
    setIsInfoLoaded(false);
  }, [selectedToken]);

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

    if (selectedToken) {
      loadTransactions();
    }
  }, [selectedToken]);

  return {
    flow: {
      handleTokenClick,
      handleDragEnd,
      handleClose,
      handleAction,
      handleTransactionClick,
      handleShowInfo,
      setIsDragging,
      controls,
      formatBalance,
    },
    state: {
      isLoading,
      isError,
      isWindowOpen,
      isTokenInfoWindowOpen,
      isInfoLoaded,
      isTransactionsLoading,
      isDragging,
      isOpen,
      selectedToken,
      selectedWallet,
      transactions: data?.data?.transactions ?? [],
      groupedTransactions: data?.data?.groupedTransactions ?? {},
      swapState: swapLogic.state,
      swapFlow: swapLogic.flow,
    },
  };
};