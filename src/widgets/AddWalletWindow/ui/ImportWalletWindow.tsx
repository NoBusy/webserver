import { useImportWalletWindowLogic } from '../lib/hooks/useImportWalletWindowLogic';
import { DepositFillIcon } from '@/shared/assets/icons/DepositFillIcon';
import { WindowHeader } from '@/shared/ui/Header/WindowHeader';
import { networkSymbol } from '@/shared/consts/networkSymbol';
import { NetworkSelect } from '@/features/NetworkSelect';
import { Window } from '@/shared/ui/Window/Window';
import { Input } from '@/shared/ui/Input/Input';
import { Flex } from '@/shared/ui/Flex/Flex';

export const ImportWalletWindow = () => {
  const { flow, state } = useImportWalletWindowLogic();

  return (
    <Window
      zIndex={5004}
      btnText="Import"
      btnIcon={<DepositFillIcon fill="white" width={14} height={14} />}
      btnOnClick={flow.handleImportWallet}
      isBtnActive={state.isBtnActive}
      isBtnDisabled={state.isLoading}
      isOpen={state.isWindowOpen}
    >
      <NetworkSelect style={{ margin: '12px auto' }} />

      <WindowHeader
        title="Import Wallet"
        isLoading={state.isLoading}
        description={`Import an existing ${state.network && networkSymbol[state.network]} wallet`}
      />

      <Flex width="100%" direction="column" gap={12}>
        <Input placeholder="..." label="Wallet name" value={state.walletName} onChange={flow.handleWalletNameChange} />
        <Input placeholder="..." label="Private key" value={state.mnemonic} onChange={flow.handlePrivateKeyChange} />
      </Flex>
    </Window>
  );
};
