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
import arrowIcon from '@/shared/assets/icons/arrow-icon.svg';
import Image from 'next/image';

interface PrivateKeyPopoverProps {
  onCopyKey: () => void;
  onBack: () => void;
}

const PrivateKeyPopover: React.FC<PrivateKeyPopoverProps> = ({ onCopyKey, onBack }) => (
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
      text="Your seed phrase provides access to all your funds. Never share it with anyone."
      fontSize={16}
      weight={400}
      color="#000000"
    />
    
    <Flex direction="column" gap={8}>
      <Button
        text="Copy Seed phrase"
        onClick={onCopyKey}
        className="w-full h-12 rounded-xl hover:bg-[#EFEFEF] font-medium text-black"
        type="primary"
      />
      
      <Button
        onClick={onBack}
        className="w-full h-12 rounded-xl hover:bg-[#EFEFEF] font-medium text-black"
      >
        Back
      </Button>
    </Flex>
  </Flex>
);

interface DeleteWalletPopoverProps {
  onDelete: () => void;
  onBack: () => void;
}

const DeleteWalletPopover: React.FC<DeleteWalletPopoverProps> = ({ onDelete, onBack }) => (
  <Flex direction="column" gap={24}>
    <Flex justify="space-between" align="center" width="100%">
      <Typography.Text 
        text="Delete Wallet" 
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
      text="Are you sure you want to delete this wallet? This action cannot be undone."
      fontSize={16}
      weight={400}
      color="#000000"
    />
    
    <Flex direction="column" gap={8}>
      <Button
        text="Delete Wallet"
        onClick={onDelete}
        className="w-full h-12 rounded-xl bg-red-500 hover:bg-red-600 font-medium text-white"
      />
      
      <Button
        onClick={onBack}
        className="w-full h-12 rounded-xl hover:bg-[#EFEFEF] font-medium text-black"
      >
        Cancel
      </Button>
    </Flex>
  </Flex>
);

export const WalletDetailsWindow = () => {
  const { flow, state } = useWalletDetailsWindowLogic();
  const [isDeletePopoverOpen, setIsDeletePopoverOpen] = useState(false);

  const handleClose = () => {
    state.setIsPopoverOpen(false);
    state.setShowPrivateKey(false);
  };

  const handleDeleteClose = () => {
    setIsDeletePopoverOpen(false);
  };

  const handleDelete = () => {
    flow.handleDeleteWallet();
    handleDeleteClose();
  };

  return (
    <Window
      isOpen={state.isWindowOpen}
      zIndex={5002}
      // btnText="Delete wallet"
      // btnType="danger"
      // btnOnClick={() => setIsDeletePopoverOpen(true)}
      // isBtnActive={state.isBtnActive}
      // isBtnDisabled={state.isLoading}
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
          label="Seed phrase" 
          justify="space-between"
          gap={15}
          copyValue={state.showPrivateKey ? state.openedWallet?.private_key : undefined} 
          onCopyLabel="Seed phrase copied" 
        >
          <Popover
            isOpen={state.isPopoverOpen}
            setIsOpen={state.setIsPopoverOpen}
            direction="bottom"
            popoverWidth="100%"
            wrapperWidth="100%"
            onClose={handleClose}
            trigger={
              <Flex justify="space-between" width="100%" align="center">
                <Typography.Text 
                  text={state.showPrivateKey ? state.openedWallet?.private_key : '•••••••••••••'} 
                  wrap="nowrap" 
                  width="85%" 
                  weight={350} 
                  fontSize={17} 
                />
                {state.showPrivateKey ? (
                  <CopyFillIcon 
                    width={18} 
                    height={18} 
                    fill="var(--secondaryText)" 
                    style={{ minWidth: '18px' }} 
                  />
                ) : (
                  <Image src={arrowIcon} alt='' width={24} height={24} />
                )}
              </Flex>
            }
          >
            <PrivateKeyPopover
              onCopyKey={flow.handleCopyPrivateKey}
              onBack={handleClose}
            />
          </Popover>
        </Field>
      </Flex>
      <Popover
        isOpen={isDeletePopoverOpen}
        setIsOpen={setIsDeletePopoverOpen}
        direction="bottom"
        popoverWidth="100%"
        wrapperWidth="100%"
        onClose={handleDeleteClose}
        trigger={
          <Button
            text="Delete wallet"
            onClick={() => setIsDeletePopoverOpen(true)}
            className="w-full h-12 rounded-xl mt-6"
            disabled={state.isLoading}
          />
        }
      />
        <DeleteWalletPopover
          onDelete={handleDelete}
          onBack={handleDeleteClose}
        />
    </Window>
  );
};

export default WalletDetailsWindow;