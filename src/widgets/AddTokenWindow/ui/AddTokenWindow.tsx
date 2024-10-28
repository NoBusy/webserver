import { useAddTokenWindowLogic } from '../lib/hooks/useAddTokenWindowLogic';
import { DepositFillIcon } from '@/shared/assets/icons/DepositFillIcon';
import { Typography } from '@/shared/ui/Typography/Typography';
import { WindowHeader } from '@/shared/ui/Header/WindowHeader';
import { networkSymbol } from '@/shared/consts/networkSymbol';
import { Window } from '@/shared/ui/Window/Window';
import { Input } from '@/shared/ui/Input/Input';
import { Field } from '@/shared/ui/Field/Field';
import { Flex } from '@/shared/ui/Flex/Flex';
import Image from 'next/image';
import React from 'react';

export const AddTokenWindow = () => {
  const { flow, state } = useAddTokenWindowLogic();

  return (
    <Window
      isOpen={state.isWindowOpen}
      btnText="Add"
      btnIcon={<DepositFillIcon fill="white" width={14} height={14} />}
      btnOnClick={flow.handleAddWalletToken}
      isBtnActive={state.isBtnActive}
      isBtnDisabled={state.isLoading}
    >
      <WindowHeader title={`Add ${state?.network} token`} isLoading={state.isLoading} />

      <Flex width="100%" direction="column" gap={12}>
        <Input
          label={`Enter ${state?.network ? networkSymbol[state.network] : ''} token contract address`}
          placeholder="0x..."
          value={state.tokenAddress}
          onChange={flow.handleTokenAddressChange}
        />
        {state.tokenInfo && (
           <Flex 
           justify="space-between" 
           align="center" 
           gap={12}
           padding="10px 16px"
           radius="16px"
           bg="var(--secondaryBg)"
           onClick={flow.handleAddWalletToken}
         >
           <Image 
             width={40} 
             height={40} 
             src={state.tokenInfo.icon} 
             alt="token-icon" 
             style={{ borderRadius: '50%' }} 
           />
           <Typography.Text 
             text={`${state.tokenInfo.name} (${state.tokenInfo.symbol})`} 
             weight={550} 
             fontSize={16} 
             width="100%" 
           />
           <Typography.Text 
             align="right" 
             text={`${state.tokenInfo.price.toFixed(4)}$`} 
             textOverflow="inital" 
             wrap="nowrap" 
             overflow="visible" 
           />
         </Flex>
        )}
      </Flex>
    </Window>
  );
};
