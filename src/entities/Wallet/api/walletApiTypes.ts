import { Network } from '@/entities/Wallet';

export interface DeleteWalletParams {
  id: string;
}

export interface CreateWalletParams {
  network: Network;
  name: string;
}

export interface ImportWalletParams {
  network: Network;
  name: string;
  mnemonic: string;
}

export interface GetTokenInfoParams {
  network: Network;
  contract: string;
}

export interface GetTokenInfoResult {
  symbol: string;
  network: Network;
  name: string;
  contract: string;
  price: number;
  price_change_percentage: number;
  icon: string;
}

export interface GetTokenExtendedInfoResult {
  id: number;
  name: string;
  symbol: string;
  total_supply: number | null;
  max_supply: number | null;
  market_cap: number;
  price: number;
  percent_change_24h: number;
  percent_change_7d: number;
  percent_change_30d: number;
  volume_24h: number;
}

export interface GetTokenPriceParams {
  network: Network;
  symbol?: string;
  contract?: string;
}

export interface GetTokenPriceResult {
  price: number;
  price_change_percentage: number;
}

export interface AddWalletTokenParams {
  wallet_id: string;
  wallet_address: string;
  network: Network;
  contract: string;
}

export interface DeleteWalletTokenParams {
  wallet_id: string;  
  token_id: string;   
}

export interface TransferParams {
  amount: number;
  currency: string;
  token_id: string;
  wallet_id: string;
  to_address: string;
}

export interface GetWalletTransactionsParams {
  id: string;
}

export interface SwapParams {
  wallet_id: string;
  from_token_id: string;
  to_token_id: string;
  amount: number;
  slippageBps?: number;
}

export interface GetHistoricalQuotesParams {
  id:string;
  address?: string;
  symbol?: string;  
  timeStart?: string;
  timeEnd?: string;
  count?: number;
  interval?: string;
  convert?: string;
}

export interface GetHistoricalQuotesResult {
  id: string;
  name: string;
  quotes: {
    timestamp: string;
    price: number;
  }[];
}


export interface GetTokenTransactionsParams {
  wallet_id: string;
  token_symbol: string;
}

export interface GetPairParams {
  contract_address: string;
 network: string;
 }
 export interface GetPairResult {
 liquidity: number;
 }