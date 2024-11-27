'use client';

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
import { StoryViewer } from '@/widgets/StoryViewer';
import { useWalletPageLogic } from '../../lib/hooks/useWalletPageLogic';
import { WalletPageHeader } from '../WalletPageHeader/WalletPageHeader';
import { WalletPageTokens } from '../WalletPageTokens/WalletPageTokens';
import { WalletPageInfo } from '../WalletPageInfo/WalletPageInfo';
import { WalletPageActions } from '../WalletPageActions/WalletPageActions';
import { TokenDetailsWindow } from '../WalletPageToken/TokenDetailsWindow';

const WalletPage = () => {
  useWalletPageLogic();
  

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


export default WalletPage;