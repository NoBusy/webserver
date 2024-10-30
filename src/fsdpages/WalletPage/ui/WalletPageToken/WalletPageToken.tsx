import React from 'react';
import { Typography } from '@/shared/ui/Typography/Typography';
import { getTokenImage } from '../../lib/helpers/getTokenImage';
import { Flex } from '@/shared/ui/Flex/Flex';
import { Token } from '@/entities/Wallet';
import Image from 'next/image';
import Trash from '@/shared/assets/icons/trash.svg';
import { motion } from 'framer-motion';
import { useTokenTransactionsWindowLogic } from './useTokenTransactionWindowLogic';

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
  onTokenClick,
  isHidePrice,
  isEssentialToken = false
}) => {
  const { flow, state } = useTokenTransactionsWindowLogic();

  const priceChangeColor = token.price_change_percentage > 0 ? 'var(--green)' : 'var(--red)';
  const formattedBalance = flow.formatBalance(token.balance);

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
            onDeleteToken?.(token);
          }}
        >
          <Flex align="center" gap={8}>
            <Image src={Trash} alt="" width={24} height={24} />
            <Typography.Text text="Delete" type="secondary" />
          </Flex>
        </div>
      )}

      <motion.div
        animate={flow.controls}
        drag={!isEssentialToken ? "x" : false}
        dragConstraints={{ left: -80, right: 0 }}
        dragElastic={0}
        onDragStart={() => flow.setIsDragging(true)}
        onDragEnd={flow.handleDragEnd}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          background: 'var(--secondaryBg)',
          borderRadius: '16px',
          zIndex: 1,
          cursor: !isEssentialToken ? 'grab' : 'pointer'
        }}
        onClick={() => flow.handleTokenClick(token)}
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
              alt={`${token.symbol} icon`}
              priority 
              style={{ borderRadius: '50%' }}
            />
            <Flex direction="column" gap={3}>
              <Typography.Text 
                text={token.symbol}
                weight={550} 
                width={isHidePrice ? "250px" : "135px"} 
                wrap="nowrap" 
              />
              {isHidePrice ? (
                <Typography.Text 
                  text={`${formattedBalance} ${token.symbol}`}
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
                text={`$${token.balance_usd.toFixed(2)}`}
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