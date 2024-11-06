import { useWalletDetailsWindowLogic } from '../lib/hooks/useWalletDetailsWindowLogic';
import { CopyFillIcon } from '@/shared/assets/icons/CopyFillIcon';
import { WindowHeader } from '@/shared/ui/Header/WindowHeader';
import { Typography } from '@/shared/ui/Typography/Typography';
import { networkSymbol } from '@/shared/consts/networkSymbol';
import { Window } from '@/shared/ui/Window/Window';
import { Field } from '@/shared/ui/Field/Field';
import { Flex } from '@/shared/ui/Flex/Flex';
import PrivateKeyWarning from './PrivateKeyWarning';
import { useState } from 'react';

  export const WalletDetailsWindow = () => {
    const { flow, state } = useWalletDetailsWindowLogic();
    const [showPrivateKeyWarning, setShowPrivateKeyWarning] = useState(false);
    
    // Добавим логи для отладки
    console.log('WalletDetailsWindow render, showPrivateKeyWarning:', showPrivateKeyWarning);
  
    const handleFieldClick = () => {
      console.log('Field clicked, setting showPrivateKeyWarning to true');
      setShowPrivateKeyWarning(true);
    };
  
    const PrivateKeyField = (
      <div onClick={handleFieldClick} style={{ cursor: 'pointer' }}>
        <Field 
          label="Private key" 
          justify="space-between" 
          gap={15}
        >
          <Typography.Text 
            text="********" 
            wrap="nowrap" 
            width="85%" 
            weight={350} 
            fontSize={17} 
          />
          <CopyFillIcon width={18} height={18} fill="var(--secondaryText)" />
        </Field>
      </div>
    );
  
    return (
      <Window
        isOpen={state.isWindowOpen}
        zIndex={5002}
      >
        <WindowHeader title="Wallet details" />
        <Flex width="100%" direction="column" gap={12}>
          <PrivateKeyWarning
            isOpen={showPrivateKeyWarning}
            setIsOpen={setShowPrivateKeyWarning}
            onClose={() => setShowPrivateKeyWarning(false)}
            onShowKey={() => {
              console.log('Show key clicked');
              setShowPrivateKeyWarning(false);
            }}
            trigger={PrivateKeyField}
          />
        </Flex>
      </Window>
    );
  };