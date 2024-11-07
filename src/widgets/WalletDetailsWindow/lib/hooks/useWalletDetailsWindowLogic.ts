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
  const [showPrivateKey, setShowPrivateKey] = useState<boolean>(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);

  const handleCopyPrivateKey = async () => {
    if (openedWallet?.private_key) {
      navigator.clipboard.writeText(openedWallet.private_key);
      setIsPopoverOpen(false);
      notify('success')
      successToast('Seed phrase copied');
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


  return {
    flow: {
      handleDeleteWallet,
      handleShowPrivateKey,
      handleCopyPrivateKey
    },
    state: {
      wallets,
      isWindowOpen,
      openedWallet,
      isWindowCurrentlyOpen,
      isLoading: isLoading || deleteWalletResult.isLoading,
      isBtnActive: isWindowCurrentlyOpen && openedWallet?.can_deleted,
      showPrivateKeyWarning, setShowPrivateKeyWarning,
      showPrivateKey, setShowPrivateKey,
      isPopoverOpen, setIsPopoverOpen
    },
  };
};

