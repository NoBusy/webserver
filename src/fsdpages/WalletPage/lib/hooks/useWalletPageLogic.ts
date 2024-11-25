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

  const getWallets = async () => {
    try {
      // 1. Получаем список кошельков
      const walletsData = await getWalletsRequest().unwrap();
      if (!walletsData.data || walletsData.data.length === 0) return;
      
      dispatch(walletActions.setWallets(walletsData.data));
  
      // 2. Определяем какой кошелек использовать
      const savedWalletId = cookies.get(COOKIES_KEY_SELECTED_WALLET);
      const savedNetwork = cookies.get(COOKIES_KEY_SELECTED_NETWORK) as Network;
      
      let targetWallet: Wallet | undefined;
      
      // Приоритет выбора кошелька:
      // 1. Текущий выбранный кошелек
      // 2. Кошелек из куки
      // 3. Первый кошелек из списка
      if (selectedWallet) {
        targetWallet = walletsData.data.find(w => w.id === selectedWallet.id);
      } else if (savedWalletId) {
        targetWallet = walletsData.data.find(w => w.id === savedWalletId);
      }
  
      // Если не нашли кошелек - берем первый из списка
      if (!targetWallet) {
        targetWallet = walletsData.data[0];
      }
  
      // 3. Загружаем данные кошелька
      await getWalletRequest(targetWallet.id);
      dispatch(walletActions.setSelectedWallet(targetWallet));
  
      // 4. Определяем сеть
      // Если есть сохраненная сеть и она совпадает с сетью кошелька - используем её
      if (savedNetwork && savedNetwork === targetWallet.network) {
        dispatch(walletActions.setSelectedNetwork(savedNetwork));
      } else {
        // Иначе используем сеть кошелька
        dispatch(walletActions.setSelectedNetwork(targetWallet.network));
      }
      
    } catch (error) {
    
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
      // }))
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
    initTgWebAppSdk();
    getProfileRequestParams();
    initStories()
  }, []);

  useEffect(() => {
    checkBackButtonState(openedWindows);
  }, [openedWindows]);

  return {
    flow: {
      handleBackButtonClick,
    },
    state: {
      isLoading: userDataResult.isLoading || getWalletsResult.isLoading || isLoading || isGlobalLoading,
      selectedWallet,
      selectedNetwork,
    },
  };
};
