import { useTransactionDetailsWindowLogic } from '../lib/hooks/useTransactionDetailsWindowLogic';
import { transactionTypeIcon, transactionTypeLabel } from '@/widgets/TransactionsHistoryWindow';
import { CopyFillIcon } from '@/shared/assets/icons/CopyFillIcon';
import { Typography } from '@/shared/ui/Typography/Typography';
import { networkSymbol } from '@/shared/consts/networkSymbol';
import { Divider } from '@/shared/ui/Divider/Divider';
import { Network, TransactionStatus } from '@/entities/Wallet';
import { Button } from '@/shared/ui/Button/Button';
import { Window } from '@/shared/ui/Window/Window';
import { Field } from '@/shared/ui/Field/Field';
import { Flex } from '@/shared/ui/Flex/Flex';
import React from 'react';

export const transactionStatusLabel: Record<TransactionStatus, string> = {
  [TransactionStatus.FAILED]: 'Failed',
  [TransactionStatus.PENDING]: 'Pending',
  [TransactionStatus.SUCCESS]: 'Success',
};

export const transactionStatusColor: Record<TransactionStatus, string> = {
  [TransactionStatus.FAILED]: 'var(--red)',
  [TransactionStatus.PENDING]: 'var(--yellow)',
  [TransactionStatus.SUCCESS]: 'var(--green)',
};

export const TransactionDetailsWindow = () => {
  const { flow, state } = useTransactionDetailsWindowLogic();
  const isHideExplorerBtn: boolean = state.transaction?.network === Network.TON && state.transaction?.status === TransactionStatus.PENDING;
  const isPending: boolean = state.transaction?.status === TransactionStatus.PENDING;

  return (
    <Window isOpen={state.isWindowOpen}>
      <Flex width="100%" direction="column" gap={20}>
        <Flex width="100%" align="center" justify="center" padding="16px 16px" gap={12}>
          {transactionTypeIcon[state.transaction?.type]}
          <Typography.Text text={transactionTypeLabel[state.transaction?.type]} weight={600} fontSize={16} />
        </Flex>

        <Flex width="100%" direction="column" align="center" gap={4}>
          <Flex align="center" gap={9}>
            <Typography.Title text={state.transaction?.amount} fontFamily="Clash Display" />
            <Typography.Title text={state.transaction?.currency ? state.transaction?.currency : state.transaction?.fromCurrency} fontFamily="Clash Display" />
          </Flex>
          <Typography.Text text={state.createdAtLocalTime.format('D MMMM, HH:mm')} type="secondary" />
        </Flex>

        <Field direction="column" justify="center" padding="16px 20px" gap={12}>
          <Flex width="100%" justify="space-between">
            <Typography.Text text="Status" type="secondary" />
            <Typography.Text
              text={transactionStatusLabel[state.transaction?.status]}
              color={transactionStatusColor[state.transaction?.status]}
              weight={550}
            />
          </Flex>
          <Divider />
          <Field justify="space-between" padding="0" height={17} copyValue={state.transaction?.to} onCopyLabel="Copied">
            <Typography.Text text="Recipient" type="secondary" />
            <Flex align="center" gap={9}>
              <Typography.Text text={`${state.transaction?.to?.slice(0, 8)}...${state.transaction?.to?.slice(-8)}`} />
              <CopyFillIcon />
            </Flex>
          </Field>
          <Divider />
          <Field justify="space-between" padding="0" height={17} copyValue={state.transaction?.from} onCopyLabel="Copied">
            <Typography.Text text="Sender" type="secondary" />
            <Flex align="center" gap={9}>
              <Typography.Text text={`${state.transaction?.from?.slice(0, 8)}...${state.transaction?.from?.slice(-8)}`} />
              <CopyFillIcon />
            </Flex>
          </Field>
          <Divider />
          {!isPending && (
            <Flex width="100%" justify="space-between">
              <Typography.Text text="Commission" type="secondary" />
              <Typography.Text
                text={`${state.transaction?.fee.toFixed(4)} ${networkSymbol[state.transaction?.network]} (${state.transaction?.fee_usd.toFixed(4)} $)`}
              />
            </Flex>
          )}
          <Divider />
          <Flex width="100%" justify="space-between">
            <Typography.Text text="Network" type="secondary" />
            <Typography.Text text={`${state.transaction?.network} (${networkSymbol[state.transaction?.network]})`} />
          </Flex>
        </Field>

        {!isHideExplorerBtn && (
          <Button height={50} onClick={flow.handleOpenTransactionExplorer}>
            <Typography.Text text="Open in explorer" type="secondary" color="var(--accent)" weight={450} fontSize={16} />
          </Button>
        )}
      </Flex>
    </Window>
  );
};
