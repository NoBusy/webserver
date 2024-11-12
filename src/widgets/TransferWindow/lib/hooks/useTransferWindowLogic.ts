import { getSelectedToken, getSelectedWallet, Network, Token, Wallet, walletActions, walletApi } from '@/entities/Wallet';
import { getIsWindowOpen, globalActions, GlobalWindow } from '@/entities/Global';
import { useDebounce } from '@/shared/lib/hooks/useDebounce/useDebounce';
import { useToasts } from '@/shared/lib/hooks/useToasts/useToasts';
import { networkSymbol } from '@/shared/consts/networkSymbol';
import { useDispatch, useSelector } from 'react-redux';
import React, { useCallback, useEffect, useState } from 'react';
import { useWalletUpdater } from '@/shared/lib/hooks/useWalletUpdate/useWalletUpdate';
import { useToastManager } from '@/shared/lib/hooks/useToastManager/useToastManager';
import { useHapticFeedback } from '@/shared/lib/hooks/useHapticFeedback/useHapticFeedback';

export const useTransferWindowLogic = () => {
  const { errorToast, successToast } = useToasts();
  const dispatch = useDispatch();
  const selectedToken = useSelector(getSelectedToken);
  const { updateWalletData, updateAfterDelay } = useWalletUpdater();
  const { showToast } = useToastManager({maxCount: 1});
  const { impact, notify} = useHapticFeedback();


  

  const [tokenToTransfer, setTokenToTransfer] = useState<Token | undefined>();
  const [balanceUsd, setBalanceUsd] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toAddress, setToAddress] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [rate, setRate] = useState<number>(0);

  const [getTokenPriceRequest] = walletApi.useLazyGetTokenPriceQuery();
  const [transferRequest] = walletApi.useTransferMutation();

  const selectedWallet: Wallet | undefined = useSelector(getSelectedWallet);
  const isConfirmWindowOpen: boolean = useSelector(getIsWindowOpen)(GlobalWindow.ConfirmTransfer);
  const isSelectTokensWindowOpen: boolean = useSelector(getIsWindowOpen)(GlobalWindow.Transfer);
  const isPrepareTransactionWindowOpen: boolean = useSelector(getIsWindowOpen)(GlobalWindow.PrepareTransfer);

  const handleGetRate = useDebounce(async (amount: string) => {
    try {
      setIsLoading(true);
      if (!tokenToTransfer || !selectedWallet || !amount || Number(amount) > tokenToTransfer?.balance) return;

      const result = await getTokenPriceRequest({
        symbol: tokenToTransfer?.symbol,
        network: selectedWallet?.network,
      }).unwrap();

      if (result.ok && result.data) {
        setRate(result.data.price * Number(amount));
        setBalanceUsd(result.data.price * tokenToTransfer.balance);
      }
    } catch (e) {
    } finally {
      setIsLoading(false);
    }
  }, 350);

  const handleClearState = useCallback(() => {
    setRate(0);
    setAmount('');
    setToAddress('');
    setBalanceUsd(0);
    setTokenToTransfer(undefined);
    dispatch(walletActions.clearSelectedToken());
    dispatch(globalActions.removeAllWindows());
  }, [dispatch]);
  
  useEffect(() => {
    return () => {
      handleClearState();
    };
  }, [handleClearState]);

  
  const handleTransferConfirm = async () => {
    await impact('light')
    try {
      setIsLoading(true);
      if (!tokenToTransfer || !selectedWallet || !toAddress || !amount) return;

      const result = await transferRequest({
        amount: Number(amount),
        currency: tokenToTransfer.symbol,
        token_id: tokenToTransfer.id,
        wallet_id: selectedWallet.id,
        to_address: toAddress,
      }).unwrap();

      if (result.ok) {
        notify('success')
        successToast('Transfer successful');
        handleClearState();
        updateAfterDelay(30000);
      }
    } catch (e) {
      notify('error')
      errorToast('Failed to transfer tokens');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedToken) {
      setTokenToTransfer(selectedToken);
      handleGetRate('0');
    }
  }, [selectedToken]);

  const handleTokenSelect = useCallback( async (token: Token) => {
    setTokenToTransfer(token);
    dispatch(walletActions.setSelectedToken(token));
    dispatch(globalActions.addWindow({ window: GlobalWindow.PrepareTransfer }));
  }, [dispatch]);



  useEffect(() => {
    return () => {
      setTokenToTransfer(undefined); 
    };
  }, []);

  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true);
    if (!tokenToTransfer || !selectedWallet) return;

    const newAmount = e.target.value;
    const isNativeToken = tokenToTransfer.symbol === 'ETH' || 
                         tokenToTransfer.symbol === 'BNB' || 
                         tokenToTransfer.symbol === 'SOL' || 
                         tokenToTransfer.symbol === 'TON';

    if (isNativeToken) {
      const networkFee = NETWORK_FEES[selectedWallet.network];
      if (Number(newAmount) > tokenToTransfer.balance - networkFee) {
        notify('error');
        errorToast(`Insufficient balance to cover network fee (${networkFee} ${tokenToTransfer.symbol})`);
        setIsLoading(false);
        return;
      }
    } else if (Number(newAmount) > tokenToTransfer.balance) {
      notify('error');
      errorToast('Insufficient funds');
      setIsLoading(false);
      return;
    }

    if (!newAmount) {
      setRate(0);
      setAmount('');
      setIsLoading(false);
      return;
    }

    setAmount(newAmount);
    handleGetRate(newAmount);
  }, [tokenToTransfer, selectedWallet, handleGetRate, notify, errorToast]);


  const NETWORK_FEES = {
    [Network.ETH]: 0.008,
    [Network.BSC]: 0.0004,
    [Network.SOL]: 0.00022,
    [Network.TON]: 0.18
  } as const;

  const getMaxAmount = useCallback((token: Token): string => {
    // Проверяем, является ли токен нативным токеном сети
    const isNativeToken = token.symbol === 'ETH' || 
                         token.symbol === 'BNB' || 
                         token.symbol === 'SOL' || 
                         token.symbol === 'TON';

    if (isNativeToken && selectedWallet) {
      // Для нативных токенов вычитаем комиссию
      const networkFee = NETWORK_FEES[selectedWallet.network];
      const maxAmount = token.balance - networkFee;
      
      // Проверяем, что после вычета комиссии сумма положительная
      if (maxAmount <= 0) {
        notify('error');
        errorToast(`Insufficient balance to cover network fee (${networkFee} ${token.symbol})`);
        return '0';
      }
      
      // Округляем до 9 знаков после запятой для большей точности
      return maxAmount.toFixed(9);
    }
    
    // Для не-нативных токенов возвращаем весь баланс
    return token.balance.toString();
  }, [selectedWallet, notify, errorToast]);

  const handleMaxButtonClick = useCallback(() => {
    if (!tokenToTransfer) return;

    const maxAmount = getMaxAmount(tokenToTransfer);
    setAmount(maxAmount);
    handleGetRate(maxAmount);
  }, [tokenToTransfer, getMaxAmount, handleGetRate]);


  const handleToAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!tokenToTransfer) return;

    if (!e.target.value) {
      setToAddress('');
      return;
    }

    const tonAddressRegex: RegExp = /^(EQ|UQ)[a-zA-Z0-9_-]{46}$/;
    const ethAddressRegex: RegExp = /^0x[a-fA-F0-9]{40}$/;
    const solAddressRegex: RegExp = /^([a-zA-Z0-9]{32}|[a-zA-Z0-9]{43}|[a-zA-Z0-9]{44})$/;
    const bscAddressRegex: RegExp = /^0x[a-fA-F0-9]{40}$/;

    let regex: RegExp = ethAddressRegex;
    const isSenderAddress: boolean = toAddress === selectedWallet?.address;

    if (isSenderAddress) {
      notify('error')
      errorToast('Please, enter the recipient address, not the sender address');
      return;
    }

    switch (tokenToTransfer?.network) {
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
    }

    if (regex.test(e.target.value)) {
      setToAddress(e.target.value);
    } else {
      notify('error')
      errorToast(`Invalid ${networkSymbol[tokenToTransfer.network]} address`);
    }
  };

  const handleOpenConfirmWindow = async () => {
    dispatch(globalActions.addWindow({ window: GlobalWindow.ConfirmTransfer }));
  };

  useEffect(() => {
    isPrepareTransactionWindowOpen && handleGetRate('0');
  }, [isPrepareTransactionWindowOpen]);

  return {
    flow: {
      handleTokenSelect,
      handleAmountChange,
      handleTransferConfirm,
      handleMaxButtonClick,
      handleToAddressChange,
      handleOpenConfirmWindow,
    },
    state: {
      amount,
      rate,
      tokenToTransfer,
      balanceUsd,
      toAddress,
      isConfirmWindowOpen,
      isLoading,
      isPrepareTransactionWindowOpen,
      isSelectTokensWindowOpen,
      selectedWallet,
      tokens: selectedWallet?.tokens ? selectedWallet?.tokens.filter((t) => t.balance > 0) : [],
      network: selectedWallet?.network,
      isPrepareWindowBtnDisabled: !tokenToTransfer || !toAddress || !amount || isLoading || Number(amount) > tokenToTransfer.balance,
      isNoTokensToTransfer: selectedWallet?.tokens?.filter((t) => t.balance > 0)?.length === 0,
    },
  };
};

export type UseTransferWindowLogic = ReturnType<typeof useTransferWindowLogic>;
