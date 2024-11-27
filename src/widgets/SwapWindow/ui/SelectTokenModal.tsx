import React, { useState, useCallback, useEffect } from 'react';
import { Flex } from '@/shared/ui/Flex/Flex';
import { Typography } from '@/shared/ui/Typography/Typography';
import { Button } from '@/shared/ui/Button/Button';
import { Input } from '@/shared/ui/Input/Input';
import Image from 'next/image';
import { useDebounce } from '@/shared/lib/hooks/useDebounce/useDebounce';
import { walletApi, Network, Token } from '@/entities/Wallet';
import { useSelector } from 'react-redux';
import { getSelectedWallet } from '@/entities/Wallet';
import { Window } from '@/shared/ui/Window/Window';
import { WindowHeader } from '@/shared/ui/Header/WindowHeader';
import { getTokenImage } from '@/fsdpages/WalletPage';
import { GlobalWindow, getIsWindowOpen } from '@/entities/Global';
import { useToastManager } from '@/shared/lib/hooks/useToastManager/useToastManager';
import { useToasts } from '@/shared/lib/hooks/useToasts/useToasts';

interface SelectTokenPageProps {
  tokens: Token[];
  onSelectToken: (token: Token) => void;
  title: string;
  isOpen: boolean;
}

export const SelectTokenPage: React.FC<SelectTokenPageProps> = ({
  tokens,
  onSelectToken,
  title,
  isOpen
}) => {
  const [tokenAddress, setTokenAddress] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [getTokenInfoRequest] = walletApi.useLazyGetTokenInfoQuery();

  const selectedWallet = useSelector(getSelectedWallet);
  const isSelectTokenWindowOpen: boolean = useSelector(getIsWindowOpen)(GlobalWindow.SelectToken);
  const { errorToast} = useToasts();
  const { showToast } = useToastManager({maxCount: 1});

  const validateTokenAddress = (address: string, network: Network): boolean => {
    const tonAddressRegex: RegExp = /^(EQ|UQ)[a-zA-Z0-9_-]{46}$/;
    const ethAddressRegex: RegExp = /^0x[a-fA-F0-9]{40}$/;
    const solAddressRegex: RegExp = /^([a-zA-Z0-9]{32}|[a-zA-Z0-9]{43}|[a-zA-Z0-9]{44})$/;
    const bscAddressRegex: RegExp = /^0x[a-fA-F0-9]{40}$/;

    let regex: RegExp;
    
    switch (network) {
      case Network.ETH:
        regex = ethAddressRegex;
        break;
      case Network.SOL:
        regex = solAddressRegex;
        break;
      case Network.TON:
        regex = tonAddressRegex;
        break;
      case Network.BSC:
        regex = bscAddressRegex;
        break;
      default:
        return false;
    }

    return regex.test(address);
  };

  const handleGetTokenInfo = useDebounce(async (address: string) => {
    if (!address || !selectedWallet) return;
    setIsLoading(true);

    if (!validateTokenAddress(address, selectedWallet.network)) {
      showToast(errorToast, 'Invalid token address')
      setIsLoading(false)
      return;
  }

    try {
      const result = await getTokenInfoRequest({
        network: selectedWallet.network,
        contract: address,
      }).unwrap();
      
      if (result.data) {
        const currentDate = new Date().toISOString();
        const newToken: Token = {
          id: result.data.contract,
          wallet_id: selectedWallet.id,
          symbol: result.data.symbol,
          network: selectedWallet.network,
          name: result.data.name,
          contract: address,
          balance: 0,
          balance_usd: 0,
          price: result.data.price,
          price_change_percentage: result.data.price_change_percentage || 0,
          icon: result.data.icon || '',
          added_at: currentDate,
          updated_at: currentDate,
        };
        onSelectToken(newToken);
      }
    } catch (e) {
      
    } finally {
      setIsLoading(false);
    }
  }, 350);


  const handleTokenAddressChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTokenAddress(value);
    if (value) {
      handleGetTokenInfo(value);
    }
  }, [handleGetTokenInfo]);

  useEffect(() => {
    if (!isSelectTokenWindowOpen) {
      setTokenAddress('');
    }
  }, [isSelectTokenWindowOpen]);

  useEffect(() => {
    return () => {
      setTokenAddress('');
      setIsLoading(false);
    };
  }, []);


  return (
    <Window 
      isOpen={isSelectTokenWindowOpen}
      zIndex={5005}
    >
      <WindowHeader 
        title={title} 
        isLoading={isLoading}
      />
      <Flex direction="column" gap={12} style={{ padding: '16px' }}>
        <Input
          label={`Enter ${selectedWallet?.network || ''} token contract address`}
          placeholder="0x..."
          value={tokenAddress}
          onChange={handleTokenAddressChange}
        />

        <Typography.Text 
          text="Or choose from your wallet" 
          type="secondary" 
          fontSize={14} 
          weight={450}
        />
        
        {tokens.map((token) => (
          <Button
            key={token.id}
            onClick={() => onSelectToken(token)}
            style={{
              width: '100%',
              justifyContent: 'flex-start',
              padding: '12px',
              borderRadius: '12px',
            }}
          >
            <Flex align="center" gap={12} style={{ width: '100%' }}>
              <Image src={getTokenImage(token)} alt={token.symbol} width={32} height={32} style={{ borderRadius: '50%' }} />
              <Flex direction="column" align="flex-start">
                <Typography.Text text={token.symbol} />
                <Typography.Text text={token.name} type="secondary" />
              </Flex>
              <Flex direction="column" align="flex-end" style={{ marginLeft: 'auto' }}>
                <Typography.Text text={`${token.balance.toFixed(4)} ${token.symbol}`} />
                <Typography.Text text={`$${token.balance_usd.toFixed(2)}`} type="secondary" />
              </Flex>
            </Flex>
          </Button>
        ))}
      </Flex>
    </Window>
  );
};

export default SelectTokenPage;