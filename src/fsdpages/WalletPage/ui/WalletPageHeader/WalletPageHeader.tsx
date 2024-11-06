import { ArrowOutlineIcon } from '@/shared/assets/icons/ArrowOutlineIcon';
import { UsersOutlineIcon } from '@/shared/assets/icons/UsersOutlineIcon';
import { globalActions, GlobalWindow } from '@/entities/Global';
import { Typography } from '@/shared/ui/Typography/Typography';
import { NetworkSelect } from '@/features/NetworkSelect';
import { Button } from '@/shared/ui/Button/Button';
import { Flex } from '@/shared/ui/Flex/Flex';
import { useDispatch } from 'react-redux';

export const WalletPageHeader = () => {
  const dispatch = useDispatch();

  const handleWalletClick = async () => {
    dispatch(globalActions.addWindow({ window: GlobalWindow.WalletsList }));
  };

  const handleReferralClick = async () => {
    dispatch(globalActions.addWindow({ window: GlobalWindow.Referral }));
  };

  return (
    <Flex width="100%" align="center" justify="space-between">
      <Button height={40} onClick={handleReferralClick} type="inline">
        <UsersOutlineIcon width={20} height={20} fill="var(--text)" />
      </Button>

      <Flex gap={6} align="center">
        <Button height={40} onClick={handleWalletClick} type="inline">
          <Typography.Text text={'Wallet'} align="left" weight={550} />
          <ArrowOutlineIcon direction="right" />
        </Button>
        <NetworkSelect />
      </Flex>
    </Flex>
  );
};
