import { COOKIES_KEY_SELECTED_NETWORK, COOKIES_KEY_SELECTED_WALLET } from '@/shared/consts/cookies';
import { WalletSliceSchema } from '../types/walletSliceSchema';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Network, SwapParams, Token, TransferParams, Wallet } from '@/entities/Wallet';
import cookie from 'js-cookie';

const COOKIE_OPTIONS = {
  path: '/',
  expires: 365,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const
};

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
      try {
        cookie.remove(COOKIES_KEY_SELECTED_WALLET); // Сначала удаляем старую куку
        cookie.set(COOKIES_KEY_SELECTED_WALLET, action.payload.id, COOKIE_OPTIONS);
      } catch (error) {
        console.error('Error setting wallet cookie:', error);
      }
    },
    setSelectedNetwork(state, action: PayloadAction<Network>) {
      state.selectedNetwork = action.payload;
      try {
        cookie.remove(COOKIES_KEY_SELECTED_NETWORK); // Сначала удаляем старую куку
        cookie.set(COOKIES_KEY_SELECTED_NETWORK, action.payload, COOKIE_OPTIONS);
      } catch (error) {
        console.error('Error setting network cookie:', error);
      }
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