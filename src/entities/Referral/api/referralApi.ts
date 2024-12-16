import { ApiResponse } from '@/shared/lib/types/apiResponse';
import { Referral, WithdrawalRequest } from '../model/types/referralSchema';
import { api } from '@/shared/api/api';

export const referralApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getReferralProgram: builder.query<ApiResponse<Referral>, void>({
      query: () => ({
        url: '/referral/user',
      }),
    }),
    createWithdrawalRequest: builder.mutation<ApiResponse<WithdrawalRequest>, void>({
      query: () => ({
        url: '/referral/withdraw',
        method: 'POST'
      }),
    }),
  }),
});
