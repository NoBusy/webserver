'use client';

import React, { FC } from 'react';
import { Typography } from '@/shared/ui/Typography/Typography';
import { Flex } from '@/shared/ui/Flex/Flex';
import { Popover } from '@/shared/ui/Popover/Popover';
import styles from './PrivateKeyWarning.module.scss';

interface PrivateKeyWarningProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onClose?: () => void;
  onShowKey?: () => void;
  trigger: React.ReactNode;
}

const PrivateKeyWarning: FC<PrivateKeyWarningProps> = ({ 
  isOpen, 
  setIsOpen, 
  onClose, 
  onShowKey, 
  trigger 
}) => {
  // Добавим логи для отладки
  console.log('PrivateKeyWarning render, isOpen:', isOpen);

  return (
    <Popover
      isOpen={isOpen}
      setIsOpen={setIsOpen}
      trigger={trigger}
      onClose={onClose}
      direction="center"
    >
      <div className="bg-white p-4 rounded-xl">
        <Typography.Text
          text="Важная информация!"
          fontSize={20}
          weight={600}
        />
        <button 
          className="mt-4 w-full py-3 px-4 bg-blue-500 text-white rounded-xl"
          onClick={onShowKey}
        >
          Показать
        </button>
      </div>
    </Popover>
  );
};

export default PrivateKeyWarning;