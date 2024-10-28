import { getSelectedToken, getSelectedWallet, Network, Token, Wallet, walletActions, walletApi } from '@/entities/Wallet';
import { getIsWindowOpen, globalActions, GlobalWindow } from '@/entities/Global';
import { useDebounce } from '@/shared/lib/hooks/useDebounce/useDebounce';
import { useToasts } from '@/shared/lib/hooks/useToasts/useToasts';
import { networkSymbol } from '@/shared/consts/networkSymbol';
import { useDispatch, useSelector } from 'react-redux';
import React, { useCallback, useEffect, useState } from 'react';
import { useWalletUpdater } from '@/shared/lib/hooks/useWalletUpdate/useWalletUpdate';
import { useToastManager } from '@/shared/lib/hooks/useToastManager/useToastManager';

export const useTransferWindowLogic = () => {
  const { errorToast, successToast } = useToasts();
  const dispatch = useDispatch();
  const selectedToken = useSelector(getSelectedToken);
  const { updateWalletData, updateAfterDelay } = useWalletUpdater();
  const { showToast } = useToastManager({maxCount: 1});


  

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
      showToast(errorToast, 'Failed to get token price');
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
        successToast('Transfer successful');
        handleClearState();
        updateAfterDelay(30000);
      }
    } catch (e) {
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

  const handleTokenSelect = useCallback((token: Token) => {
    setTokenToTransfer(token);
    dispatch(walletActions.setSelectedToken(token));
    dispatch(globalActions.addWindow({ window: GlobalWindow.PrepareTransfer }));
  }, [dispatch]);



  useEffect(() => {
    return () => {
      setTokenToTransfer(undefined); 
    };
  }, []);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true);
    if (!tokenToTransfer) return;

    if (Number(e.target.value) > tokenToTransfer?.balance) {
      errorToast('Insufficient funds');
    }

    if (!e.target.value) {
      setRate(0);
      setAmount('');
      setIsLoading(false);
      return;
    } else {
      setAmount(e.target.value);
      handleGetRate(e.target.value);
    }
  };

  const handleMaxButtonClick = () => {
    tokenToTransfer && setAmount(tokenToTransfer.balance.toString());
  };

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
      errorToast(`Invalid ${networkSymbol[tokenToTransfer.network]} address`);
    }
  };

  const handleOpenConfirmWindow = () => {
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
