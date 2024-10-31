import { PrepareTransferWindow } from '@/widgets/TransferWindow/ui/PrepareTransferWindow';
import { useTransferWindowLogic } from '../lib/hooks/useTransferWindowLogic';
import { UseTransferWindowLogic } from '../lib/hooks/useTransferWindowLogic';
import { ConfirmTransferWindow } from './ConfirmTransferWindow';
import { WindowHeader } from '@/shared/ui/Header/WindowHeader';
import { networkSymbol } from '@/shared/consts/networkSymbol';
import { WalletPageToken } from '@/fsdpages/WalletPage';
import { Window } from '@/shared/ui/Window/Window';
import { Flex } from '@/shared/ui/Flex/Flex';

export const TransferWindow = () => {
  const logic: UseTransferWindowLogic = useTransferWindowLogic();

  return (
    <>
      <Window isOpen={logic.state.isSelectTokensWindowOpen}>
        <WindowHeader
          title="Transfer"
          description={
            logic.state.isNoTokensToTransfer
              ? 'No tokens to transfer'
              : `Select the token to be transferred in the ${logic.state.network && networkSymbol[logic.state.network]} network`
          }
          descriptionType="secondary"
        />
        <Flex width="100%" direction="column" gap={12}>
          {logic.state.tokens.map((t) => (
            <WalletPageToken token={t} onTokenClick={logic.flow.handleTokenSelect} isHidePrice context='transfer' />
          ))}
        </Flex>
      </Window>

      <PrepareTransferWindow logic={logic} />
      <ConfirmTransferWindow logic={logic} />
    </>
  );
};
