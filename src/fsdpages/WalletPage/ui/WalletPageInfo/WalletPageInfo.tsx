'use client';

import { getSelectedWallet, Wallet, walletApi } from '@/entities/Wallet';
import { DepositFillIcon } from '@/shared/assets/icons/DepositFillIcon';
import { SuccessFillIcon } from '@/shared/assets/icons/SuccessFillIcon';
import { useToasts } from '@/shared/lib/hooks/useToasts/useToasts';
import { CopyFillIcon } from '@/shared/assets/icons/CopyFillIcon';
import { SendFillIcon } from '@/shared/assets/icons/SendFillIcon';
import { SwapFillIcon } from '@/shared/assets/icons/SwapFillIcon';
import { Typography } from '@/shared/ui/Typography/Typography';
import { globalActions, GlobalWindow } from '@/entities/Global';
import { AnimatePresence, motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/shared/ui/Button/Button';
import Spinner from '@/shared/ui/Spinner/Spinner';
import { Flex } from '@/shared/ui/Flex/Flex';
import { useHapticFeedback } from '@/shared/lib/hooks/useHapticFeedback/useHapticFeedback';
import { useWalletUpdater } from '@/shared/lib/hooks/useWalletUpdate/useWalletUpdate';
import { RefreshIcon } from '@/shared/assets/icons/RefreshIcon';
import { useState } from 'react';


export const WalletPageInfo = () => {
  const dispatch = useDispatch();
  const { successToast } = useToasts();
  const { impact } = useHapticFeedback();
  const { updateWalletData } = useWalletUpdater();

  const selectedWallet: Wallet | undefined = useSelector(getSelectedWallet);
  const isLoading: boolean = walletApi.endpoints.getWallets.useQueryState().isLoading;

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshClick = async () => {
    await impact('light');
    setIsRefreshing(true);
    updateWalletData();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleOnCopy = async () => {
    await impact('light');
    navigator.clipboard.writeText(selectedWallet?.address ?? '');
    successToast('Copied', { icon: <SuccessFillIcon width={21} height={21} /> });
  };

  const handleSwapClick = async () => {
    dispatch(globalActions.addWindow({ window: GlobalWindow.Swap }));
  };

  const handleDepositClick = async () => {
    dispatch(globalActions.addWindow({ window: GlobalWindow.Deposit }));
  };

  const handleTransferClick = async () => {
    dispatch(globalActions.addWindow({ window: GlobalWindow.Transfer }));
  };

  return (
    <Flex direction="column" gap={24}>
      <Flex direction="column" align="center" justify="center" gap={8}>
        <Flex align="center" height="25px">
          <Typography.Text text="Total Balance" fontSize={16} />
          <div style={{ 
            width: '24px',  // Фиксированная ширина
            height: '24px', // Фиксированная высота
            position: 'relative',
            marginLeft: '8px'
          }}>
            <Button
              onClick={handleRefreshClick}
              style={{
                padding: 0,
                background: 'none', 
                border: 'none',
                cursor: 'pointer',
                position: 'absolute', // Абсолютное позиционирование
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)', // Центрирование
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <AnimatePresence mode="wait">
                {isRefreshing || isLoading ? (
                  <motion.div
                    key="spinner"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <Spinner size="md" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="refresh"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <RefreshIcon />
                  </motion.div>
                )}
              </AnimatePresence>
            </Button>
          </div>
        </Flex>
        <Flex align="center" gap={8}>
          <Typography.Text text="$" fontFamily="Clash Display" type="secondary" fontSize={40} />
          <Typography.Text text={(selectedWallet?.balance_usd ?? 0).toFixed(2)} fontFamily="Clash Display" fontSize={40} />
        </Flex>
        <Flex align="center" gap={8} onClick={handleOnCopy}>
          <Typography.Text
            text={`${selectedWallet?.address.slice(0, 4) ?? '.'}...${selectedWallet?.address.slice(-4) ?? '.'}`}
            fontSize={16}
            type="secondary"
          />
          <CopyFillIcon />
        </Flex>
      </Flex>

      <Flex gap={8} align="center" justify="center">
        <Button width={100} padding="12px 8px" direction="column" onClick={handleDepositClick}>
          <DepositFillIcon />
          <Typography.Text text="Deposit" weight="450" color="var(--accent)" fontSize={14} />
        </Button>
        <Button width={100} padding="12px 8px" direction="column" onClick={handleTransferClick}>
          <SendFillIcon />
          <Typography.Text text="Send" weight="450" color="var(--accent)" fontSize={14} />
        </Button>
        <Button width={100} padding="12px 8px" direction="column" onClick={handleSwapClick}>
          <SwapFillIcon />
          <Typography.Text text="Swap" weight="450" color="var(--accent)" fontSize={14} />
        </Button>
      </Flex>
    </Flex>
  );
};
