'use client';
import { useWalletPageLogic } from '../../lib/hooks/useWalletPageLogic';
import { WalletPageActions } from '../WalletPageActions/WalletPageActions';
import { WalletPageHeader } from '../WalletPageHeader/WalletPageHeader';
import { WalletPageTokens } from '../WalletPageTokens/WalletPageTokens';
import { WalletPageInfo } from '../WalletPageInfo/WalletPageInfo';
import { Page } from '@/shared/ui/Page/Page';
import { TransactionDetailsWindow } from '@/widgets/TransactionDetailsWindow';
import { TransactionsHistoryWindow } from '@/widgets/TransactionsHistoryWindow';
import { WalletsListWindow } from '@/widgets/WalletsListWindow';
import { WalletDetailsWindow } from '@/widgets/WalletDetailsWindow';
import { ImportWalletWindow } from '@/widgets/AddWalletWindow';
import { CreateWalletWindow } from '@/widgets/AddWalletWindow';
import { NetworksWindow } from '@/widgets/NetworksWindow';
import { AddTokenWindow } from '@/widgets/AddTokenWindow';
import { AddWalletWindow } from '@/widgets/AddWalletWindow';
import { LoadingWindow } from '@/widgets/LoadingWindow';
import { TransferWindow } from '@/widgets/TransferWindow';
import { DepositWindow } from '@/widgets/DepositWindow';
import { RefWindow } from '@/widgets/RefWindow';
import { SwapWindow } from '@/widgets/SwapWindow';
import { TokenDetailsWindow } from '../WalletPageToken/TokenDetailsWindow';
import { StoryViewer } from '@/widgets/StoryViewer';
import { useEffect, useState } from 'react';

export const WalletPage = () => {
  const { state } = useWalletPageLogic();
  const [isAppReady, setIsAppReady] = useState(false);

  // Use useEffect to handle hydration
  useEffect(() => {
    // Set a small timeout to ensure all initial states are properly set
    const timer = setTimeout(() => {
      setIsAppReady(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  // Don't render anything until the app is ready
  if (!isAppReady || state.isLoading) {
    return <LoadingWindow />;
  }

  return (
    <Page>
      <WalletPageHeader />
      <WalletPageInfo />
      <WalletPageTokens />
      <WalletPageActions />
      <TransactionsHistoryWindow />
      <SwapWindow />
      <DepositWindow />
      <RefWindow />
      <TransferWindow />
      <NetworksWindow />
      <LoadingWindow />
      <AddWalletWindow />
      <AddTokenWindow />
      <TransactionsHistoryWindow />
      <WalletDetailsWindow />
      <WalletsListWindow />
      <TransactionDetailsWindow />
      <ImportWalletWindow />
      <CreateWalletWindow />
      <TokenDetailsWindow/>
      <StoryViewer/>
    </Page>
  );
};