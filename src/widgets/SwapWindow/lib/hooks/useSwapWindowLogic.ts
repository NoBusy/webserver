import { getSelectedToken, getSelectedWallet, Network, Token, Wallet, walletActions, walletApi } from '@/entities/Wallet';
import { getIsWindowOpen, globalActions, GlobalWindow } from '@/entities/Global';
import { useDebounce } from '@/shared/lib/hooks/useDebounce/useDebounce';
import { useToasts } from '@/shared/lib/hooks/useToasts/useToasts';
import { useDispatch, useSelector } from 'react-redux';
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useWalletUpdater } from '@/shared/lib/hooks/useWalletUpdate/useWalletUpdate';
import { useToastManager } from '@/shared/lib/hooks/useToastManager/useToastManager';
import { useHapticFeedback } from '@/shared/lib/hooks/useHapticFeedback/useHapticFeedback';

export const useSwapWindowLogic = () => {
  const { errorToast, successToast } = useToasts();
  const { showToast } = useToastManager({maxCount: 1});
  const dispatch = useDispatch();
  const selectedToken = useSelector(getSelectedToken);
  const { updateWalletData, updateAfterDelay } = useWalletUpdater();
  const { impact, notify } = useHapticFeedback();

  const [fromToken, setFromToken] = useState<Token | undefined>();
  const [toToken, setToToken] = useState<Token | undefined>();
  const [fromAmount, setFromAmount] = useState<string>('');
  const [toAmount, setToAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rate, setRate] = useState<number>(0);
  const [currentView, setCurrentView] = useState<'swap' | 'selectFromToken' | 'selectToToken'>('swap');
  const [tokenExtendedInfo, setTokenExtendedInfo] = useState<any>(null);
  const [isTokenInfoLoading, setIsTokenInfoLoading] = useState<boolean>(false);
  const [getHistoricalQuotesRequest] = walletApi.useLazyGetHistoricalQuotesQuery();
  const [historicalData, setHistoricalData] = useState<{ timestamp: string; price: number }[]>([]);
  const [estimatedFee, setEstimatedFee] = useState({ estimated_fee: 0, estimated_fee_usd: 0 });

  const [getTokenPriceRequest] = walletApi.useLazyGetTokenPriceQuery();
  const [swapRequest, { isLoading: isSwapLoading }] = walletApi.useSwapMutation();
  const [getTokenExtendedInfoRequest] = walletApi.useLazyGetTokenExtendedInfoQuery();
  const [addTokenRequest, addTokenResult] = walletApi.useAddWalletTokenMutation();
  const [getWalletsRequest] = walletApi.useLazyGetWalletsQuery();
  const [getTokenInfoRequest, getTokenInfoResult] = walletApi.useLazyGetTokenInfoQuery();

  const selectedWallet: Wallet | undefined = useSelector(getSelectedWallet);
  const isSwapWindowOpen: boolean = useSelector(getIsWindowOpen)(GlobalWindow.Swap);
  const isConfirmSwapWindowOpen: boolean = useSelector(getIsWindowOpen)(GlobalWindow.ConfirmSwap);
  const isSelectTokenWindowOpen: boolean = useSelector(getIsWindowOpen)(GlobalWindow.SelectToken);

  const [slippage, setSlippage] = useState<number>(5);


  const setInitialTokens = async (params: { fromToken: string; toToken: string; network: string }) => {
    try {
      setIsLoading(true);
      
      if (!selectedWallet?.tokens) {
        throw new Error('No wallet tokens available');
      }
  
      const network = params.network as Network;
  
      // Ищем токены
      let fromTokenData = selectedWallet.tokens.find(t => {
        if (!params.fromToken || params.fromToken === 'native') {
          return t.network === network && t.contract === null;
        }
        return t.contract?.toLowerCase() === params.fromToken.toLowerCase();
      });
  
      let toTokenData = selectedWallet.tokens.find(t => {
        if (!params.toToken || params.toToken === 'native') {
          return t.network === network && t.contract === null;
        }
        return t.contract?.toLowerCase() === params.toToken.toLowerCase();
      });
  
      // Если не нашли toToken и это не нативный токен, получаем информацию и создаем
      if (!toTokenData && params.toToken && params.toToken !== 'native') {
        const result = await getTokenInfoRequest({
          network,
          contract: params.toToken,
        }).unwrap();
  
        if (result.ok && result.data) {
          const currentDate = new Date().toISOString();
          toTokenData = {
            id: result.data.contract,
            wallet_id: selectedWallet.id,
            symbol: result.data.symbol,
            network,
            name: result.data.name,
            contract: params.toToken,
            balance: 0,
            balance_usd: 0,
            price: result.data.price,
            price_change_percentage: result.data.price_change_percentage || 0,
            icon: result.data.icon || '',
            added_at: currentDate,
            updated_at: currentDate,
          };
  
          // Добавляем токен в кошелек
          await addTokenRequest({
            wallet_id: selectedWallet.id,
            wallet_address: selectedWallet.address,
            network,
            contract: params.toToken,
          }).unwrap();
        }
      }
  
    
      if (!fromTokenData && params.fromToken && params.fromToken !== 'native') {
        const result = await getTokenInfoRequest({
          network,
          contract: params.fromToken,
        }).unwrap();
  
        if (result.ok && result.data) {
          const currentDate = new Date().toISOString();
          fromTokenData = {
            id: result.data.contract,
            wallet_id: selectedWallet.id,
            symbol: result.data.symbol,
            network,
            name: result.data.name,
            contract: params.fromToken,
            balance: 0,
            balance_usd: 0,
            price: result.data.price,
            price_change_percentage: result.data.price_change_percentage || 0,
            icon: result.data.icon || '',
            added_at: currentDate,
            updated_at: currentDate,
          };
  
          await addTokenRequest({
            wallet_id: selectedWallet.id,
            wallet_address: selectedWallet.address,
            network,
            contract: params.fromToken,
          }).unwrap();
        }
      }
  
      if (!fromTokenData || !toTokenData) {
        throw new Error('Tokens not found in wallet');
      }
  
      setFromToken(fromTokenData);
      setToToken(toTokenData);

      if (toTokenData && selectedWallet?.network) {
        handleGetTokenExtendedInfo(toTokenData, selectedWallet.network);
      }
      
    } catch (error) {
     // console.error('Failed to set initial tokens:', error);
      showToast(errorToast, 'Failed to load tokens');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSlippage = (newSlippage: number) => {
    setSlippage(newSlippage);
  };

  const fromTokens = useMemo(() => 
    selectedWallet?.tokens ? selectedWallet.tokens.filter((t) => t.balance > 0) : [],
    [selectedWallet]
  );

  const toTokens = useMemo(() => 
    selectedWallet?.tokens ? selectedWallet.tokens : [],
    [selectedWallet]
  );

  const handleGetHistoricalQuotes = useDebounce(async (token: Token) => {
    try {
      setIsLoading(true);
      const result = await getHistoricalQuotesRequest({
        id: token.id,
        symbol: token.symbol,
        address: token.contract,
        timeStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        timeEnd: new Date().toISOString(),
        interval: '1d',
        convert: 'USD',
      }).unwrap();

      

      if (result.ok && result.data && Array.isArray(result.data.quotes)) {
        setHistoricalData(result.data.quotes);
      } else {
        setHistoricalData([]);
      }
    } catch (e) {
      setHistoricalData([]);
    } finally {
      setIsLoading(false);
    }
  }, 350);

  useEffect(() => {
    if (toToken) {
      handleGetHistoricalQuotes(toToken);
    }
  }, [toToken]);

  const handleGetRate = useDebounce(async (amount: string) => {
    try {
      setIsLoading(true);
      if (!fromToken || !toToken || !selectedWallet || !amount || Number(amount) > fromToken?.balance) return;
  
      // Получаем актуальные данные кошелька
      const walletsResult = await getWalletsRequest().unwrap();
      
      if (walletsResult.ok && walletsResult.data) {
        const updatedWallet = walletsResult.data.find(w => w.id === selectedWallet.id);
        const actualFromToken = updatedWallet?.tokens.find(t => t.contract === fromToken.contract);
        const actualToToken = updatedWallet?.tokens.find(t => t.contract === toToken.contract);
  
        if (actualFromToken && actualToToken) {
          setFromToken(actualFromToken);
          setToToken(actualToToken);
        }
      }
  
      const result = await getTokenPriceRequest({
        symbol: fromToken?.symbol,
        network: selectedWallet?.network,
      }).unwrap();
  
      if (result.ok && result.data) {
        const fromTokenPrice = result.data.price;
        
        const toTokenResult = await getTokenPriceRequest({
          symbol: toToken?.symbol,
          network: selectedWallet?.network,
        }).unwrap();
  
        if (toTokenResult.ok && toTokenResult.data) {
          const toTokenPrice = toTokenResult.data.price;
          
          const conversionRate = fromTokenPrice / toTokenPrice;
          const convertedAmount = Number(amount) * conversionRate;
          
          setRate(conversionRate);
          setToAmount(convertedAmount.toFixed(6));
        }
      }
    } catch (e) {
    
    } finally {
      setIsLoading(false);
    }
  }, 350);

  const handleGetTokenExtendedInfo = useDebounce(async (token: Token, network: Network) => {
    try {
      setIsTokenInfoLoading(true);
      const result = await getTokenExtendedInfoRequest({
        symbol: token.symbol,  
        contract: token.contract,
        network: token.network
      }).unwrap();

      if (result.ok && result.data) {
        setTokenExtendedInfo(result.data);
      }
    } catch (e) {
   
    } finally {
      setIsTokenInfoLoading(false);
    }
  }, 350);

  const handleClearState = useCallback(() => {
    setFromToken(undefined);
    setToToken(undefined);
    setFromAmount('');
    setToAmount('');
    setRate(0);
    setCurrentView('swap');
    setTokenExtendedInfo(null);
    setHistoricalData([]);
    setEstimatedFee({ estimated_fee: 0, estimated_fee_usd: 0 });
    dispatch(walletActions.clearSelectedToken());
  }, [dispatch]);


  useEffect(() => {
    return () => {
      handleClearState();
    };
  }, [handleClearState]);

  const handleSwapConfirm = async () => {
    await impact('light')
    try {
      setIsLoading(true);
      if (!fromToken?.id || !toToken?.id || !selectedWallet?.id || !fromAmount) {
        showToast(errorToast, 'Missing required data for swap');
        return;
      }
  
      const roundedAmount = Number(Number(fromAmount).toFixed(9));
  
      const swapParams = {
        wallet_id: selectedWallet.id,
        from_token_id: fromToken.id,
        to_token_id: toToken.id,
        amount: roundedAmount,
        slippageBps: Math.round(slippage * 100)
      };
  
      const result = await swapRequest(swapParams).unwrap();
  
      if (result.ok) {
        notify('success')
        showToast(successToast, 'Swap successful');
        handleClearState();
        dispatch(globalActions.removeAllWindows());
        updateAfterDelay(50000);
      }
    } catch (error: any) {
      // Определяем сеть для специфичных ошибок
      const networkName = selectedWallet?.network === Network.ETH ? 'Ethereum' :
                         selectedWallet?.network === Network.BSC ? 'BSC' :
                         selectedWallet?.network === Network.TON ? 'TON' : 'Solana';
  
      // Обработка конкретных ошибок
      if (error.data?.message?.includes('insufficient funds')) {
        showToast(errorToast, `Insufficient ${networkName} native token for gas fees`);
      } else if (error.data?.errorCode === 'eth.broadcast.failed') {
        showToast(errorToast, `Failed to broadcast transaction on ${networkName}. Check your gas balance`);
      } else if (error.data?.message?.includes('INTERNAL_ERROR')) {
        showToast(errorToast, `Network error on ${networkName}. Please try again`);
      } else {
        showToast(errorToast, `Failed to swap on ${networkName}. Please try again`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleFromAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newAmount = e.target.value;
    setFromAmount(newAmount);

    if (fromToken && Number(newAmount) > fromToken.balance) {
      notify('warning')
      showToast(errorToast, 'Insufficient funds :(');
    }

    if (newAmount) {
      handleGetRate(newAmount);
    } else {
      setRate(0);
      setToAmount('');
    }
  }, [fromToken, showToast, handleGetRate]);


  const handleMaxButtonClick = () => {
    if (fromToken) {
      setFromAmount(fromToken.balance.toString());
      handleGetRate(fromToken.balance.toString());
    }
  };

  const handleOpenConfirmWindow = async () => {
    try {
      setIsLoading(true);
      
      // Сначала получаем актуальные данные кошелька
      const walletsResult = await getWalletsRequest().unwrap();
      
      if (!walletsResult.ok || !walletsResult.data || !selectedWallet) {
        return;
      }
  
      const updatedWallet = walletsResult.data.find(w => w.id === selectedWallet.id);
      if (!updatedWallet) {
        showToast(errorToast, 'Wallet not found');
        return;
      }
  
      // Находим актуальные токены по их контрактам
      const actualFromToken = updatedWallet.tokens.find(t => t.contract === fromToken?.contract);
      const actualToToken = updatedWallet.tokens.find(t => t.contract === toToken?.contract);
  
      if (!actualFromToken || !actualToToken) {
        showToast(errorToast, 'Token data not found');
        return;
      }
  
      // Обновляем состояния с актуальными данными
      setFromToken(actualFromToken);
      setToToken(actualToToken);
  
      // Получаем и устанавливаем комиссию
      const fee = await getEstimatedFee();
      setEstimatedFee(fee);
  
      // Открываем окно подтверждения только если все данные актуальны
      dispatch(globalActions.addWindow({ window: GlobalWindow.ConfirmSwap }));
    } catch (error) {
      
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenSelectFromTokenModal = async () => {
    dispatch(globalActions.addWindow({ window: GlobalWindow.SelectToken }));
    setCurrentView('selectFromToken');
  };

  const handleOpenSelectToTokenModal = async () => {
    dispatch(globalActions.addWindow({ window: GlobalWindow.SelectToken }));
    setCurrentView('selectToToken');
  };

  const handleSelectFromToken = async (token: Token) => {
    setFromToken(token);
    setCurrentView('swap');
    dispatch(globalActions.removeWindow(GlobalWindow.SelectToken ));
    if (token.id === toToken?.id) {
      setToToken(undefined);
      setTokenExtendedInfo(null);
    }
    if (fromAmount) {
      handleGetRate(fromAmount);
    }
  };

  const getEstimatedFee = useCallback(async () => {
    if (!selectedWallet?.network || !fromToken) {
      return {
        estimated_fee: 0,
        estimated_fee_usd: 0
      };
    }
  
    const network = selectedWallet.network;
    let estimatedFee = 0;
    
    switch (network) {
      case Network.ETH:
        estimatedFee = 0.008;
        break;
      case Network.BSC:
        estimatedFee = 0.0004;
        break;
      case Network.SOL:
        estimatedFee = 0.0022; 
        break;
      case Network.TON:
        estimatedFee = 0.18; 
        break;
      default:
        estimatedFee = 0;
    }
  
    // Получаем цену нативного токена
    const nativeSymbol = network === Network.ETH ? 'ETH' : 
                        network === Network.BSC ? 'BNB' : 
                        network === Network.SOL ? 'SOL' : 
                        network === Network.TON ? 'TON': ''
    
    try {                    
      const priceResult = await getTokenPriceRequest({ symbol: nativeSymbol, network }).unwrap();
      
      return {
        estimated_fee: estimatedFee,
        estimated_fee_usd: estimatedFee * (priceResult.ok && priceResult.data?.price ? priceResult.data.price : 0)
      };
    } catch (e) {
   
      return {
        estimated_fee: estimatedFee,
        estimated_fee_usd: 0
      };
    }
  }, [selectedWallet?.network, fromToken, getTokenPriceRequest]);
  


  useEffect(() => {
    if (selectedToken) {
      handleSelectFromToken(selectedToken);
    }
  }, [selectedToken]);


  const handleSelectToToken = async (token: Token) => {
    try {
      setToToken(undefined);
      setTokenExtendedInfo(null);

      // Проверяем, есть ли токен уже в кошельке
      const existingToken = selectedWallet?.tokens.find(t => t.contract === token.contract);
  
      if (!existingToken && selectedWallet) {
        // Если токена нет в кошельке, добавляем его
        const addResult = await addTokenRequest({
          wallet_id: selectedWallet.id,
          wallet_address: selectedWallet.address,
          network: selectedWallet.network,
          contract: token.contract,
        }).unwrap();
  
        if (addResult.ok) {
          await getWalletsRequest().unwrap(); // Обновляем данные кошелька
        }
      }
  
      // В любом случае устанавливаем токен (актуальные данные получим позже)
      setToToken(token);
      setCurrentView('swap');
      dispatch(globalActions.removeWindow(GlobalWindow.SelectToken));
  
      if (token.id === fromToken?.id) {
        setFromToken(undefined);
      }
  
      if (selectedWallet?.network) {
        handleGetTokenExtendedInfo(token, selectedWallet.network);
      }
  
      if (fromAmount) {
        handleGetRate(fromAmount);
      }
    } catch (error) {
      showToast(errorToast, 'Failed to process token');
      setToToken(undefined);
      setTokenExtendedInfo(null);
    }
  };

  const handleCloseSelectToken = useCallback(() => {
    setCurrentView('swap');
    dispatch(globalActions.removeWindow(GlobalWindow.SelectToken));
  }, [dispatch]);

  const handleBackToSwap = useCallback(() => {
    handleCloseSelectToken();
    handleClearState();
  }, [handleCloseSelectToken, handleClearState]);


  const handleSwapTokens = async () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
    if (fromToken && selectedWallet?.network) {
      handleGetTokenExtendedInfo(fromToken, selectedWallet.network);
    }
  };

  useEffect(() => {
    if (selectedWallet) {
      setToToken(undefined);
      setTokenExtendedInfo(null);
    }
  }, [selectedWallet?.id]);

  useEffect(() => {
    if (!isSwapWindowOpen) {
      handleClearState();
    }
  }, [isSwapWindowOpen, handleClearState]);

  return {
    flow: {
      handleFromAmountChange,
      handleSwapConfirm,
      handleMaxButtonClick,
      handleOpenConfirmWindow,
      handleOpenSelectFromTokenModal,
      handleOpenSelectToTokenModal,
      handleSelectFromToken,
      handleSelectToToken,
      handleBackToSwap,
      handleSwapTokens,
      updateSlippage,
      handleClearState,
      setInitialTokens
    },
    state: {
      fromAmount,
      toAmount,
      rate,
      fromToken,
      toToken,
      isConfirmSwapWindowOpen,
      isLoading: isLoading || isSwapLoading,
      isSwapWindowOpen,
      selectedWallet,
      fromTokens,
      toTokens,
      network: selectedWallet?.network,
      isSwapButtonDisabled: !fromToken || !toToken || !fromAmount || isLoading || (fromToken && Number(fromAmount) > fromToken.balance),
      isNoTokensToSwap: fromTokens.length === 0,
      currentView,
      tokenExtendedInfo,
      isTokenInfoLoading,
      historicalData,
      slippage,
      estimatedFee,
      isSelectTokenWindowOpen,
    },
  };
};

export type UseSwapWindowLogic = ReturnType<typeof useSwapWindowLogic>;