'use client';

import { useClickOutside } from '@/shared/lib/hooks/useClickOutside/useClickOutside';
import { AnimatePresence, motion } from 'framer-motion';
import { Flex } from '@/shared/ui/Flex/Flex';
import styles from './Popover.module.scss';
import React from 'react';

export interface PopoverProps {
  ease?: 'desktop' | 'mobile';
  isOpen: boolean;
  trigger: React.ReactNode;
  onOpen?: () => void;
  onClose?: () => void;
  children?: React.ReactNode;
  setIsOpen: (isOpen: boolean) => void;
  direction?: 'left' | 'right' | 'center';
  wrapperWidth?: React.CSSProperties['width'];
  popoverWidth?: React.CSSProperties['width'];
  top?: React.CSSProperties['top'];
}

export const Popover: React.FC<PopoverProps> = (props) => {
  const { isOpen, setIsOpen } = props;

  const [transformOrigin, setTransformOrigin] = React.useState<React.CSSProperties['transformOrigin']>('top right');
  const [position, setPosition] = React.useState<React.CSSProperties>({
    top: props.top ?? '125%',
    right: '-110%',
    left: 'initial',
    bottom: 'initial',
  });

  const popoverRef: React.RefObject<HTMLDivElement> = React.useRef(null);
  const ref: React.RefObject<HTMLDivElement> = useClickOutside(() => {
    if (!isOpen) return;
    setIsOpen && setIsOpen(false);
    props?.onClose && props.onClose();
  });

  const handleTriggerClick = () => {
    setIsOpen && setIsOpen(!isOpen);
    !isOpen && props?.onOpen && props.onOpen();
    isOpen && props?.onClose && props.onClose();
  };

  const popoverStyles: React.CSSProperties = {
    width: props.popoverWidth,
  };

  const popoverWrapperStyles: React.CSSProperties = {
    width: props.wrapperWidth,
  };

  React.useEffect(() => {
    const checkPosition = (type?: 'secondary') => {
      if (!popoverRef.current || !isOpen) return;

      // Получаем данные о позиции и размерах поповера
      const rect: DOMRect = popoverRef.current.getBoundingClientRect();

      // Если выходит за правую границу экрана
      // const isOutOfRightWindowBorder: boolean = rect.right > window.innerWidth;
      // Если выходит за левую границу экрана
      // const isOutOfLeftWindowBorder: boolean = rect.left < 0;
      // Если выходит за нижнюю границу экрана
      const isOutOfBottomWindowBorder: boolean = rect.bottom * 1.05 > window.innerHeight;

      // if (isOutOfRightWindowBorder) {
      //   setPosition({ top: props.top ?? '110%', right: '0' });
      // }
      //
      // if (isOutOfLeftWindowBorder) {
      //   setTransformOrigin('top left');
      //   setPosition({ top: props.top ?? '110%', left: '0' });
      // }

      if (props.direction === 'center') {
        setTransformOrigin('top center');
        setPosition({ top: props.top ?? '125%', left: '-250%' });
      }

      if (props.direction === 'left') {
        setTransformOrigin('top left');
        setPosition({ top: props.top ?? '125%', left: '0' });
      }

      if (props.direction === 'right') {
        setTransformOrigin('top right');
        setPosition({ top: props.top ?? '125%', right: '0' });
      }

      if (isOutOfBottomWindowBorder && type === 'secondary') {
        setPosition((prev) => ({
          ...prev,
          transform: `translate(0, -${(rect.bottom - window.innerHeight) * 1.075}px)`,
        }));
      }
    };

    checkPosition();

    const timeout = setTimeout(() => checkPosition('secondary'), 350);

    return () => {
      clearTimeout(timeout);
      setPosition({
        top: props.top ?? '110%',
        right: '-110%',
        left: 'initial',
        bottom: 'initial',
      });
    };
  }, [popoverRef, isOpen, props.direction]);

  return (
    <div ref={ref} className={styles.popover_wrapper} style={popoverWrapperStyles}>
      <Flex width="100%" className={styles.trigger} onClick={handleTriggerClick}>
        {props.trigger}
      </Flex>
      <AnimatePresence>
        {isOpen && (
          <motion.div
          ref={popoverRef}
          exit={{ 
            y: "100%",
            opacity: 0 
          }}
          animate={{
            y: 0,
            opacity: 1
          }}
          initial={{ 
            y: "100%",
            opacity: 0 
          }}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 120
          }}
          style={{
            left: position.left,
            right: position.right,
            ...popoverStyles,
            transformOrigin,
          }}
          className={styles.popover}
        >
          {props.children}
        </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
