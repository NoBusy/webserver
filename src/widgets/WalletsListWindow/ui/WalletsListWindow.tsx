import { useWalletsListWindowLogic } from '../lib/hooks/useWalletsListWindowLogic';
import { DepositFillIcon } from '@/shared/assets/icons/DepositFillIcon';
import { WindowHeader } from '@/shared/ui/Header/WindowHeader';
import { Typography } from '@/shared/ui/Typography/Typography';
import { networkSymbol } from '@/shared/consts/networkSymbol';
import { DotsIcon } from '@/shared/assets/icons/DotsIcon';
import styles from './WalletsListWindow.module.scss';
import { Window } from '@/shared/ui/Window/Window';
import { Flex } from '@/shared/ui/Flex/Flex';


export const WalletsListWindow = () => {
  const { flow, state } = useWalletsListWindowLogic();
  

  const currentNetworkSymbol = state.selectedNetwork ? networkSymbol[state.selectedNetwork] : '';

  return (
    <Window
      isOpen={state.isWindowOpen}
      btnText="Add wallet"
      btnIcon={<DepositFillIcon width={14} height={14} fill="white" />}
      btnOnClick={flow.handleAddWallet}
      isBtnActive
      isBtnDisabled={state.isLoading}
    >
      <WindowHeader 
        title={`Choose ${currentNetworkSymbol} wallet`}
        isLoading={state.isLoading} 
      />
      <Flex width="100%" direction="column" gap={12} padding="0 0 12px">
        {state.wallets.length > 0 ? (
          state.wallets.map((w) => (
            <Flex key={w.id} className={styles.wallet} onClick={() => flow.handleWalletClick(w)}>
              {state.selectedWallet?.id === w.id && <Flex className={styles.wallet_selected_pill} />}
              <Flex direction="column" gap={3}>
                <Typography.Text 
                  text={`${w.name} (${networkSymbol[w.network]})`} 
                  fontSize={16} 
                  weight={550} 
                />
                <Typography.Text 
                  text={`${w?.address.slice(0, 4) ?? '.'}...${w?.address.slice(-4) ?? '.'}`} 
                  type="secondary" 
                />
              </Flex>
              <DotsIcon
                onClick={(e) => {
                  e.stopPropagation();
                  flow.handleOpenWalletDetailsWindow(w);
                }}
              />
            </Flex>
          ))
        ) : (
          <Flex align="center" justify="center" padding="20px">
            <Typography.Text 
              text={`No wallets found${currentNetworkSymbol ? ` for ${currentNetworkSymbol}` : ''}`}
              type="secondary"
            />
          </Flex>
        )}
      </Flex>
    </Window>
  );
};