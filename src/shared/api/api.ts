import { BaseQueryFn, createApi, FetchArgs, fetchBaseQuery, FetchBaseQueryError } from '@reduxjs/toolkit/query/react';

const getCsrfToken = () => {
  return document.cookie.split('; ').find(row => row.startsWith('_auth.client.csrf_token='))?.split('=')[1] || '';
};

interface TelegramWebApps {
  WebApp: {
    initData: string;
    initDataUnsafe: {
      user?: {
        id: number;
        first_name?: string;
        last_name?: string;
        username?: string;
        language_code?: string;
      };
    };
  };
}

declare global {
  interface Window {
    Telegram?: TelegramWebApps;
  }
}

const getTelegramInitData = (): string | null => {
  return typeof window !== 'undefined' ? window.Telegram?.WebApp?.initData || null : null;
};

const getTelegramUserId = (): number | null => {
  return typeof window !== 'undefined' ? window.Telegram?.WebApp?.initDataUnsafe?.user?.id || null : null;
};

const getTelegramUsername = (): string | null => {
  return typeof window !== 'undefined' ? window.Telegram?.WebApp?.initDataUnsafe?.user?.username || null : null;
};

const getTelegramLanguageCode = (): string | null => {
  return typeof window !== 'undefined' ? window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code || null : null;
};

const prepareHeaders = (headers: Headers): Headers => {
  headers.set('Content-Type', 'application/json');
  const telegramInitData = getTelegramInitData();
  if (telegramInitData) {
    headers.set('X-Telegram-Init-Data', telegramInitData);
    headers.set('Authorization', `tma ${telegramInitData}`);
  }
  const telegramId = getTelegramUserId();
  if (telegramId) {
    headers.set('X-Telegram-ID', telegramId.toString());
  }
  return headers;
};

const baseQuery = fetchBaseQuery({
  baseUrl: process.env.NEXT_PUBLIC_BASE_API_URL || "https://cryptoswaptg.ru/v1",
  credentials: 'include',
  prepareHeaders,
});

const baseQueryWithInterceptors: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && (result.error.status === 401 || result.error.status === 403)) {
    const telegramId = getTelegramUserId();
    const username = getTelegramUsername();
    const languageCode = getTelegramLanguageCode();
    
    if (telegramId) {
      const refreshResult = await baseQuery({ 
        url: `/users/profile?telegram_id=${telegramId}&username=${username}&language_code=${languageCode}`, 
        method: 'GET'
      }, api, extraOptions);

      if (refreshResult.data) {
        result = await baseQuery(args, api, extraOptions);
      } else {
     
      }
    }
  }

  return result;
};

export const api = createApi({
  baseQuery: baseQueryWithInterceptors,
  reducerPath: 'api',
  tagTypes: ['User', 'Workspace', 'Ticker', 'Chart', 'Quote', 'Stock', 'Event'],
  refetchOnMountOrArgChange: true,
  endpoints: (builder) => ({}),
});