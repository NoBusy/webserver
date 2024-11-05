'use client';

import { getIsGlobalLoading, getWindowsOpen, GlobalWindow, GlobalWindowType } from '@/entities/Global';
import { AnimatePresence, motion } from 'framer-motion';
import styles from './LoadingWindow.module.scss';
import { Flex } from '@/shared/ui/Flex/Flex';
import { useSelector } from 'react-redux';
import React, { useEffect } from 'react';
import Image from 'next/image';
import Yo from '@/shared/assets/icons/Yo.svg'
import Oy from '@/shared/assets/icons/Oy.svg'
import GradientSpinner from '@/shared/ui/GradientSpinner/GradientSpinner';
import DotSpinner from '@/shared/ui/DotSpinner/DotSpinner';
import { Typography } from '@/shared/ui/Typography/Typography';

export const LoadingWindow = () => {
  const [zIndex, setZIndex] = React.useState(10000);
  const isGlobalLoading: boolean = useSelector(getIsGlobalLoading);
  const windows: GlobalWindowType<GlobalWindow>[] = useSelector(getWindowsOpen);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (!isGlobalLoading) {
      timer = setTimeout(() => {
        setZIndex(-1);
      }, 0.6 * 1000);
    } else {
      setZIndex(10000);
    }

    return () => {
      clearTimeout(timer);
    };
  }, [isGlobalLoading]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: isGlobalLoading && windows.length === 0 ? 1 : 0, zIndex }}
        transition={{ ease: [0.32, 0.72, 0, 1], duration: 0.6 }}
        className={styles.loading_window}
      >
        <Flex direction="column" align="center" gap={12}>
          {/* <Image src={Yo} alt='' width={125} height={88}/>
          <Image src={Oy} alt='' width={125} height={88}/> */}
          <DotSpinner />
          <Typography.Text text = 'Loading...' type = 'secondary'/>
        </Flex>
      </motion.div>
    </AnimatePresence>
  );
};
