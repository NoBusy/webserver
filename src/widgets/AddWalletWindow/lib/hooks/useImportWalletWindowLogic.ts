import { getSelectedNetwork, getWallets, Network, Wallet, walletActions, walletApi } from '@/entities/Wallet';
import { getWindowsOpen, globalActions, GlobalWindow } from '@/entities/Global';
import { useToasts } from '@/shared/lib/hooks/useToasts/useToasts';
import { useDispatch, useSelector } from 'react-redux';
import React, { useState } from 'react';
import { useWalletUpdater } from '@/shared/lib/hooks/useWalletUpdate/useWalletUpdate';
import { useHapticFeedback } from '@/shared/lib/hooks/useHapticFeedback/useHapticFeedback';

export const useImportWalletWindowLogic = () => {
  const dispatch = useDispatch();
  const { errorToast, successToast } = useToasts();
  const { notify } = useHapticFeedback();


  const [importWalletRequest, importWalletResult] = walletApi.useImportWalletMutation();
  const [getWalletsRequest] = walletApi.useLazyGetWalletsQuery();
  const [mnemonic, setMnemonic] = useState<string>('');
  const [walletName, setWalletName] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const selectedNetwork: Network | undefined = useSelector(getSelectedNetwork);
  const isWindowOpen: boolean = useSelector(getWindowsOpen).some((w) => w.window === GlobalWindow.ImportWallet);
  const wallets: Wallet[] = useSelector(getWallets);

  const handleImportWallet = async () => {
    try {
      setIsLoading(true);
      if (!walletName || !selectedNetwork || !mnemonic) return;

      if (wallets.find((w) => w.name === walletName)) {
        notify('error')
        errorToast('Wallet name already exists');
        return;
      }

      const result = await importWalletRequest({
        name: walletName,
        network: selectedNetwork,
        mnemonic: mnemonic,
      }).unwrap();

      if (result.ok && result.data) {
        dispatch(walletActions.setSelectedWallet(result.data));
        notify('success')
        successToast('Wallet import successfully');
        dispatch(globalActions.removeAllWindows());
      }
    } catch (e) {
      notify('error')
      errorToast('Failed to import wallet');
      dispatch(globalActions.removeLastWindow());
    } finally {
      setIsLoading(false);
      setWalletName('');
      setMnemonic('');
     // getWalletsRequest();
    }
  };

  const handleWalletNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWalletName(e.target.value);
  };

  const handlePrivateKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMnemonic(e.target.value);
  };

  return {
    flow: {
      handleImportWallet,
      handleWalletNameChange,
      handlePrivateKeyChange,
    },
    state: {
      walletName,
      mnemonic,
      isWindowOpen,
      network: selectedNetwork,
      isLoading: isLoading || importWalletResult.isLoading,
      isBtnActive: Boolean(walletName && mnemonic && selectedNetwork),
    },
  };
};
