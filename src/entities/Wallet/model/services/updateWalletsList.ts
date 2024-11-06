import { createAsyncThunk } from '@reduxjs/toolkit';
import { walletActions } from '../slices/walletSlice';
import { walletApi } from '../../api/walletApi';
import { StateSchema } from '@/shared/lib/providers/StoreProvider';

export const updateWalletsList = createAsyncThunk<void, void, { state: StateSchema }>(
  'wallet/updateWalletsList',
  async (_, { dispatch }) => {
    try {
      const result = await dispatch(
        walletApi.endpoints.getWallets.initiate(undefined, {
          forceRefetch: true,
          subscribe: false
        })
      ).unwrap();

      if (result?.data) {
        dispatch(walletActions.setWallets(result.data));
      }
    } catch (error) {
   
    }
  }
);