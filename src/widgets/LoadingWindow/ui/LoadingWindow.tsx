'use client';

import { getIsGlobalLoading, getWindowsOpen, GlobalWindow, GlobalWindowType } from '@/entities/Global';
import { AnimatePresence, motion } from 'framer-motion';
import styles from './LoadingWindow.module.scss';
import { useSelector } from 'react-redux';
import React, { useEffect } from 'react';
import DotSpinner from '@/shared/ui/DotSpinner/DotSpinner';

export const LoadingWindow = () => {
  const [zIndex, setZIndex] = React.useState(10000);
  const isGlobalLoading: boolean = useSelector(getIsGlobalLoading);
  const windows: GlobalWindowType<GlobalWindow>[] = useSelector(getWindowsOpen);

  // Only show loading for windows that don't ignore global loading
  const shouldShowLoading = isGlobalLoading && windows.every(window => !window.options?.ignoreGlobalLoading);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (!shouldShowLoading) {
      timer = setTimeout(() => {
        setZIndex(-1);
      }, 0.6 * 1000);
    } else {
      setZIndex(10000);
    }
    return () => {
      clearTimeout(timer);
    };
  }, [shouldShowLoading]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: shouldShowLoading ? 1 : 0, zIndex }}
        transition={{ ease: [0.32, 0.72, 0, 1], duration: 0.6 }}
        className={styles.loading_window}
      >
        <DotSpinner size="lg" />
      </motion.div>
    </AnimatePresence>
  );
};