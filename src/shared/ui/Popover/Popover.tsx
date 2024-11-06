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
  direction?: 'left' | 'right' | 'center' | 'bottom'; // добавляем 'bottom'
  wrapperWidth?: React.CSSProperties['width'];
  popoverWidth?: React.CSSProperties['width'];
  top?: React.CSSProperties['top'];
}

export const Popover: React.FC<PopoverProps> = (props) => {
  const { isOpen, setIsOpen } = props;

  const [transformOrigin, setTransformOrigin] = React.useState<React.CSSProperties['transformOrigin']>('top right');
  const [position, setPosition] = React.useState<React.CSSProperties>({
    top: 'auto',
    right: 'auto',
    left: 'auto',
    bottom: 'auto',
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
    width: props.direction === 'bottom' ? '100%' : props.popoverWidth,
  };

  const popoverWrapperStyles: React.CSSProperties = {
    width: props.wrapperWidth,
  };

  React.useEffect(() => {
    if (!popoverRef.current || !isOpen) return;

    if (props.direction === 'bottom') {
      setTransformOrigin('center bottom');
      setPosition({
        bottom: 0,
        left: 0,
        right: 0,
        top: 'auto',
      });
    } else if (props.direction === 'center') {
      setTransformOrigin('top center');
      setPosition({ top: props.top ?? '125%', left: '-250%' });
    } else if (props.direction === 'left') {
      setTransformOrigin('top left');
      setPosition({ top: props.top ?? '125%', left: '0' });
    } else if (props.direction === 'right') {
      setTransformOrigin('top right');
      setPosition({ top: props.top ?? '125%', right: '0' });
    }
  }, [isOpen, props.direction, props.top]);

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
              y: props.direction === 'bottom' ? 100 : 0,
              scale: props.direction === 'bottom' ? 1 : 0.35,
              opacity: 0 
            }}
            animate={{
              y: 0,
              scale: 1,
              opacity: 1,
            }}
            initial={{ 
              y: props.direction === 'bottom' ? 100 : 0,
              scale: props.direction === 'bottom' ? 1 : 0.35,
              opacity: 0 
            }}
            transition={{
              ease: [0.32, 0.2, 0, 1.1],
              duration: 0.42,
            }}
            style={{
              left: position.left,
              right: position.right,
              top: position.top,
              bottom: position.bottom,
              ...popoverStyles,
              transformOrigin,
            }}
            className={`${styles.popover} ${props.direction === 'bottom' ? styles.bottom : ''}`}
          >
            {props.children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};