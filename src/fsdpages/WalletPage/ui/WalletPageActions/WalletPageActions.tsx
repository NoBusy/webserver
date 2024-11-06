import { MessageOutlineIcon } from '@/shared/assets/icons/MessageOutlineIcon';
import { ArrowOutlineIcon } from '@/shared/assets/icons/ArrowOutlineIcon';
import { UsersOutlineIcon } from '@/shared/assets/icons/UsersOutlineIcon';
import { globalActions, GlobalWindow } from '@/entities/Global';
import { Typography } from '@/shared/ui/Typography/Typography';
import { BurgerIcon } from '@/shared/assets/icons/BurgerIcon';
import { Field } from '@/shared/ui/Field/Field';
import { Flex } from '@/shared/ui/Flex/Flex';
import { useDispatch } from 'react-redux';


export const WalletPageActions = () => {
  const dispatch = useDispatch();
  
  const handleReferralClick = async () => {
    dispatch(globalActions.addWindow({ window: GlobalWindow.Referral }));
  };

  const handleTransactionsHistoryClick = async () => {
    dispatch(globalActions.addWindow({ window: GlobalWindow.TransactionsHistory }));
  };

  return (
    <Flex width="100%" direction="column" gap={12}>
      <Field width="100%" padding="12px 16px" onClick={handleTransactionsHistoryClick}>
        <Flex width="100%" align="center" gap={12}>
          <Flex width="40px" height="35px" align="center" justify="center" radius="8px" bg="var(--bg)">
            <BurgerIcon />
          </Flex>
          <Typography.Text text="Transactions History" align="left" fontSize={16} weight={450} block />
          <ArrowOutlineIcon direction="right" width={17} height={21} />
        </Flex>
      </Field>

      <Field width="100%" padding="12px 16px" onClick={handleReferralClick}>
        <Flex width="100%" align="center" gap={12}>
          <Flex width="40px" height="35px" align="center" justify="center" radius="8px" bg="var(--accent)">
            <UsersOutlineIcon width={21} height={21} fill="white" />
          </Flex>
          <Typography.Text text="Referral program" align="left" fontSize={16} weight={450} block />
          <ArrowOutlineIcon direction="right" width={17} height={21} />
        </Flex>
      </Field>

      <Field width="100%" padding="12px 16px">
        <Flex width="100%" align="center" gap={12}>
          <Flex width="40px" height="35px" align="center" justify="center" radius="8px" bg="var(--yellow)">
            <MessageOutlineIcon width={20} height={20} fill="white" />
          </Flex>
          <Typography.Text text="Contact support" align="left" fontSize={16} weight={450} block />
          <ArrowOutlineIcon direction="right" width={17} height={21} />
        </Flex>
      </Field>
    </Flex>
  );
};
