import { getIsWindowOpen, globalActions, GlobalWindow } from '@/entities/Global';
import { getTgWebAppSdk } from '@/shared/lib/helpers/getTgWebAppSdk';
import { getWallets, Wallet } from '@/entities/Wallet';
import { useDispatch, useSelector } from 'react-redux';
import { referralApi } from '@/entities/Referral';
import { useHapticFeedback } from '@/shared/lib/hooks/useHapticFeedback/useHapticFeedback';
import { useState } from 'react';

export const useRefWindowLogic = () => {
  const dispatch = useDispatch();
  const { impact } = useHapticFeedback();
  const [period, setPeriod] = useState<'all' | '30days'>('all');

  const isWindowOpen: boolean = useSelector(getIsWindowOpen)(GlobalWindow.Referral);
  const wallets: Wallet[] = useSelector(getWallets);

  const { data } = referralApi.useGetReferralProgramQuery(undefined, { skip: !wallets.length });

  const handleWindowClose = async () => {
    dispatch(globalActions.removeWindow(GlobalWindow.Referral));
  };

  const handleSendLinkClick = async () => {
    await impact('light')
    const TgWebAppSdk = await getTgWebAppSdk();
    if (!TgWebAppSdk || !data?.data) return;
    TgWebAppSdk.openTelegramLink(`https://t.me/share?url=${data.data.link}&text=Join to YoYo Swap for crypto exchange into telegram 🍻`);
  };

  return {
    flow: {
      handleWindowClose,
      handleSendLinkClick,
      setPeriod
    },
    state: {
      refProgram: data?.data,
      isWindowOpen,
      period
    },
  };
};
