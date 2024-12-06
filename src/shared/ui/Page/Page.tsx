'use client';

import { getIsGlobalLoading, getWindowsOpen, GlobalWindow, GlobalWindowType } from '@/entities/Global';
import { getIsLoading } from '@/entities/Wallet';
import { useSelector } from 'react-redux';
import React, { useEffect, useState } from 'react';
import styles from './Page.module.scss';
import cn from 'classnames';

export interface PageProps {
  gap?: number;
  children: React.ReactNode;
  overflow?: React.CSSProperties['overflow'];
  centered?: boolean;
  direction?: 'row' | 'column';
  className?: string;
  styles?: React.CSSProperties;
}

// Page.tsx
export const Page: React.FC<PageProps> = (props) => {
  const { children, className } = props;
  const isWalletPageLoading = useSelector(getIsLoading);
  const isGlobalLoading = useSelector(getIsGlobalLoading);
  const windows = useSelector(getWindowsOpen);
  const pageRef = React.useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // Отложим первый рендер до следующего tick
  useEffect(() => {
    requestAnimationFrame(() => {
      setMounted(true);
    });
  }, []);

  const options: Record<string, boolean | undefined> = {
    [styles.centered]: props.centered,
  };

  const optionsStyles: React.CSSProperties = {
    gap: props.gap,
    overflow: props.overflow,
    flexDirection: props.direction,
    ...props.styles,
    // Добавляем opacity для плавного появления
    opacity: mounted ? 1 : 0,
    transition: 'opacity 0.1s'
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (!pageRef.current) return;
    if (isGlobalLoading || isWalletPageLoading || windows.length > 0) {
      pageRef.current.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      timeout = setTimeout(() => {
        pageRef.current && (pageRef.current.style.overflowY = 'hidden');
      }, 250);
    } else {
      pageRef.current.style.overflowY = 'scroll';
    }
    return () => {
      clearTimeout(timeout);
    };
  }, [pageRef, isGlobalLoading, isWalletPageLoading, windows]);

  if (!mounted) return null;

  return (
    <main ref={pageRef} style={optionsStyles} className={cn(styles.page, className, options)}>
      {children}
    </main>
  );
};