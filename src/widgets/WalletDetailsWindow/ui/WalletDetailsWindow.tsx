import { useState } from 'react';
import { useWalletDetailsWindowLogic } from '../lib/hooks/useWalletDetailsWindowLogic';
import { CopyFillIcon } from '@/shared/assets/icons/CopyFillIcon';
import { WindowHeader } from '@/shared/ui/Header/WindowHeader';
import { Typography } from '@/shared/ui/Typography/Typography';
import { networkSymbol } from '@/shared/consts/networkSymbol';
import { Window } from '@/shared/ui/Window/Window';
import { Field } from '@/shared/ui/Field/Field';
import { Flex } from '@/shared/ui/Flex/Flex';
import { Button } from '@/shared/ui/Button/Button';
import { useToasts } from '@/shared/lib/hooks/useToasts/useToasts';

export const WalletDetailsWindow = () => {
  const { flow, state } = useWalletDetailsWindowLogic();
  const { successToast } = useToasts();
  
  // Тестовая функция для проверки работы кнопки
  const handleTestClick = () => {
    console.log('Button clicked');
    successToast('Кнопка нажата!');
  };

  return (
    <Window
      isOpen={state.isWindowOpen}
      zIndex={5002}
      btnText="Delete wallet"
      btnType="danger"
      btnOnClick={flow.handleDeleteWallet}
      isBtnActive={state.isBtnActive}
      isBtnDisabled={state.isLoading}
    >
      <WindowHeader title="Wallet details" />
      <Flex width="100%" direction="column" gap={12}>
        {/* Тестовая кнопка */}
        <Button
          type="primary"
          text="Тестовая кнопка"
          onClick={handleTestClick}
        />

        <Field label="Name">
          <Typography.Text 
            text={state.openedWallet?.name} 
            wrap="nowrap" 
            fontSize={17} 
            weight={350} 
          />
        </Field>
        
        <Field
          gap={15}
          label="Network"
          justify="space-between"
          copyValue={`${state.openedWallet?.network} (${state.openedWallet ? networkSymbol[state.openedWallet?.network] : '-'})`}
          onCopyLabel="Network copied"
        >
          <Typography.Text
            text={`${state.openedWallet?.network} (${state.openedWallet ? networkSymbol[state.openedWallet?.network] : '-'})`}
            wrap="nowrap"
            weight={350}
            fontSize={17}
          />
          <CopyFillIcon width={18} height={18} fill="var(--secondaryText)" />
        </Field>

        <Field 
          label="Address" 
          justify="space-between" 
          copyValue={state.openedWallet?.address} 
          onCopyLabel="Address copied" 
          gap={15}
        >
          <Typography.Text 
            text={state.openedWallet?.address} 
            wrap="nowrap" 
            width="85%" 
            weight={350} 
            fontSize={17} 
          />
          <CopyFillIcon 
            width={18} 
            height={18} 
            fill="var(--secondaryText)" 
            style={{ minWidth: '18px' }} 
          />
        </Field>

        <Field 
          label="Seed-фраза"
          onClick={() => {
            console.log('Field clicked');
            successToast('Field нажат!');
          }}
        >
          <Flex
            width="100%"
            justify="space-between"
            align="center"
            style={{ cursor: 'pointer' }}
          >
            <Typography.Text 
              text="Показать seed-фразу"
              wrap="nowrap"
              weight={350}
              fontSize={17}
            />
          </Flex>
        </Field>
      </Flex>
    </Window>
  );
};

export default WalletDetailsWindow;