'use client';

import { getIsLoading, getSelectedNetwork, getSelectedWallet, Network, Wallet, walletActions } from '@/entities/Wallet';
import { getIsGlobalLoading, getWindowsOpen, globalActions, GlobalWindow, GlobalWindowType } from '@/entities/Global';
import { getTgWebAppSdk } from '@/shared/lib/helpers/getTgWebAppSdk';
import { COOKIES_KEY_SELECTED_NETWORK, COOKIES_KEY_SELECTED_WALLET, COOKIES_KEY_TELEGRAM_ID } from '@/shared/consts/cookies';
import { walletApi } from '@/entities/Wallet/api/walletApi';
import { useDispatch, useSelector } from 'react-redux';
import { GetUserParams } from '@/entities/User';
import {  useEffect, useState } from 'react';
import { userApi } from '@/entities/User';
import cookies from 'js-cookie';
import { useHapticFeedback } from '@/shared/lib/hooks/useHapticFeedback/useHapticFeedback';
import { useCloudStorage } from '@/shared/lib/hooks/useCloudStorage/useCloudStorage';
import { appStorage, useAppStorage } from '@/shared/lib/hooks/useCloudStorage/useAppStorage';
import { STORAGE_KEYS } from '@/shared/consts/storage';



export const useWalletPageLogic = () => {
  const dispatch = useDispatch();
  const { getItem } = useCloudStorage();

  const [profileRequestParams, setProfileRequestParams] = useState<GetUserParams | null>();
  const [getWalletRequest] = walletApi.useLazyGetWalletQuery();
  const [isInited, setIsInited] = useState<boolean>(false);
  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const isGlobalLoading: boolean = useSelector(getIsGlobalLoading);
  const selectedNetwork: Network | undefined = useSelector(getSelectedNetwork);
  const selectedWallet: Wallet | undefined = useSelector(getSelectedWallet);
  const openedWindows: GlobalWindowType<GlobalWindow>[] = useSelector(getWindowsOpen);
  const isLoading: boolean = useSelector(getIsLoading);
  const [isStoriesLoaded, setIsStoriesLoaded] = useState(false);
 


  const { data: userData, ...userDataResult } = userApi.useGetUserQuery(profileRequestParams!, { skip: !profileRequestParams });
  const [getWalletsRequest, getWalletsResult] = walletApi.useLazyGetWalletsQuery();


  const checkSwapParams = async () => {
    const TgWebApp = await getTgWebAppSdk();
    if (!TgWebApp) return;
  
    const startParam = TgWebApp.initDataUnsafe.start_param;
    if (startParam) {
      try {
        let [network, fromToken, toToken] = startParam.split('-');
  
        // Преобразуем сеть в правильный формат
        if (network === 'Binance_Smart_Chain') {
          network = Network.BSC;
        } else if (network === 'The_Open_Network') {
          network = Network.TON;
        }
  
        await getWallets(network as Network);
  
        // Только потом открываем окно свопа
        dispatch(globalActions.addWindow({
          window: GlobalWindow.Swap,
          options: { 
            params: {
              fromToken: fromToken === 'native' ? '' : fromToken,
              toToken,
              network
            }
          }
        }));
      } catch (error) {
        console.error('Failed to parse swap parameters:', error);
      }
    }
  };

  const getWallets = async (forceNetwork?: Network) => {  // добавляем опциональный параметр
    try {
      const walletsData = await getWalletsRequest().unwrap();
      if (!walletsData.data) return;
  
      dispatch(walletActions.setWallets(walletsData.data));
  
      const savedWalletId = await appStorage.get<string>(STORAGE_KEYS.SELECTED_WALLET);
      const savedNetwork = await appStorage.get<Network>(STORAGE_KEYS.SELECTED_NETWORK);
  
      // Используем forceNetwork только если он передан
      const network = forceNetwork || selectedNetwork || savedNetwork;
  
      // Сохраняем оригинальную логику поиска кошелька
      let wallet = selectedWallet ?? walletsData.data.find((w) => w.id === savedWalletId);
      
      // Если есть forceNetwork и текущий кошелек не в той сети, ищем подходящий
      if (forceNetwork && wallet?.network !== forceNetwork) {
        wallet = walletsData.data.find(w => w.network === forceNetwork && w.id === savedWalletId) ||
                 walletsData.data.find(w => w.network === forceNetwork);
      }
  
      if (!wallet) {
        savedWalletId ?
          await getWalletRequest(savedWalletId) :
          await getWalletRequest(walletsData.data[0].id);
      }
  
      if (wallet && network) {
        await getWalletRequest(wallet.id);
        
        if (wallet.network !== network) {
          dispatch(walletActions.setSelectedNetwork(wallet.network));
        } else {
          dispatch(walletActions.setSelectedNetwork(network));
        }
      }
    } catch (error) {
      console.error('Error in getWallets:', error);
    }
  };

  const initTgWebAppSdk = async () => {
    const TgWebApp = await getTgWebAppSdk();
    if (!TgWebApp) return;
    TgWebApp.ready();
    TgWebApp.expand();
    TgWebApp.BackButton.onClick(handleBackButtonClick);
    TgWebApp.setHeaderColor('#F4F7FA');
    TgWebApp.setBackgroundColor('#F4F7FA');
  };

  const checkBackButtonState = async (windows: GlobalWindowType<GlobalWindow>[]) => {
    const TgWebbAppSdk = await getTgWebAppSdk();
    if (!TgWebbAppSdk) return;

    if (windows.length > 0) {
      TgWebbAppSdk.BackButton.show();
    } else {
      TgWebbAppSdk.BackButton.hide();
    }
  };

  const handleBackButtonClick = async () => {
    dispatch(globalActions.removeLastWindow());
  };

  const getProfileRequestParams = async () => {
    const webAppSdk = await getTgWebAppSdk();
    if (!webAppSdk) return;
    if (process.env.NODE_ENV === 'production' && !webAppSdk?.initDataUnsafe?.user?.id) return;

    cookies.set(COOKIES_KEY_TELEGRAM_ID, `${process.env.NODE_ENV === 'development' ? '878554657' : webAppSdk?.initDataUnsafe.user?.id}`);

    switch (process.env.NODE_ENV) {
      case 'production':
        setProfileRequestParams({
          telegram_id: String(webAppSdk?.initDataUnsafe.user?.id),
          username: String(webAppSdk?.initDataUnsafe.user?.username),
          language_code: String(webAppSdk?.initDataUnsafe.user?.language_code ?? 'en'),
        });
        break;
      case 'development':
        setProfileRequestParams({
          telegram_id: '878554657',
          username: 'devpitt',
          first_name: 'Pitt',
          last_name: 'Russo',
          language_code: 'en',
        });
        break;
    }
  };

  const initStories = async () => {
    if (!isFirstLoad || isStoriesLoaded) return;
    try {
      const storiesViewed = await getItem('stories_viewed');
      
      if (!storiesViewed) {
        dispatch(globalActions.addWindow({
          window: GlobalWindow.StoryViewer,
          options: { ignoreGlobalLoading: true } 
        }));
      }
      // dispatch(globalActions.addWindow({
      //   window: GlobalWindow.StoryViewer,
      //   options: { ignoreGlobalLoading: true } 
      // }))n
      setIsStoriesLoaded(true);
      setIsFirstLoad(false);
    } catch (error) {
      setIsFirstLoad(false);
      setIsStoriesLoaded(true);
    }
  };

  useEffect(() => {

    initStories()
  }, []);

  useEffect(() => {
    const telegramId: string | undefined = cookies.get(COOKIES_KEY_TELEGRAM_ID);
    setIsInited(!!telegramId);
  }, []);

  useEffect(() => {
    !userDataResult.isLoading && getWallets();
  }, [userDataResult.isLoading]);

  useEffect(() => {
    const init = async () => {
      try {
        await initTgWebAppSdk();
        await getProfileRequestParams();
        await checkSwapParams();
        await initStories();
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };
  
    
    init().catch(error => {
      console.error('Failed to initialize:', error);
    });
  }, []);

  useEffect(() => {
    checkBackButtonState(openedWindows);
  }, [openedWindows]);

  return {
    flow: {
      handleBackButtonClick,
    },
    state: {
      isLoading: !isInited || userDataResult.isLoading || getWalletsResult.isLoading || isLoading || isGlobalLoading,
      selectedWallet,
      selectedNetwork,
    },
  };
};
