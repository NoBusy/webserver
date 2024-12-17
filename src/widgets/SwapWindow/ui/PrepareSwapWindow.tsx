import React, { useState, useCallback, useEffect } from 'react';
import { UseSwapWindowLogic } from '../lib/hooks/useSwapWindowLogic';
import { WindowHeader } from '@/shared/ui/Header/WindowHeader';
import { Window } from '@/shared/ui/Window/Window';
import Image from 'next/image';
import styles from './PrepareSwapWindow.module.scss';
import swapIcon from '@/shared/assets/icons/swap-icon.svg';
import settingsIcon from '@/shared/assets/icons/settings-icon.svg';
import TokenBlock from './TokenBlock';
import TokenInfoBlock from './TokenInfoBlock';
import { getTokenImage } from '@/fsdpages/WalletPage';
import { getTgWebAppSdk } from '@/shared/lib/helpers/getTgWebAppSdk';
import shareIcon from '@/shared/assets/icons/Share.svg'
import { Network } from '@/entities/Wallet';
import { useToasts } from '@/shared/lib/hooks/useToasts/useToasts';
import { useToastManager } from '@/shared/lib/hooks/useToastManager/useToastManager';
import { CopyFillIcon } from '@/shared/assets/icons/CopyFillIcon';


interface PrepareSwapWindowProps {
  logic: UseSwapWindowLogic;
}

export const PrepareSwapWindow: React.FC<PrepareSwapWindowProps> = ({ logic }) => {
  const { flow, state } = logic;
  const [showTokenInfo, setShowTokenInfo] = useState(true);
  const [showSlippageOptions, setShowSlippageOptions] = useState(false);
  const [customSlippage, setCustomSlippage] = useState(state.slippage.toString());
  const { errorToast, successToast } = useToasts();
  const { showToast } = useToastManager({maxCount: 1});

  const generateAppLink = () => {
    if (!state.fromToken || !state.toToken) return '';

    let networkParam;
    switch (state.fromToken.network) {
      case Network.BSC:
        networkParam = 'Binance_Smart_Chain';
        break;
      case Network.TON:
        networkParam = 'The_Open_Network';
        break;
      default:
        networkParam = state.fromToken.network;
    }
  
    const params = [
      networkParam,
      state.fromToken.contract || 'native',
      state.toToken.contract
    ].join('-');
  
    return `https://t.me/Yoyoswap_bot?startapp=${params}`;
  };

  const handleCopyShareLink = async () => {
    const shareLink = generateAppLink();
    if (!shareLink) return;
  
    await navigator.clipboard.writeText(shareLink);
    showToast(successToast, 'Link to swap copied');
  };

  const handleShareLink = async () => {
    const TgWebAppSdk = await getTgWebAppSdk();
    if (!TgWebAppSdk || !state.fromToken || !state.toToken) return;
  
    const appUrl = generateAppLink();
    const messageText = `Swap ${state.fromToken.symbol} to ${state.toToken.symbol} on YoYo Swap 🔄`;
    
    TgWebAppSdk.openTelegramLink(
      `https://t.me/share?url=${encodeURIComponent(appUrl)}&text=${encodeURIComponent(messageText)}`
    );
  };
  
  useEffect(() => {
    setCustomSlippage(state.slippage.toString());
  }, [state.slippage]);

  const handleFromAmountChange = useCallback(flow.handleFromAmountChange, [flow]);

  const handleSlippageChange = (percentage: number) => {
    flow.updateSlippage(percentage);
    setShowSlippageOptions(false);
  };

  const handleCustomSlippage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCustomSlippage(value);
  };

  const handleSaveSlippage = () => {
    const value = parseFloat(customSlippage);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      flow.updateSlippage(value);
    } else {
      setCustomSlippage(state.slippage.toString());
    }
    setShowSlippageOptions(false);
  };

  const isDisabled = !state.fromToken || 
  !state.toToken || 
  !state.fromAmount || 
  state.isLoading ||
  Number(state.fromAmount) > state.fromToken.balance;



  return (
    <Window 
      isOpen={state.isSwapWindowOpen}
      btnText="Continue"
      btnOnClick={flow.handleOpenConfirmWindow}
      zIndex={5005}
      isBtnActive
      isBtnDisabled={isDisabled}
    >
      <div className={styles.swapWindowWrapper}>
        <div className={styles.headerWrapper}>
          <div className={styles.titleContainer}>
            <h2 className={styles.title}>Swap</h2>
            <div className={styles.slippageContainer}>
            <button
                className={styles.copyButton}
                onClick={handleCopyShareLink}
                disabled={!state.fromToken || !state.toToken}
              >
                 <CopyFillIcon className={styles.copyIcon} />
              </button>
            {/* <button 
                className={styles.shareButton}
                onClick={handleShareLink}
                disabled={!state.fromToken || !state.toToken}
              >
                <Image src={shareIcon} alt="Share" width={16} height={16} />
              </button> */}
              <button 
                className={styles.autoButton} 
                onClick={() => setShowSlippageOptions(!showSlippageOptions)}
              >
                Auto {state.slippage}%
                <Image src={settingsIcon} alt="Settings" width={16} height={16} />
              </button>
              {showSlippageOptions && (
                <div className={styles.slippageOptions}>
                  <div className={styles.slippageTitle}>Set slippage</div>
                  <div className={styles.slippageButtons}>
                    {[0.5, 1, 2, 3, 5].map((value) => (
                      <button 
                        key={value} 
                        onClick={() => handleSlippageChange(value)}
                        className={state.slippage === value ? styles.activeSlippage : ''}
                      >
                        {value}%
                      </button>
                    ))}
                  </div>
                  <div className={styles.customSlippage}>
                    <input
                      type="text"
                      value={customSlippage}
                      onChange={handleCustomSlippage}
                      placeholder="Custom"
                    />
                    <span>%</span>
                  </div>
                  <div className={styles.slippageActions}>
                    <button onClick={() => setShowSlippageOptions(false)} className={styles.cancelButton}>Cancel</button>
                    <button onClick={handleSaveSlippage} className={styles.saveButton}>Save</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className={styles.content}>
          <TokenBlock 
            isFrom={true}
            token={state.fromToken}
            amount={Number(Number(state.fromAmount).toFixed(9))}
            usdAmount={state.fromToken ? (Number(state.fromAmount) * (state.fromToken.price || 0)).toFixed(2) : '0.00'}
            onAmountChange={handleFromAmountChange}
            onTokenSelect={flow.handleOpenSelectFromTokenModal}
            onMaxClick={flow.handleMaxButtonClick}
            estimatedFee={state.estimatedFee}
          />
          <div className={styles.swapButtonWrapper}>
            <div className={styles.swapButton} onClick={flow.handleSwapTokens}>
              <Image src={swapIcon} alt='' width={24} height={24} />
            </div>
          </div>
          <TokenBlock 
            isFrom={false}
            token={state.toToken}
            amount={Number(state.toAmount)}
            usdAmount={state.toToken ? (Number(state.toAmount) * (state.toToken.price || 0)).toFixed(2) : '0.00'}
            onTokenSelect={flow.handleOpenSelectToTokenModal}
            showTokenInfoButton={!!state.toToken}
            onShowTokenInfo={() => setShowTokenInfo(!showTokenInfo)}
            showTokenInfo={showTokenInfo}
          />
          {showTokenInfo && state.toToken && state.tokenExtendedInfo && (
            <TokenInfoBlock 
              token={state.toToken}
              tokenExtendedInfo={state.tokenExtendedInfo}
              tokenImage={getTokenImage(state.toToken)}
              //historicalData={state.historicalData}
            />
          )}
          {state.rate > 0 && state.fromToken && state.toToken && (
            <div className={styles.rate}>
              Best price: 1 {state.fromToken.symbol} ≈ {state.rate.toFixed(6)} {state.toToken.symbol}
            </div>
          )}
        </div>
      </div>
    </Window>
  );
};