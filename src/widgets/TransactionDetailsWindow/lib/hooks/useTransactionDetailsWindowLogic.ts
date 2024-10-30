import { getIsWindowOpen, getOpenedWindow, GlobalWindow } from '@/entities/Global';
import { getTransactionExplorerLink } from '../../consts/getTransactionExplorerLink';
import { getTgWebAppSdk } from '@/shared/lib/helpers/getTgWebAppSdk';
import { Transaction } from '@/entities/Wallet';
import { useSelector } from 'react-redux';
import moment from 'moment-timezone';
import { useHapticFeedback } from '@/shared/lib/hooks/useHapticFeedback/useHapticFeedback';

export const useTransactionDetailsWindowLogic = () => {
  const isWindowOpen: boolean = useSelector(getIsWindowOpen)(GlobalWindow.TransactionDetails);
  const transaction: Transaction = useSelector(getOpenedWindow)(GlobalWindow.TransactionDetails)?.payload as Transaction;
  const createdAtLocalTime: moment.Moment = moment.tz(transaction?.created_at, 'UTC').tz(moment.tz.guess());

  const handleOpenTransactionExplorer = async () => {
    const TgWebApp = await getTgWebAppSdk();
    if (!TgWebApp) return;
    TgWebApp.openLink(getTransactionExplorerLink(transaction.hash, transaction.network));
  };

  return {
    flow: {
      handleOpenTransactionExplorer,
    },
    state: {
      transaction,
      isWindowOpen: isWindowOpen && !!transaction,
      createdAtLocalTime,
    },
  };
};
