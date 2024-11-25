import { COOKIES_KEY_SELECTED_NETWORK, COOKIES_KEY_SELECTED_WALLET } from '@/shared/consts/cookies';
import { WalletSliceSchema } from '../types/walletSliceSchema';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Network, SwapParams, Token, TransferParams, Wallet } from '@/entities/Wallet';
import cookie from 'js-cookie';
import { appStorage, useAppStorage } from '@/shared/lib/hooks/useCloudStorage/useAppStorage';
import { STORAGE_KEYS } from '@/shared/consts/storage';

const initialState: WalletSliceSchema = {
  wallets: [],
  isLoading: false,
  selectedWallet: undefined,
  selectedNetwork: undefined,
  selectedToken: undefined,
};

export const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    setWallets(state, action: PayloadAction<Wallet[]>) {
      state.wallets = action.payload;
    },
    setIsLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setSelectedWallet(state, action: PayloadAction<Wallet>) {
      state.selectedWallet = action.payload;
      appStorage.set(STORAGE_KEYS.SELECTED_WALLET, action.payload.id);
    },
    
    setSelectedNetwork(state, action: PayloadAction<Network>) {
      state.selectedNetwork = action.payload;
      appStorage.set(STORAGE_KEYS.SELECTED_NETWORK, action.payload);
    },
    setSelectedToken(state, action: PayloadAction<Token>) {
      state.selectedToken = action.payload;
    },
    clearSelectedToken(state) {
      state.selectedToken = undefined;
    },
    removeWalletToken(state, action: PayloadAction<string>) {
      if (state.selectedWallet) {
        state.selectedWallet.tokens = state.selectedWallet.tokens.filter(token => token.id !== action.payload);
      }
    },
  },
});

export const { actions: walletActions } = walletSlice;
export const { reducer: walletReducer } = walletSlice;
