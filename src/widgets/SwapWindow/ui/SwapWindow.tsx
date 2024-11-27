import React from 'react';
import { UseSwapWindowLogic, useSwapWindowLogic } from '../lib/hooks/useSwapWindowLogic';
import { WindowHeader } from '@/shared/ui/Header/WindowHeader';
import { Window } from '@/shared/ui/Window/Window';
import { PrepareSwapWindow } from './PrepareSwapWindow';
import { ConfirmSwapWindow } from './ConfirmSwapWindow';
import { SelectTokenPage } from './SelectTokenModal';

export const SwapWindow: React.FC = () => {
  const logic: UseSwapWindowLogic = useSwapWindowLogic();
  const { state, flow } = logic;

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

      {state.isConfirmSwapWindowOpen && <ConfirmSwapWindow logic={logic} onClose={flow.handleClearState} />}
    </>
  );
};