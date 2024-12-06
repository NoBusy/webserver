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

export const Page: React.FC<PageProps> = (props) => {
  const { children, className } = props;
  const [isContentReady, setIsContentReady] = useState(false);
  const isWalletPageLoading: boolean = useSelector(getIsLoading);
  const isGlobalLoading: boolean = useSelector(getIsGlobalLoading);
  const windows: GlobalWindowType<GlobalWindow>[] = useSelector(getWindowsOpen);
  const pageRef: React.RefObject<HTMLDivElement> = React.useRef<HTMLDivElement>(null);

  const options: Record<string, boolean | undefined> = {
    [styles.centered]: props.centered,
  };

  const optionsStyles: React.CSSProperties = {
    gap: props.gap,
    overflow: props.overflow,
    flexDirection: props.direction,
    ...props.styles,
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (!pageRef.current) return;

    if (isGlobalLoading || isWalletPageLoading || windows.length > 0) {
      pageRef.current.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      timeout = setTimeout(() => {
        if (pageRef.current) {
          pageRef.current.style.overflowY = 'hidden';
        }
      }, 250);
    } else {
      pageRef.current.style.overflowY = 'scroll';
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [pageRef, isGlobalLoading, isWalletPageLoading, windows]);

  // Эффект для плавного появления контента
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsContentReady(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main 
      ref={pageRef} 
      style={optionsStyles} 
      className={cn(styles.page, className, options)}
    >
      <div className={cn(styles.content, { [styles.contentLoaded]: isContentReady })}>
        {children}
      </div>
    </main>
  );
};