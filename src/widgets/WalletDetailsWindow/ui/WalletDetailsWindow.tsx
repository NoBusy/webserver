import { useWalletDetailsWindowLogic } from '../lib/hooks/useWalletDetailsWindowLogic';
import { CopyFillIcon } from '@/shared/assets/icons/CopyFillIcon';
import { WindowHeader } from '@/shared/ui/Header/WindowHeader';
import { Typography } from '@/shared/ui/Typography/Typography';
import { networkSymbol } from '@/shared/consts/networkSymbol';
import { Window } from '@/shared/ui/Window/Window';
import { Field } from '@/shared/ui/Field/Field';
import { Flex } from '@/shared/ui/Flex/Flex';

export const WalletDetailsWindow = () => {
  const { flow, state } = useWalletDetailsWindowLogic();

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
          <Typography.Text text={state.openedWallet?.name} wrap="nowrap" fontSize={17} weight={350} />
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

        <Field label="Address" justify="space-between" copyValue={state.openedWallet?.address} onCopyLabel="Address copied" gap={15}>
          <Typography.Text text={state.openedWallet?.address} wrap="nowrap" width="85%" weight={350} fontSize={17} />
          <CopyFillIcon width={18} height={18} fill="var(--secondaryText)" style={{ minWidth: '18px' }} />
        </Field>

        <Field label="Private key" justify="space-between" copyValue={state.openedWallet?.private_key} onCopyLabel="Private key copied" gap={15}>
          <Typography.Text text={state.openedWallet?.private_key} wrap="nowrap" width="85%" weight={350} fontSize={17} />
          <CopyFillIcon width={18} height={18} fill="var(--secondaryText)" style={{ minWidth: '18px' }} />
        </Field>
      </Flex>
    </Window>
  );
};
