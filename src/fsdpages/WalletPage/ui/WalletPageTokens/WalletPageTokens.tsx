'use client';

import { ArrowOutlineIcon } from '@/shared/assets/icons/ArrowOutlineIcon';
import { DepositFillIcon } from '@/shared/assets/icons/DepositFillIcon';
import { WalletPageToken } from '../WalletPageToken/WalletPageToken';
import { globalActions, GlobalWindow } from '@/entities/Global';
import { Typography } from '@/shared/ui/Typography/Typography';
import { getSelectedWallet, Wallet, Token, Network, walletApi } from '@/entities/Wallet';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@/shared/ui/Button/Button';
import { Flex } from '@/shared/ui/Flex/Flex';
import React, { useState, useMemo } from 'react';
import { useToasts } from '@/shared/lib/hooks/useToasts/useToasts';
import { motion } from 'framer-motion';
import { useHapticFeedback } from '@/shared/lib/hooks/useHapticFeedback/useHapticFeedback';

const TOKEN_HEIGHT = 66;
const SPACING = 8;
const MAX_VISIBLE_TOKENS = 4;

const isEssentialToken = (token: Token, network: Network): boolean => {
  switch (network) {
    case Network.ETH:
      return token.symbol === 'ETH' || token.symbol === 'USDT';
    case Network.BSC:
      return token.symbol === 'BNB' || token.symbol === 'USDT';
    case Network.SOL:
      return token.symbol === 'SOL' || token.symbol === 'USDT';
    case Network.TON:
      return token.symbol === 'TON' || token.symbol === 'USDT';
    default:
      return false;
  }
};

export const WalletPageTokens = () => {
  const dispatch = useDispatch();
  const { errorToast, successToast } = useToasts();
  const [getWalletsRequest] = walletApi.useLazyGetWalletsQuery();
  const [deleteWalletToken] = walletApi.useDeleteWalletTokenMutation();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const selectedWallet = useSelector(getSelectedWallet);
  const { notify } = useHapticFeedback();


  const tokens = selectedWallet?.tokens || [];
  const visibleTokens = useMemo(() => {
    return isCollapsed ? tokens.slice(0, MAX_VISIBLE_TOKENS) : tokens;
  }, [tokens, isCollapsed]);

  const containerHeight = useMemo(() => {
    const tokenCount = isCollapsed ? Math.min(MAX_VISIBLE_TOKENS, tokens.length) : tokens.length;
    return tokenCount * TOKEN_HEIGHT + (tokenCount - 1) * SPACING;
  }, [tokens.length, isCollapsed]);

  const handleDeleteToken = async (token: Token) => {
    if (!selectedWallet) return;
    try {
      const result = await deleteWalletToken({
        wallet_id: selectedWallet.id,
        token_id: token.id,
      }).unwrap();
      if (result.ok) {
        notify('success');
        successToast('Token deleted');
        getWalletsRequest();
      } 
    } catch (e) {
 
    }
  };

  const handleShowMoreClick = () => {
    setIsCollapsed(prev => !prev);
  };

  const handleAddTokenButtonClick = async () => {
    dispatch(globalActions.addWindow({ window: GlobalWindow.AddToken }));
  };

  return (
    <Flex width="100%" direction="column" gap={8}>
      <motion.div
        animate={{ height: containerHeight }}
        transition={{ duration: 0.3 }}
        style={{
          width: '100%',
          overflow: 'hidden'
        }}
      >
        <Flex direction="column" gap={8}>
          {visibleTokens.map((token) => (
            <WalletPageToken
              key={token.id}
              token={token}
              isEssentialToken={selectedWallet?.network ? isEssentialToken(token, selectedWallet.network) : false}
              onDeleteToken={handleDeleteToken}
            />
          ))}
        </Flex>
      </motion.div>
      
      {tokens.length > MAX_VISIBLE_TOKENS && (
        <Flex justify="center" width="100%">
          <Button type="text" onClick={handleShowMoreClick}>
            <Flex align="center" gap={4}>
              <Typography.Text 
                text={isCollapsed ? 'Show more' : 'Show less'} 
                type="secondary" 
                weight={400} 
                fontSize={16} 
              />
              <ArrowOutlineIcon 
                style={{ 
                  transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)',
                  transition: 'transform 0.3s ease'
                }} 
              />
            </Flex>
          </Button>
        </Flex>
      )}

      <Button 
        type="primary" 
        height={50} 
        style={{ marginTop: '12px' }}
        onClick={handleAddTokenButtonClick}
      >
        <DepositFillIcon width={17} height={17} fill="white" />
        <Typography.Text text="Add token" color="white" fontSize={17} />
      </Button>
    </Flex>
  );
};