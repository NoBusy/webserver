import React, { useCallback } from 'react';
import { Typography } from '@/shared/ui/Typography/Typography';
import { getTokenImage } from '../../lib/helpers/getTokenImage';
import { Flex } from '@/shared/ui/Flex/Flex';
import { Token, walletActions } from '@/entities/Wallet';
import Image from 'next/image';
import Trash from '@/shared/assets/icons/trash.svg';
import { globalActions, GlobalWindow } from '@/entities/Global';
import { useDispatch } from 'react-redux';
import { motion, useAnimation } from 'framer-motion';

export interface WalletTokenProps {
  token: Token;
  isHidePrice?: boolean;
  onTokenClick?: (token: Token) => void;
  onDeleteToken?: (token: Token) => void;
  isEssentialToken?: boolean;
}

export const WalletPageToken: React.FC<WalletTokenProps> = React.memo(({ 
  token, 
  onDeleteToken, 
  isHidePrice, 
  onTokenClick,
  isEssentialToken = false
}) => {
  const dispatch = useDispatch();
  const controls = useAnimation();
  const [isDragging, setIsDragging] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);

  const handleClick = useCallback(() => {
    if (!isDragging) {
      dispatch(walletActions.setSelectedToken(token));
      dispatch(globalActions.addWindow({ window: GlobalWindow.TokenDetails }));
      onTokenClick?.(token);
    }
  }, [dispatch, onTokenClick, token, isDragging]);

  const handleDelete = useCallback(() => {
    onDeleteToken?.(token);
    controls.start({ x: 0 });
    setIsOpen(false);
  }, [onDeleteToken, token, controls]);

  const handleDragEnd = useCallback((event: any, info: any) => {
    const shouldOpen = !isOpen 
      ? info.offset.x < -40
      : info.offset.x > -40;

    if (shouldOpen && !isOpen) {
      controls.start({ x: -80 });
      setIsOpen(true);
    } else {
      controls.start({ x: 0 });
      setIsOpen(false);
    }
    setIsDragging(false);
  }, [controls, isOpen]);

  const priceChangeColor = token.price_change_percentage > 0 ? 'var(--green)' : 'var(--red)';
  const formattedBalance = token.balance !== 0 ? token.balance.toFixed(7) : '0';

  return (
    <div style={{ 
      position: 'relative',
      width: '100%',
      background: 'var(--primaryBg)',
      borderRadius: '16px',
      overflow: 'hidden',
      height: '60px'
    }}>
      {!isEssentialToken && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            height: '100%',
            width: '80px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'var(--primaryBg)',
            cursor: 'pointer'
          }}
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
        >
          <Flex align="center" gap={8}>
            <Image src={Trash} alt="" width={24} height={24} />
            <Typography.Text text="Delete" type="secondary" />
          </Flex>
        </div>
      )}

      <motion.div
        animate={controls}
        drag={!isEssentialToken ? "x" : false}
        dragConstraints={{ left: -80, right: 0 }}
        dragElastic={0}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          background: 'var(--secondaryBg)',
          borderRadius: '16px',
          zIndex: 1,
          cursor: !isEssentialToken ? 'grab' : 'pointer'
        }}
        onClick={handleClick}
      >
        <Flex
          width="100%"
          height="100%"
          align="center"
          padding="10px 16px"
          justify="space-between"
        >
          <Flex align="center" gap={12}>
            <Image 
              width={40} 
              height={40} 
              src={getTokenImage(token)} 
              alt="token-icon" 
              priority 
            />
            <Flex direction="column" gap={3}>
              <Typography.Text 
                text={`${token.symbol}`} 
                weight={550} 
                width={isHidePrice ? "250px" : "135px"} 
                wrap="nowrap" 
              />
              {isHidePrice ? (
                <Typography.Text 
                  text={`${token.balance} ${token.symbol}`} 
                  weight={450} 
                  align="left" 
                  wrap="nowrap" 
                  type="secondary" 
                />
              ) : (
                <Typography.Text
                  type="secondary"
                  wrap="nowrap"
                  text={
                    <>
                      ${token.price.toFixed(2)}{' '}
                      <Typography.Text
                        wrap="nowrap"
                        text={`${token.price_change_percentage.toFixed(2)}%`}
                        color={priceChangeColor}
                      />
                    </>
                  }
                />
              )}
            </Flex>
          </Flex>

          {!isHidePrice && (
            <Flex direction="column" align="flex-end" gap={3}>
              <Typography.Text 
                text={`${formattedBalance} ${token.symbol}`} 
                weight={550} 
                align="right" 
                wrap="nowrap" 
              />
              <Typography.Text 
                text={`${token.balance_usd.toFixed(2)}$`} 
                type="secondary" 
                align="right" 
                wrap="nowrap" 
              />
            </Flex>
          )}
        </Flex>
      </motion.div>
    </div>
  );
});

WalletPageToken.displayName = 'WalletPageToken';