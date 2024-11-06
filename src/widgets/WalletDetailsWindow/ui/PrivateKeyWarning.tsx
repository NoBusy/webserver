'use client';

import React, { FC } from 'react';
import { Typography } from '@/shared/ui/Typography/Typography';
import { Flex } from '@/shared/ui/Flex/Flex';
import styles from './PrivateKeyWarning.module.css';

interface PrivateKeyWarningProps {
  isOpen: boolean;
  onClose?: () => void;
  onShowKey?: () => void;
}

const PrivateKeyWarning: FC<PrivateKeyWarningProps> = ({ isOpen, onClose, onShowKey }) => {
  console.log('PrivateKeyWarning rendered, isOpen:', isOpen); // Отладочный лог

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-[5003]"
      onClick={onClose} // Добавляем закрытие по клику на фон
    >
      <div 
        className={`bg-white rounded-t-[12px] w-full max-h-[50vh] ${styles.slideUp}`}
        style={{
          boxShadow: '0px -4px 10px rgba(0, 0, 0, 0.1)'
        }}
        onClick={e => e.stopPropagation()} // Предотвращаем закрытие при клике на контент
      >
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
            <button
              onClick={onShowKey}
              className="w-full py-3 px-4 bg-[#007AFF] text-white rounded-xl font-medium active:bg-[#0056B3]"
            >
              Показать приватный ключ
            </button>
            
            <button
              onClick={onClose}
              className="w-full py-3 px-4 bg-[#F2F2F7] text-black rounded-xl font-medium active:bg-[#E5E5EA]"
            >
              Назад
            </button>
          </Flex>
        </Flex>
      </div>
    </div>
  );
};

export default PrivateKeyWarning;