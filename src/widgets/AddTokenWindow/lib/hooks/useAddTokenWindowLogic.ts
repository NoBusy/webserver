import { getSelectedWallet, Network, Wallet, walletApi } from '@/entities/Wallet';
import { useDebounce } from '@/shared/lib/hooks/useDebounce/useDebounce';
import { useToasts } from '@/shared/lib/hooks/useToasts/useToasts';
import { getWindowsOpen, globalActions, GlobalWindow } from '@/entities/Global';
import { GetTokenInfoResult } from '@/entities/Wallet';
import { ChangeEvent, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useToastManager } from '@/shared/lib/hooks/useToastManager/useToastManager';
import { useHapticFeedback } from '@/shared/lib/hooks/useHapticFeedback/useHapticFeedback';
import { networkSymbol } from '@/shared/consts/networkSymbol';

export const useAddTokenWindowLogic = () => {
  const dispatch = useDispatch();
  const { errorToast, successToast } = useToasts();
  const { showToast } = useToastManager({maxCount: 1});
  const { notify } = useHapticFeedback();

  const [getTokenInfoRequest, getTokenInfoResult] = walletApi.useLazyGetTokenInfoQuery();
  const [getWalletsRequest] = walletApi.useLazyGetWalletsQuery();
  const [addTokenRequest, addTokenResult] = walletApi.useAddWalletTokenMutation();

  const [tokenAddress, setTokenAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [tokenInfo, setTokenInfo] = useState<GetTokenInfoResult>();

  const selectedWallet: Wallet | undefined = useSelector(getSelectedWallet);
  const isWindowOpen: boolean = useSelector(getWindowsOpen).some((w) => w.window === GlobalWindow.AddToken);

  const validateTokenAddress = (address: string, network: Network): boolean => {
    const tonAddressRegex: RegExp = /^(EQ|UQ)[a-zA-Z0-9_-]{46}$/;
    const ethAddressRegex: RegExp = /^0x[a-fA-F0-9]{40}$/;
    const solAddressRegex: RegExp = /^([a-zA-Z0-9]{32}|[a-zA-Z0-9]{43}|[a-zA-Z0-9]{44})$/;
    const bscAddressRegex: RegExp = /^0x[a-fA-F0-9]{40}$/;

    let regex: RegExp;
    
    switch (network) {
      case Network.ETH:
        regex = ethAddressRegex;
        break;
      case Network.SOL:
        regex = solAddressRegex;
        break;
      case Network.TON:
        regex = tonAddressRegex;
        break;
      case Network.BSC:
        regex = bscAddressRegex;
        break;
      default:
        return false;
    }

    return regex.test(address);
  };

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
      setTokenInfo(undefined);
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
        notify('error');
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
        notify('success');
        successToast('Token added');
        dispatch(globalActions.removeWindow(GlobalWindow.AddToken));
        getWalletsRequest();
      }
    } catch (e) {
      showToast(errorToast, 'Token not found');
    } finally {
      setTokenInfo(undefined);
      setIsLoading(false);
      setTokenAddress('');
    }
  };

  const handleTokenAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true);
    
    if (!e.target.value) {
      setTokenAddress('');
      setTokenInfo(undefined);
      setIsLoading(false);
      return;
    }

    if (!selectedWallet) {
      notify('error');
      errorToast('Please select a wallet first');
      setIsLoading(false);
      return;
    }

    // Validate address format based on network
    if (!validateTokenAddress(e.target.value, selectedWallet.network)) {
      notify('error');
      errorToast(`Invalid ${networkSymbol[selectedWallet.network]} token address`);
      setIsLoading(false);
      return;
    }

    setTokenAddress(e.target.value);
    handleGetTokenInfo(e.target.value);
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