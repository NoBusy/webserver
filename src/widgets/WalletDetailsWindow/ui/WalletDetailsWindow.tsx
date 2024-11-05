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
import styles from './WalletDetailsWindow.module.scss';

// Добавьте эти стили в WalletDetailsWindow.module.scss
// .clickableField {
//   cursor: pointer;
//   transition: background-color 0.2s;
//
//   &:hover {
//     background-color: var(--hover-bg, rgba(0, 0, 0, 0.05));
//   }
//
//   &:active {
//     background-color: var(--active-bg, rgba(0, 0, 0, 0.1));
//   }
// }

interface WarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCopy: () => void;
  seedPhrase?: string;
}

const WarningModal: React.FC<WarningModalProps> = ({ 
  isOpen, 
  onClose, 
  onCopy, 
  seedPhrase 
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-[6000]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full max-w-md rounded-t-xl p-4 animate-slide-up">
        <div className="mb-4">
          <Typography.Text 
            text="Важная информация!"
            fontSize={20}
            weight={600}
          />
        </div>
        <div className="mb-6">
          <Typography.Text 
            text="Ваша seed-фраза может быть использована для доступа ко всем вашим средствам, поэтому не передавайте ее никому."
            fontSize={16}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Button
            type="primary"
            text="Показать seed-фразу"
            onClick={() => {
              if (seedPhrase) {
                navigator.clipboard.writeText(seedPhrase);
                onCopy();
              }
            }}
            block
          />
          <Button
            type="default"
            text="Назад"
            onClick={onClose}
            block
          />
        </div>
      </div>
    </div>
  );
};

export const WalletDetailsWindow = () => {
  const { flow, state } = useWalletDetailsWindowLogic();
  const [showWarning, setShowWarning] = useState(false);

  const handleSeedPhraseClick = () => {
    setShowWarning(true);
  };

  return (
    <>
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

          <Button
            type="text"
            text="Показать seed-фразу"
            onClick={handleSeedPhraseClick}
            style={{
              textAlign: 'left',
              fontSize: '17px',
              fontWeight: 350,
              padding: '8px 12px',
            }}
          />
        </Flex>
      </Window>

      <WarningModal 
        isOpen={showWarning}
        onClose={() => setShowWarning(false)}
        onCopy={() => {
          setShowWarning(false);
          // Можно добавить toast уведомление о успешном копировании
        }}
        seedPhrase={state.openedWallet?.private_key}
      />
    </>
  );
};

export default WalletDetailsWindow;