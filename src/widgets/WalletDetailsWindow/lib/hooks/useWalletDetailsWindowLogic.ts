import { getIsWindowCurrentlyOpen, getIsWindowOpen, getOpenedWindow, globalActions, GlobalWindow, GlobalWindowType } from '@/entities/Global';
import { getWallets, Wallet, walletActions, walletApi } from '@/entities/Wallet';
import { useToasts } from '@/shared/lib/hooks/useToasts/useToasts';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import { useWalletUpdater } from '@/shared/lib/hooks/useWalletUpdate/useWalletUpdate';
import { useHapticFeedback } from '@/shared/lib/hooks/useHapticFeedback/useHapticFeedback';

export const useWalletDetailsWindowLogic = () => {
  const dispatch = useDispatch();
  const { errorToast, successToast } = useToasts();
  const { notify } = useHapticFeedback();

  const [deleteWalletRequest, deleteWalletResult] = walletApi.useDeleteWalletMutation();
  const [getWalletsRequest] = walletApi.useLazyGetWalletsQuery();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const walletDetailsWindow: GlobalWindowType<GlobalWindow> | undefined = useSelector(getOpenedWindow)(GlobalWindow.WalletDetails);
  const isWindowCurrentlyOpen: boolean = useSelector(getIsWindowCurrentlyOpen)(GlobalWindow.WalletDetails);
  const isWindowOpen: boolean = useSelector(getIsWindowOpen)(GlobalWindow.WalletDetails);
  const openedWallet: Wallet | undefined = walletDetailsWindow?.payload?.wallet;
  const wallets: Wallet[] = useSelector(getWallets);
  const [showPrivateKeyWarning, setShowPrivateKeyWarning] = useState(false);
  const [showPrivateKey, setShowPrivateKey] = useState(false);

  const handlePrivateKeyClick = () => {
    console.log('Private key field clicked');
    if (!showPrivateKey) {
      setShowPrivateKey(true);
    }
  }

  const handleShowPrivateKey = () => {
    setShowPrivateKey(true);
    setShowPrivateKeyWarning(false);
  }

  const handleDeleteWallet = async (): Promise<void> => {
    try {
      if (!openedWallet || !wallets.length) return;
      setIsLoading(true);

      const result = await deleteWalletRequest({
        id: openedWallet.id,
      }).unwrap();

      if (result.ok) {
        notify('success')
        successToast('Wallet deleted');
        //getWalletsRequest();
        const wallet: Wallet | undefined = wallets.find((w) => w.id === openedWallet.id);
        wallet && dispatch(walletActions.setSelectedWallet(wallet));
        dispatch(globalActions.removeLastWindow());
      }
    } catch (e) {
      notify('error')
      errorToast(`Failed to delete wallet`);
    } finally {
      setIsLoading(false);
    }
  };

  console.log('Warning modal state:', showPrivateKeyWarning);

  return {
    flow: {
      handleDeleteWallet,
      handlePrivateKeyClick,
      handleShowPrivateKey
    },
    state: {
      wallets,
      isWindowOpen,
      openedWallet,
      isWindowCurrentlyOpen,
      isLoading: isLoading || deleteWalletResult.isLoading,
      isBtnActive: isWindowCurrentlyOpen && openedWallet?.can_deleted,
      showPrivateKeyWarning, setShowPrivateKeyWarning,
      showPrivateKey, setShowPrivateKey
    },
  };
};
