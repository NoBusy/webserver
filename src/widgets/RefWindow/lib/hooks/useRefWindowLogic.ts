import { getIsWindowOpen, globalActions, GlobalWindow } from '@/entities/Global';
import { getTgWebAppSdk } from '@/shared/lib/helpers/getTgWebAppSdk';
import { getWallets, Wallet } from '@/entities/Wallet';
import { useDispatch, useSelector } from 'react-redux';
import { referralApi } from '@/entities/Referral';
import { useHapticFeedback } from '@/shared/lib/hooks/useHapticFeedback/useHapticFeedback';
import { useState } from 'react';
import { useToasts } from '@/shared/lib/hooks/useToasts/useToasts';

export const useRefWindowLogic = () => {
  const dispatch = useDispatch();
  const { impact } = useHapticFeedback();
  const { errorToast, successToast } = useToasts();
  const [period, setPeriod] = useState<'all' | '30days'>('all');
  const [isWithdrawLoading, setIsWithdrawLoading] = useState(false);

  const isWindowOpen: boolean = useSelector(getIsWindowOpen)(GlobalWindow.Referral);
  const wallets: Wallet[] = useSelector(getWallets);

  const { data } = referralApi.useGetReferralProgramQuery(undefined, { skip: !wallets.length });
  const [createWithdrawal] = referralApi.useCreateWithdrawalRequestMutation();

  const handleWindowClose = async () => {
    dispatch(globalActions.removeWindow(GlobalWindow.Referral));
  };

  const handleSendLinkClick = async () => {
    await impact('light')
    const TgWebAppSdk = await getTgWebAppSdk();
    if (!TgWebAppSdk || !data?.data) return;
    TgWebAppSdk.openTelegramLink(`https://t.me/share?url=${data.data.link}&text=Join to YoYo Swap for crypto exchange into telegram 🍻`);
  };

  const handleWithdrawClick = async () => {
    try {
      await impact('light');
      
      if (!data?.data || data.data.balance < 10) return;
      
      setIsWithdrawLoading(true);
      
      const result = await createWithdrawal().unwrap();
      
      if (result.ok) {
        successToast('Your withdrawal request has been created.')
      } else {
       // throw new Error(result.message);
      }
    } catch (error) {

    } finally {
      setIsWithdrawLoading(false);
    }
  };

  return {
    flow: {
      handleWindowClose,
      handleSendLinkClick,
      setPeriod,
      handleWithdrawClick
    },
    state: {
      refProgram: data?.data,
      isWindowOpen,
      period
    },
  };
};
