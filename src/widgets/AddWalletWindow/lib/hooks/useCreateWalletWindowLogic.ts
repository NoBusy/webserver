import { getSelectedNetwork, getWallets, Network, Wallet, walletActions, walletApi } from '@/entities/Wallet';
import { getWindowsOpen, globalActions, GlobalWindow } from '@/entities/Global';
import { useToasts } from '@/shared/lib/hooks/useToasts/useToasts';
import { useDispatch, useSelector } from 'react-redux';
import React, { useState } from 'react';

export const useCreateWalletWindowLogic = () => {
  const dispatch = useDispatch();
  const { errorToast, successToast } = useToasts();

  const [createWalletRequest, createWalletResult] = walletApi.useCreateWalletMutation();
  const [getWalletsRequest] = walletApi.useLazyGetWalletsQuery();
  const [walletName, setWalletName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const selectedNetwork: Network | undefined = useSelector(getSelectedNetwork);
  const isWindowOpen: boolean = useSelector(getWindowsOpen).some((w) => w.window === GlobalWindow.CreateWallet);
  const wallets: Wallet[] = useSelector(getWallets);


  const handleCreateWallet = async () => {
    try {
      setIsLoading(true);
      if (!walletName || !selectedNetwork) return;

      if (wallets.find((w) => w.name === walletName)) {
        errorToast('Wallet name already exists');
        return;
      }

      const result = await createWalletRequest({
        name: walletName,
        network: selectedNetwork,
      }).unwrap();

      if (result.ok && result.data) {
        dispatch(walletActions.setSelectedWallet(result.data));
        successToast('Wallet created successfully');
        dispatch(globalActions.removeAllWindows());
      }
    } catch (e) {
      errorToast('Failed to create wallet');
      dispatch(globalActions.removeLastWindow());
    } finally {
      setIsLoading(false);
      setWalletName('');
      getWalletsRequest();
    }
  };

  const handleWalletNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWalletName(e.target.value);
  };

  return {
    flow: {
      handleCreateWallet,
      handleWalletNameChange,
    },
    state: {
      walletName,
      isWindowOpen,
      network: selectedNetwork,
      isLoading: isLoading || createWalletResult.isLoading,
      isBtnActive: Boolean(walletName && selectedNetwork),
    },
  };
};
