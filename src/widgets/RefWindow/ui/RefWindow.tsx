import { UsersPlusOutlineIcon } from '@/shared/assets/icons/UsersPlusOutlineIcon';
import { UsersOutlineIcon } from '@/shared/assets/icons/UsersOutlineIcon';
import { useRefWindowLogic } from '../lib/hooks/useRefWindowLogic';
import { SendFillIcon } from '@/shared/assets/icons/SendFillIcon';
import UsdtIcon from '@/shared/assets/icons/USDTCircleIcon.svg';
import { Typography } from '@/shared/ui/Typography/Typography';
import { Divider } from '@/shared/ui/Divider/Divider';
import { Window } from '@/shared/ui/Window/Window';
import { Button } from '@/shared/ui/Button/Button';
import { Field } from '@/shared/ui/Field/Field';
import { Flex } from '@/shared/ui/Flex/Flex';
import Image from 'next/image';
import styles from './RefWindow.module.scss'

export const RefWindow = () => {
  const { flow, state } = useRefWindowLogic();

  return (
    <Window isOpen={state.isWindowOpen} setIsOpen={flow.handleWindowClose}>
      <Flex width="100%" direction="column" gap={24}>
        <Flex width="100%" direction="column" align="center" padding="16px 0 0 0" gap={16}>
          <Flex radius="15px" width="60px" align="center" justify="center" height="60px" bg="var(--accentBg)">
            <UsersOutlineIcon fill="var(--accent)" width={28} height={28} />
          </Flex>
          <Flex width="100%" direction="column" align="center" gap={3}>
            <Typography.Title text="Referral program" fontSize={20} weight={600} />
            <Typography.Text text="Invite your friends and earn from their commission" align="center" fontSize={16} />
          </Flex>
        </Flex>

        <Field padding="14px 16px" direction="column" gap={10}>
            <Typography.Text text="Your referral link" type="secondary" fontSize={16} />
            <Field bg="var(--bg)" align="center" justify="center" copyValue={state.refProgram?.link ?? ''} onCopyLabel="Referral link copied">
              <Typography.Text text={state.refProgram?.link ?? '-'} align="center" width="275px" wrap="nowrap" weight={400} fontSize={17} />
            </Field>
            <Button type="primary" height="50px" onClick={flow.handleSendLinkClick} block>
              Send link
            </Button>
          </Field>

        <Flex width="100%" direction="column" gap={8}>
          <Field justify="space-between" padding="14px 16px">
            <Flex direction="column" gap={6}>
              <Typography.Text text="Earned all the time" type="secondary" />
              <Flex align="center" gap={6}>
                <Image src={UsdtIcon} alt="usdt-icon" />
                <Typography.Text text="0" fontSize={18} />
              </Flex>
            </Flex>
            <Flex bg="var(--referralsCountBg)" padding="4px 10px" align="center" radius="8px" gap={8}>
              <UsersPlusOutlineIcon />
              <Typography.Text text={state.refProgram?.invited_count ?? 0} fontSize={18} />
            </Flex>
          </Field>

          <Field padding="14px 16px" direction="column" gap={12}>
            <Flex width="100%" justify="space-between">
              <Flex direction="column" gap={6}>
                <Typography.Text text="Available balance" type="secondary" />
                <Flex align="center" gap={6}>
                  <Image src={UsdtIcon} alt="usdt-icon" />
                  <Typography.Text text={state.refProgram?.balance ?? 0} fontSize={18} />
                </Flex>
              </Flex>
              <Flex bg="var(--withdrawalBtnBg)" padding="0 16px" height="36px" align="center" radius="8px" gap={8}>
                <SendFillIcon width={16} height={16} fill="var(--secondaryText)" />
                <Typography.Text text="Withdraw" type="secondary" weight={550} />
              </Flex>
            </Flex>
            <Divider />
            <Flex width="100%" direction="column" gap={4.5}>
              <Typography.Text text="- Minimum withdrawal from 10$" type="secondary" />
              <Typography.Text text="- Withdrawal time: up to 72 working hours" type="secondary" />
              <Typography.Text text="- USDT will be accrued on the BEP-20 network" type="secondary" />
            </Flex>
          </Field>

          <Field padding="14px 16px 14px" direction="column" gap={8}>
            <Flex width="100%" justify="space-between" noFlex>
              <Flex direction="column" gap={6}>
                <Typography.Text text="Statistics" type="secondary" />
                <Flex bg="var(--bg)" radius="12px" padding="2px" width="100%" >
                  <Button 
                    className = {styles.button}
                    type="primary"
                    height="36px"
                    onClick={() => flow.setPeriod('all')}
                    disabled={state.period == 'all'}
                    block
                  >
                    All the time 
                  </Button>
                  <Button 
                    className = {styles.button}
                    type="primary"
                    height="36px"
                    onClick={() => flow.setPeriod('30days')}
                    disabled={state.period == '30days'}
                    block
                  >
                    Last 30 days
                  </Button>
                </Flex>
                <Flex align="center" gap={6}>
                  <Image src={UsdtIcon} alt="usdt-icon" />
                  <Typography.Text text={state.refProgram?.[state.period === 'all' ? 'total_swap_volume_usd' : 'monthly_swap_volume_usd'] ?? 0} fontSize={18} />
                </Flex>
              </Flex>
            </Flex>
            <Divider />
            <Flex width="100%" direction="column" gap={4.5}>
              <Typography.Text text="- The YoYo's commission is 1 %" type="secondary" />
              <Typography.Text text="- Your referral share is 30% of the commission" type="secondary" />
            </Flex>
          </Field>
        </Flex>
      </Flex>
    </Window>
  );
};
