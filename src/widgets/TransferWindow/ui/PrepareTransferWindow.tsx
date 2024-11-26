import { UseTransferWindowLogic } from '../lib/hooks/useTransferWindowLogic';
import { Typography } from '@/shared/ui/Typography/Typography';
import { WindowHeader } from '@/shared/ui/Header/WindowHeader';
import { networkSymbol } from '@/shared/consts/networkSymbol';
import { getTokenImage } from '@/fsdpages/WalletPage';
import { Window } from '@/shared/ui/Window/Window';
import { Input } from '@/shared/ui/Input/Input';
import { Flex } from '@/shared/ui/Flex/Flex';
import Image from 'next/image';
import React from 'react';

export interface PrepareTransferWindowProps {
  logic: UseTransferWindowLogic;
}

export const PrepareTransferWindow: React.FC<PrepareTransferWindowProps> = (props) => {
  const { flow, state } = props.logic;
  const [lastScannedQR, setLastScannedQR] = React.useState<string>('');

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLastScannedQR(e.target.value);
    flow.handleToAddressChange(e);
  };

  return (
    <Window
      isOpen={state.isPrepareTransactionWindowOpen}
      btnText="Continue"
      zIndex={5005}
      btnOnClick={flow.handleOpenConfirmWindow}
      isBtnDisabled={state.isPrepareWindowBtnDisabled}
      isBtnActive
    >
      <WindowHeader title="Transfer" isLoading={state.isLoading} />
      <Flex width="100%" direction="column" gap={12}>
        <Input
          type="text"
          value={state.toAddress}
          onChange={flow.handleToAddressChange}
          placeholder={`Address (${state.network && networkSymbol[state.network]})`}
          isQrScanEnabled
        />
        
        {/* Поле для отладки QR
        <Flex direction="column" gap={4}>
          <Typography.Text text={`Raw QR: ${lastScannedQR}`} fontSize={12} />
        </Flex> */}

        <Input
          type="text"
          value={state.amount}
          onChange={flow.handleAmountChange}
          placeholder={`0.00 ${state.tokenToTransfer?.symbol}`}
          isHasMaxButton
          onMaxButtonClick={flow.handleMaxButtonClick}
        />
        <Typography.Text text={`≈ ${state.rate.toFixed(2)} $`} type="secondary" />
        <Flex width="100%" direction="column" padding="12px 0px 12px 0px" gap={12}>
          <Typography.Text text="Balance" type="secondary" />
          <Flex align="center" gap={12}>
            {state.tokenToTransfer?.icon && (
              <Image 
                width={32} 
                height={32} 
                src={getTokenImage(state.tokenToTransfer)} 
                alt="token-icon" 
              />
            )}
            <Typography.Text 
              text={`${state.tokenToTransfer?.balance} ${state.tokenToTransfer?.symbol}`} 
              fontSize={16} 
              weight={550} 
            />
            <Typography.Text 
              text={`≈ ${state.balanceUsd.toFixed(2)} $`} 
              type="secondary" 
            />
          </Flex>
        </Flex>
      </Flex>
    </Window>
  );
};