import {  useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getSelectedWallet, walletActions } from '@/entities/Wallet';
import { walletApi } from '@/entities/Wallet/api/walletApi';


export const useWalletUpdater = () => {
  const selectedWallet = useSelector(getSelectedWallet);
  const dispatch = useDispatch();
  const [getWalletSilent] = walletApi.useLazyGetWalletSilentQuery();
  const lastUpdateTime = useRef(0);
  const isUpdating = useRef(false);
  const delayedUpdateTimeout = useRef<NodeJS.Timeout | null>(null);

  
  const clearDelayedUpdate = useCallback(() => {
    if (delayedUpdateTimeout.current) {
      clearTimeout(delayedUpdateTimeout.current);
      delayedUpdateTimeout.current = null;
    }
  }, []);

  const updateWalletData = useCallback(async () => {
    if (isUpdating.current) return;

    const now = Date.now();
    if (!selectedWallet || now - lastUpdateTime.current < 3000) return;

    isUpdating.current = true;

    try {
      const result = await getWalletSilent(selectedWallet.id).unwrap();
      if (result?.data) {
        dispatch(walletActions.setSelectedWallet(result.data));
        lastUpdateTime.current = now;
      }
    } catch (error) {
      console.error('Failed to update wallet data:', error);
    } finally {
      isUpdating.current = false;
    }
  }, [selectedWallet, getWalletSilent, dispatch]);

  
  const updateAfterDelay = useCallback((delay: number) => {
    clearDelayedUpdate(); 

    delayedUpdateTimeout.current = setTimeout(() => {
      updateWalletData();
    }, delay);
  }, [updateWalletData, clearDelayedUpdate]);

  
  useEffect(() => {
    return clearDelayedUpdate;
  }, [clearDelayedUpdate]);

  return {
    updateWalletData,
    updateAfterDelay
  };
};
