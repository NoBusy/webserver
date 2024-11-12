import { CloseInlineIcon } from '@/shared/assets/icons/CloseInlineIcon';
import  Qr  from '@/shared/assets/icons/qr.svg'; // Добавляем импорт иконки
import { useScanQrCode } from '@/shared/lib/hooks/useScanQr/useScanQr';// Добавляем импорт хука
import { Flex } from '@/shared/ui/Flex/Flex';
import styles from './Input.module.scss';
import cn from 'classnames';
import React from 'react';
import Image from 'next/image';

export interface InputProps {
  id?: string;
  type?: 'text' | 'password' | 'email' | 'number';
  icon?: React.ReactNode;
  value?: string;
  label?: string;
  name?: string;
  block?: boolean;
  theme?: 'light' | 'dark';
  readonly?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  size?: 'lg' | 'sm';
  className?: string;
  variant?: 'inline';
  onMaxButtonClick?: () => void;
  isHasMaxButton?: boolean;
  disabled?: boolean;
  isQrScanEnabled?: boolean;
}

export const Input: React.FC<InputProps> = (props) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { scanQr } = useScanQrCode();
  
  const options: Record<string, boolean | undefined> = {
    [styles.block]: props.block,
    [styles[props.theme ?? 'light']]: true,
    [styles.focused]: isFocused,
    [styles.readonly]: props.readonly,
    [styles.hasIcon]: !!props.icon,
    [styles.lg]: props.size === 'lg',
    [styles.sm]: props.size === 'sm',
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleClearClick = () => {
    props.value && props.onChange &&
    props.onChange({ target: { value: '' } } as React.ChangeEvent<HTMLInputElement>);
  };

  const handleScanQr = async () => {
    const result = await scanQr();
    if (result && props.onChange) {
      props.onChange({
        target: {
          value: result,
          name: props.name
        }
      } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  // Обработчик ввода с валидацией
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!props.onChange) return;

    // Если это не числовой инпут, пропускаем валидацию
    if (props.type !== 'number') {
      props.onChange(e);
      return;
    }

    let newValue = e.target.value;

    // Заменяем запятую на точку
    newValue = newValue.replace(',', '.');

    // Проверяем количество точек
    if ((newValue.match(/\./g) || []).length > 1) {
      return;
    }

    // Валидация для числового ввода
    const validNumberFormat = /^(0$|0\.\d*$|[1-9]\d*\.?\d*$)$/;
    
    // Обработка пустой строки
    if (newValue === '') {
      props.onChange({
        ...e,
        target: {
          ...e.target,
          value: ''
        }
      });
      return;
    }

    // Проверка на множественные нули в начале
    if (/^0[0-9]/.test(newValue)) {
      return;
    }

    // Проверяем формат и передаем значение, если оно валидно
    if (validNumberFormat.test(newValue)) {
      props.onChange({
        ...e,
        target: {
          ...e.target,
          value: newValue
        }
      });
    }
  };
  
  return (
    <div className={cn(styles.input_wrapper, options)}>
      {props.label && (
        <label htmlFor={props.id} className={styles.label}>
          {props.label}
        </label>
      )}
      <Flex
        width="inherit"
        height="fit-content"
        gap={0}
        className={cn(styles.input_container, props.className)}
      >
        {props.icon && props.icon}
        <input
          id={props.id}
          ref={inputRef}
          type={props.type === 'number' ? 'text' : props.type} // Меняем type="number" на type="text" для лучшего контроля
          name={props.name}
          value={props.value}
          onChange={handleInputChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={props.placeholder}
          className={styles.input}
          inputMode={props.type === 'number' ? 'decimal' : undefined} // Для удобства ввода на мобильных
        />
        {props.value && (
          <CloseInlineIcon
            width={18.5}
            height={18.5}
            onClick={handleClearClick}
          />
        )}
        {props.isQrScanEnabled && (
          <div onClick={handleScanQr} className={styles.qr_icon}>
            <Image src={Qr} alt='' width={18} height={18} />
          </div>
        )}
        {props.isHasMaxButton && !props.value && (
          <Flex onClick={props.onMaxButtonClick} className={styles.max_btn}>
            Max
          </Flex>
        )}
      </Flex>
    </div>
  );
};