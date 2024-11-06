import { useWalletDetailsWindowLogic } from '../lib/hooks/useWalletDetailsWindowLogic';
import { CopyFillIcon } from '@/shared/assets/icons/CopyFillIcon';
import { WindowHeader } from '@/shared/ui/Header/WindowHeader';
import { Typography } from '@/shared/ui/Typography/Typography';
import { networkSymbol } from '@/shared/consts/networkSymbol';
import { Window } from '@/shared/ui/Window/Window';
import { Field } from '@/shared/ui/Field/Field';
import { Flex } from '@/shared/ui/Flex/Flex';
import { Popover } from '@/shared/ui/Popover/Popover';
import React, { useState } from 'react';
import { Button } from '@/shared/ui/Button/Button';

interface PrivateKeyPopoverProps {
  onShowKey: () => void;
  onBack: () => void;
}

const PrivateKeyPopover: React.FC<PrivateKeyPopoverProps> = ({ onShowKey, onBack }) => (
  <Flex direction="column" gap={24}>
    <Flex justify="space-between" align="center" width="100%">
      <Typography.Text 
        text="Important information!" 
        weight={500} 
        fontSize={20}
        color="#000000"
      />
      <Button
        onClick={onBack}
        className="p-1"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6L18 18" stroke="#000000" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </Button>
    </Flex>
    
    <Typography.Text 
      text="Your private key provides access to all your funds. Never share it with anyone."
      fontSize={16}
      weight={400}
      color="#000000"
    />
    
    <Flex direction="column" gap={8}>
      <Button
        text = 'Show private key'
        onClick={onShowKey}
        className="w-full h-12 bg-[#F7F7F7] rounded-xl hover:bg-[#EFEFEF] font-medium text-black"
        type= 'default'
      />
      
      <Button
        onClick={onBack}
        className="w-full h-12 bg-[#F7F7F7] rounded-xl hover:bg-[#EFEFEF] font-medium text-black"
      >
        Back
      </Button>
    </Flex>
  </Flex>
);

// В основном компоненте WalletDetailsWindow добавим обработку закрытия:
export const WalletDetailsWindow = () => {
  const { flow, state } = useWalletDetailsWindowLogic();
  const [showPrivateKey, setShowPrivateKey] = useState<boolean>(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState<boolean>(false);

  // Обработчик закрытия попапа
  const handleClose = () => {
    setIsPopoverOpen(false);
    setShowPrivateKey(false); // Сбрасываем состояние приватного ключа при закрытии
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
          label="Private key" 
          justify="space-between"
          gap={15}
        >
        <Popover
                  isOpen={isPopoverOpen}
                  setIsOpen={setIsPopoverOpen}
                  direction="bottom"
                  popoverWidth="100%"
                  wrapperWidth="100%"
                  onClose={handleClose} // Добавляем обработчик закрытия
                  trigger={
                    <Flex justify="space-between" width="100%" align="center">
                      <Typography.Text 
                        text={showPrivateKey ? state.openedWallet?.private_key : '•••••••••••••'} 
                        wrap="nowrap" 
                        width="85%" 
                        weight={350} 
                        fontSize={17} 
                      />
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path d="M15 7.5L10 12.5L5 7.5" stroke="#999999" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </Flex>
                  }
                >
                  <PrivateKeyPopover
                    onShowKey={() => {
                      setShowPrivateKey(true);
                      setIsPopoverOpen(false);
                    }}
                    onBack={handleClose}
                  />
                </Popover>
        </Field>
      </Flex>
    </Window>
  );
};

export default WalletDetailsWindow;