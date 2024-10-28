import { getSelectedWallet, Wallet, walletApi } from '@/entities/Wallet';
import { useDebounce } from '@/shared/lib/hooks/useDebounce/useDebounce';
import { useToasts } from '@/shared/lib/hooks/useToasts/useToasts';
import { getWindowsOpen, GlobalWindow } from '@/entities/Global';
import { GetTokenInfoResult } from '@/entities/Wallet';
import { ChangeEvent, useState } from 'react';
import { useSelector } from 'react-redux';
import { useToastManager } from '@/shared/lib/hooks/useToastManager/useToastManager';



export const useAddTokenWindowLogic = () => {
  const { errorToast, successToast } = useToasts();
  const { showToast } = useToastManager({maxCount: 1});

  


  const [getTokenInfoRequest, getTokenInfoResult] = walletApi.useLazyGetTokenInfoQuery();
  const [getWalletsRequest] = walletApi.useLazyGetWalletsQuery();
  const [addTokenRequest, addTokenResult] = walletApi.useAddWalletTokenMutation();

  const [tokenAddress, setTokenAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tokenInfo, setTokenInfo] = useState<GetTokenInfoResult>();

  const selectedWallet: Wallet | undefined = useSelector(getSelectedWallet);
  const isWindowOpen: boolean = useSelector(getWindowsOpen).some((w) => w.window === GlobalWindow.AddToken);

  const handleGetTokenInfo = useDebounce(async (tokenAddress: string) => {
    try {
      if (!tokenAddress || !selectedWallet) return;
      setIsLoading(true);

      const result = await getTokenInfoRequest({
        network: selectedWallet?.network,
        contract: tokenAddress,
      }).unwrap();

      setTokenInfo(result.data);
    } catch (e) {
      showToast(errorToast, 'Failed to get token info');
    } finally {
      setIsLoading(false);
    }
  }, 350);

  const handleAddWalletToken = async () => {
    try {
      if (!selectedWallet || !tokenAddress) return;
      setIsLoading(true);

      const isTokenAlreadyAdded: boolean = selectedWallet.tokens.some((t) => t.contract === tokenAddress);

      if (isTokenAlreadyAdded) {
        errorToast('Token already added');
        return;
      }

      const result = await addTokenRequest({
        wallet_id: selectedWallet.id,
        wallet_address: selectedWallet.address,
        network: selectedWallet.network,
        contract: tokenAddress,
      }).unwrap();

      if (result.ok) {
        successToast('Token added');
        getWalletsRequest();
      }
    } catch (e) {
      showToast(errorToast, 'Failed to add token');
    } finally {
      setTokenInfo(undefined);
      setIsLoading(false);
      setTokenAddress('');
    }
  };

  const handleTokenAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true);
    setTokenAddress(e.target.value);
    if (e.target.value) {
      handleGetTokenInfo(e.target.value);
    } else {
      setTokenInfo(undefined);
      setIsLoading(false);
    }
  };

  return {
    flow: {
      handleAddWalletToken,
      handleGetTokenInfo,
      handleTokenAddressChange,
    },
    state: {
      tokenInfo,
      isWindowOpen,
      tokenAddress,
      network: selectedWallet?.network,
      isLoading: getTokenInfoResult.isLoading || isLoading || addTokenResult.isLoading,
      isBtnActive: !!tokenAddress && !!tokenInfo,
    },
  };
};
