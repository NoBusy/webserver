import { Transaction as TransactionInterface, TransactionType } from '@/entities/Wallet';
import { transactionTypeLabel } from '../consts/transactionTypeLabel';
import { transactionTypeIcon } from '../consts/transactionTypeIcon';
import { globalActions, GlobalWindow } from '@/entities/Global';
import { Typography } from '@/shared/ui/Typography/Typography';
import { Field } from '@/shared/ui/Field/Field';
import { Flex } from '@/shared/ui/Flex/Flex';
import { useDispatch } from 'react-redux';
import moment from 'moment-timezone';
import React from 'react';
import { useHapticFeedback } from '@/shared/lib/hooks/useHapticFeedback/useHapticFeedback';

export interface TransactionProps {
  transaction: TransactionInterface;
  onTransactionClick?: (transaction: TransactionInterface) => void;
}

export const Transaction: React.FC<TransactionProps> = ({ transaction, onTransactionClick }) => {
  const dispatch = useDispatch();
  const createdAtLocalTime: moment.Moment = moment.tz(transaction.created_at, 'UTC').tz(moment.tz.guess());

  const handleTransactionClick = async () => {
    if (onTransactionClick) {
      onTransactionClick(transaction);
    } else {
      dispatch(globalActions.addWindow({ window: GlobalWindow.TransactionDetails, payload: transaction }));
    }
  };

  const amountContent = transaction.type === TransactionType.SWAP && transaction.fromCurrency && transaction.toCurrency
    ? {
        mainText: `${transaction.amount.toFixed(5)} ${transaction.fromCurrency} -> ${transaction.toCurrency}`,
        subText: `≈ ${transaction.amount_usd.toFixed(2)} $`
      }
    : {
        mainText: `${transaction.amount.toFixed(5)} ${transaction.currency || transaction.fromCurrency || ''}`,
        subText: `≈ ${transaction.amount_usd.toFixed(2)} $`
      };

  return (
    <Field justify="space-between" onClick={handleTransactionClick}>
      <Flex align="center" gap={12}>
        {transactionTypeIcon[transaction.type]}
        <Flex direction="column">
          <Typography.Text 
            text={transactionTypeLabel[transaction.type]} 
            fontSize={16} 
            weight={550} 
          />
          <Typography.Text 
            text={createdAtLocalTime.format('D MMMM, HH:mm')} 
            type="secondary" 
          />
        </Flex>
      </Flex>

      <Flex direction="column">
        <Typography.Text
          text={amountContent.mainText}
          fontSize={16}
          weight={550}
          align="right"
        />
        <Typography.Text
          text={amountContent.subText}
          type="secondary"
          align="right"
        />
      </Flex>
    </Field>
  );
};