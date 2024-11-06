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

interface PrivateKeyPopoverProps {
  onShowKey: () => void;
  onBack: () => void;
}


const PrivateKeyPopover: React.FC<PrivateKeyPopoverProps> = ({ onShowKey, onBack }) => (
  <Flex direction="column" gap={4} className="p-4">
    <Flex justify="space-between" align="center" className="mb-2">
      <Typography.Text text="Important information!" weight={500} fontSize={16} />
      <button 
        onClick={onBack}
        className="p-1 text-gray-500 hover:text-gray-700"
      >
        ✕
      </button>
    </Flex>
    
    <Typography.Text 
      text="Your private key provides access to all your funds. Never share it with anyone."
      fontSize={14}
      className="mb-4"
    />
    
    <button
      onClick={onShowKey}
      className="w-full bg-blue-500 text-white rounded-lg py-2 px-4 hover:bg-blue-600"
    >
      Show private key
    </button>
    
    <button
      onClick={onBack}
      className="w-full mt-2 bg-gray-100 rounded-lg py-2 px-4 hover:bg-gray-200"
    >
      Back
    </button>
  </Flex>
);

export const WalletDetailsWindow = () => {
  const { flow, state } = useWalletDetailsWindowLogic();
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

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
            direction="center"
            trigger={
              <Flex justify="space-between" width="100%" align="center">
                <Typography.Text 
                  text={showPrivateKey ? state.openedWallet?.private_key : '••••••••••••'} 
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
              </Flex>
            }
          >
            <PrivateKeyPopover
              onShowKey={() => {
                setShowPrivateKey(true);
                setIsPopoverOpen(false);
              }}
              onBack={() => setIsPopoverOpen(false)}
            />
          </Popover>
        </Field>
      </Flex>
    </Window>
  );
};

export default WalletDetailsWindow;