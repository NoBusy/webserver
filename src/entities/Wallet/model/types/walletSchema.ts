export enum Network {
  ETH = 'Ethereum',
  SOL = 'Solana',
  BSC = 'Binance Smart Chain',
  TON = 'The Open Network',
}

export enum WalletType {
  IMPORTED = 'IMPORTED',
  GENERATED = 'GENERATED',
}

export enum TransactionType {
  SWAP = 'SWAP',
  DEPOSIT = 'DEPOSIT',
  TRANSFER = 'TRANSFER',
}

export enum TransactionStatus {
  FAILED = 'FAILED',
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
}

export interface Wallet {
  id: string;
  user_id: string;
  type: WalletType;
  network: Network;
  name: string;
  address: string;
  is_generated: boolean;
  is_imported: boolean;
  balance: number;
  balance_usd: number;
  updated_at: string;
  created_at: string;
  can_deleted: boolean;
  private_key: string;
  tokens: Token[];
}

export interface Token {
  id: string;
  wallet_id: string;
  symbol: string;
  network: Network;
  name: string;
  contract: string;
  balance: number;
  balance_usd: number;
  price: number;
  price_change_percentage: number;
  icon: string;
  added_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  wallet_id: string;
  type: TransactionType;
  network: Network;
  hash: string;
  status: TransactionStatus;
  amount: number;
  amount_usd: number;
  to: string;
  from: string;
  currency: string;
  fromCurrency?: string;
  toCurrency?: string;
  toAmount?: number;
  toAmount_usd?: number;
  fee: number;
  fee_usd: number;
  updated_at: string;
  created_at: string;
}
