import { UseTransferWindowLogic } from '../lib/hooks/useTransferWindowLogic';
import { CopyFillIcon } from '@/shared/assets/icons/CopyFillIcon';
import { WindowHeader } from '@/shared/ui/Header/WindowHeader';
import { Typography } from '@/shared/ui/Typography/Typography';
import { Divider } from '@/shared/ui/Divider/Divider';
import { Window } from '@/shared/ui/Window/Window';
import { Field } from '@/shared/ui/Field/Field';
import { Flex } from '@/shared/ui/Flex/Flex';
import React from 'react';

export interface ConfirmTransferWindowProps {
  logic: UseTransferWindowLogic;
}

export const ConfirmTransferWindow: React.FC<ConfirmTransferWindowProps> = (props) => {
  const { flow, state } = props.logic;

  return (
    <Window isOpen={state.isConfirmWindowOpen} zIndex={5006} btnOnClick={flow.handleTransferConfirm} btnText="Confirm" isBtnActive>
      <WindowHeader title="Transfer" isLoading={state.isLoading} />
      <Flex width="100%" direction="column" align="center" gap={24}>
        <Flex width="100%" direction="column" align="center" gap={4}>
          <Flex align="center" gap={9}>
            <Typography.Title text={state.amount} fontFamily="Clash Display" />
            <Typography.Title text={state.tokenToTransfer?.symbol} fontFamily="Clash Display" />
          </Flex>
          <Typography.Text text={`≈ ${state.rate.toFixed(2)} $`} type="secondary" />
        </Flex>

        <Field direction="column" justify="center" padding="16px 20px" gap={12}>
          <Flex width="100%" justify="space-between">
            <Typography.Text text="From" type="secondary" />
            <Typography.Text text={`${state.selectedWallet?.address.slice(0, 6)}...${state.selectedWallet?.address.slice(-6)}`} />
          </Flex>
          <Divider />
          <Field justify="space-between" padding="0" height={17} copyValue={state.toAddress} onCopyLabel="Copied">
            <Typography.Text text="to" type="secondary" />
            <Flex align="center" gap={9}>
              <Typography.Text text={`${state.toAddress?.slice(0, 6)}...${state.toAddress?.slice(-6)}`} />
              <CopyFillIcon />
            </Flex>
          </Field>
          <Divider />
          <Flex width="100%" justify="space-between">
            <Typography.Text text="Network" type="secondary" />
            <Typography.Text text={state.network} />
          </Flex>
        </Field>

        <Typography.Description text="Your funds may be lost if you send them to another network" align="center" type="secondary" />
      </Flex>
    </Window>
  );
};
