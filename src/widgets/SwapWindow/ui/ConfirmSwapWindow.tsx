import React from 'react';
import { UseSwapWindowLogic } from '../lib/hooks/useSwapWindowLogic';
import { Typography } from '@/shared/ui/Typography/Typography';
import { WindowHeader } from '@/shared/ui/Header/WindowHeader';
import { Window } from '@/shared/ui/Window/Window';
import { Flex } from '@/shared/ui/Flex/Flex';
import Image from 'next/image';
import { getTokenImage } from '@/fsdpages/WalletPage';
import { Token } from '@/entities/Wallet';

export interface ConfirmSwapWindowProps {
  logic: UseSwapWindowLogic;
  onClose?: () => void;
}

export const ConfirmSwapWindow: React.FC<ConfirmSwapWindowProps> = (props) => {
  const { flow, state } = props.logic;

  const renderTokenRow = (label: string, amount: string, token: Token | undefined) => (
    <Flex 
      width="100%" 
      style={{
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        padding: '12px 16px',
      }}
    >
      <Flex align="center" gap={12} style={{ flex: 1 }}>
        {token && (
          <Image
            src={getTokenImage(token)}
            alt={`${token.symbol} icon`}
            width={32}
            height={32}
          />
        )}
        <Flex direction="column" gap={2} style={{ flex: 1 }}>
          <Typography.Text
            text={label}
            type="secondary"
            fontSize={14}
          />
          <Typography.Text
            text={`${amount} ${token?.symbol || ''}`}
            fontSize={16}
            weight={500}
          />
        </Flex>
      </Flex>
    </Flex>
  );

  return (
    <Window
      isOpen={state.isConfirmSwapWindowOpen}
      zIndex={5006}
      btnOnClick={flow.handleSwapConfirm}
      btnText={state.isLoading ? "Processing..." : "Confirm and swap"}
      isBtnActive={!state.isLoading}
      isBtnDisabled={state.isLoading}
      onClose={props.onClose}
    >
      <WindowHeader
        title="Swap Details"
        isLoading={state.isLoading}
      />
      
      <Flex
        width="100%"
        direction="column"
        gap={12}
        style={{ padding: '16px' }}
      >
        {renderTokenRow("You send", state.fromAmount, state.fromToken)}
        {renderTokenRow("You receive", state.toAmount, state.toToken)}

        <Flex 
          width="100%" 
          direction="column"
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '16px',
          }}
        >
          <Flex direction="column" gap={16}>
            <Flex direction="column" gap={4} style={{ borderBottom: '1px solid #F0F0F0', paddingBottom: '16px' }}>
              <Typography.Text
                text="Commission"
                type="secondary"
                fontSize={14}
              />
              <Typography.Text
                text={`≈ ${state.estimatedFee.estimated_fee_usd.toFixed(2)} $`}
                fontSize={14}
              />
            </Flex>

            <Flex direction="column" gap={4} style={{ borderBottom: '1px solid #F0F0F0', paddingBottom: '16px' }}>
              <Typography.Text
                text="Rate"
                type="secondary"
                fontSize={14}
              />
              <Typography.Text
                text={`1 ${state.fromToken?.symbol} ≈ ${state.rate.toFixed(6)} ${state.toToken?.symbol}`}
                fontSize={14}
              />
            </Flex>

            <Flex direction="column" gap={4} style={{ borderBottom: '1px solid #F0F0F0', paddingBottom: '16px' }}>
              <Typography.Text
                text={`${state.fromToken?.symbol} balance after swap`}
                type="secondary"
                fontSize={14}
              />
              <Typography.Text
                text={`≈ ${state.fromToken?.balance? state.fromToken?.balance - Number(state.fromAmount) : ''}`}
                fontSize={14}
              />
            </Flex>

            <Flex direction="column" gap={4}>
              <Typography.Text
                text={`${state.toToken?.symbol} balance after swap`}
                type="secondary"
                fontSize={14}
              />
              <Typography.Text
                text={`≈ ${state.toToken?.balance? state.toToken?.balance + Number(state.toAmount) : Number(state.toAmount)}`}
                fontSize={14}
              />
            </Flex>
          </Flex>
        </Flex>

        {state.isLoading && (
          <Typography.Description
            text="Processing your swap... Please wait"
            align="center"
            type="secondary"
            fontSize={14}
          />
        )}
      </Flex>
    </Window>
  );
};

export default ConfirmSwapWindow;