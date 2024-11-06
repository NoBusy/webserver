import { createAsyncThunk } from '@reduxjs/toolkit';
import { walletActions } from '../slices/walletSlice';
import { walletApi } from '../../api/walletApi';
import { StateSchema } from '@/shared/lib/providers/StoreProvider';



export const updateWalletData = createAsyncThunk<void, void, { state: StateSchema }>(
  'wallet/updateData',
  async (_, { getState, dispatch }) => {
    const state = getState();
    const selectedWallet = state.wallet.selectedWallet;

    if (selectedWallet) {
      try {
        const result = await dispatch(
          walletApi.endpoints.getWalletSilent.initiate(selectedWallet.id)
        ).unwrap();

        if (result.data) {
          dispatch(walletActions.setSelectedWallet(result.data));
        }
      } catch (error) {
    
      }
    }
  }
);