import { getSelectedNetwork, getWallets, Network, Wallet, walletActions, walletApi } from '@/entities/Wallet';
import { getIsGlobalLoading, getWindowsOpen, globalActions, GlobalWindow } from '@/entities/Global';
import { useToasts } from '@/shared/lib/hooks/useToasts/useToasts';
import { useDispatch, useSelector } from 'react-redux';
import { useHapticFeedback } from '@/shared/lib/hooks/useHapticFeedback/useHapticFeedback';

export const useNetworksWindowLogic = () => {
  const dispatch = useDispatch();
  const { errorToast } = useToasts();
  const { notify } = useHapticFeedback();

  const [getWalletRequest] = walletApi.useLazyGetWalletQuery();

  const selectedNetwork: Network | undefined = useSelector(getSelectedNetwork);
  const isGlobalLoading: boolean = useSelector(getIsGlobalLoading);
  const isWindowOpen: boolean = useSelector(getWindowsOpen).some((w) => w.window === GlobalWindow.Networks);
  const wallets: Wallet[] = useSelector(getWallets);

  const handleNetworkClick = async (network: Network) => {
    try {
      const wallet: Wallet | undefined = wallets.find((w) => w.network === network);

      if (wallet) {
        const result = await getWalletRequest(wallet.id).unwrap();
        if (result.ok) {
          dispatch(globalActions.removeWindow(GlobalWindow.Networks));
          dispatch(walletActions.setSelectedNetwork(network));
        }
      }
    } catch (e) {
      notify('error')
      errorToast('Failed to get wallet');
    }
  };

  return {
    flow: {
      handleNetworkClick,
    },
    state: {
      isLoading: isGlobalLoading,
      isWindowOpen,
      selectedNetwork,
      networks: Object.values(Network),
    },
  };
};
