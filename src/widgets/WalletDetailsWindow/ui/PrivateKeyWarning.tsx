'use client';

import React, { FC } from 'react';
import { Typography } from '@/shared/ui/Typography/Typography';
import { Flex } from '@/shared/ui/Flex/Flex';
import { Popover } from '@/shared/ui/Popover/Popover';
import styles from './PrivateKeyWarning.module.scss';

interface PrivateKeyWarningProps {
  isOpen: boolean;
  onClose?: () => void;
  onShowKey?: () => void;
  trigger: React.ReactNode;
  setIsOpen: (isOpen: boolean) => void;
}

const PrivateKeyWarning: FC<PrivateKeyWarningProps> = ({ isOpen, onClose, onShowKey, trigger, setIsOpen }) => {
  return (
    <Popover
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      trigger={trigger}
      onClose={onClose}
      direction="center"
      wrapperWidth="100%"
      popoverWidth="100%"
      top="50%"
    >
      <div className={styles.warningContent}>
        <Flex 
          direction="column" 
          gap={20} 
          align="center" 
          justify="center"
          className="p-4"
        >
          <Typography.Text
            text="Важная информация!"
            fontSize={20}
            weight={600}
            className="mb-2"
          />
          
          <Typography.Text
            text="Ваш приватный ключ может быть использован для доступа ко всем вашим средствам, поэтому не передавайте его никому."
            fontSize={16}
            weight={400}
            align="center"
          />

          <Flex direction="column" width="100%" gap={12}>
            <button className={styles.primaryButton} onClick={onShowKey}>
              Показать приватный ключ
            </button>
            
            <button className={styles.secondaryButton} onClick={onClose}>
              Назад
            </button>
          </Flex>
        </Flex>
      </div>
    </Popover>
  );
};

export default PrivateKeyWarning;