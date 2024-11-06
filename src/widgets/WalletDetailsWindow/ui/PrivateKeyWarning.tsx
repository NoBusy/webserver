import React, { FC } from 'react';
import { Typography } from '@/shared/ui/Typography/Typography';
import { Window } from '@/shared/ui/Window/Window';
import { Flex } from '@/shared/ui/Flex/Flex';

interface PrivateKeyWarningProps {
    isOpen: boolean;
    onClose?: () => void;
    onShowKey?: () => void;
}
const PrivateKeyWarning: FC<PrivateKeyWarningProps> = ({ isOpen, onClose, onShowKey }) => {
  return (
    <Window
      isOpen={isOpen}
      zIndex={5003}
      onClose={onClose}
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
            className="w-full py-3 px-4 bg-blue-500 text-white rounded-xl font-medium"
          >
            Показать приватный ключ
          </button>
          
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-gray-100 text-gray-900 rounded-xl font-medium"
          >
            Назад
          </button>
        </Flex>
      </Flex>
    </Window>
  );
};

export default PrivateKeyWarning;