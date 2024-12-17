import React, { useEffect } from 'react';
import { UseSwapWindowLogic, useSwapWindowLogic } from '../lib/hooks/useSwapWindowLogic';
import { WindowHeader } from '@/shared/ui/Header/WindowHeader';
import { Window } from '@/shared/ui/Window/Window';
import { PrepareSwapWindow } from './PrepareSwapWindow';
import { ConfirmSwapWindow } from './ConfirmSwapWindow';
import { SelectTokenPage } from './SelectTokenModal';
import { useSelector } from 'react-redux';
import { GlobalWindow, getWindowsOpen } from '@/entities/Global';

export const SwapWindow: React.FC = () => {
  const logic: UseSwapWindowLogic = useSwapWindowLogic();
  const { state, flow } = logic;
  const openedWindows = useSelector(getWindowsOpen);

  useEffect(() => {
    const swapWindow = openedWindows.find(w => w.window === GlobalWindow.Swap);
    if (!swapWindow) return;
    
    if (swapWindow.options?.params) {
      const { fromToken, toToken, network } = swapWindow.options.params;
      flow.setInitialTokens({ fromToken, toToken, network });
    } else if (state.selectedWallet) {
      
      if (!state.fromToken && !state.toToken) {
        const nativeToken = state.selectedWallet.tokens.find(t => t.contract === null);
        if (nativeToken) {
          flow.handleSelectFromToken(nativeToken);
        }
      }
    }
  }, [openedWindows]);

  return (
    <>
      <Window isOpen={state.isSwapWindowOpen}>
        <WindowHeader title="Swap" />
        <PrepareSwapWindow logic={logic} />
      </Window>
      <SelectTokenPage
        tokens={state.currentView === 'selectFromToken' ? state.fromTokens : state.toTokens}
        onSelectToken={state.currentView === 'selectFromToken'
          ? flow.handleSelectFromToken
          : flow.handleSelectToToken
        }
        title={state.currentView === 'selectFromToken'
          ? "Select token to swap from"
          : "Select token to swap to"
        }
        isOpen={state.currentView === 'selectFromToken' || state.currentView === 'selectToToken'}
        onClose={flow.handleBackToSwap}
      />
      {state.isConfirmSwapWindowOpen && 
        <ConfirmSwapWindow logic={logic} onClose={flow.handleClearState} />}
    </>
  );
};