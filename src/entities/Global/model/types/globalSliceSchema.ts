export enum GlobalWindow {
  Deposit = 'Deposit',
  Swap = 'Swap',
  Transfer = 'Transfer',
  Referral = 'Referral',
  AddWallet = 'AddWallet',
  Networks = 'Networks',
  WalletsList = 'WalletsList',
  AddToken = 'AddToken',
  TransactionsHistory = 'TransactionsHistory',
  WalletDetails = 'WalletDetails',
  TransactionDetails = 'TransactionDetails',
  ImportWallet = 'ImportWallet',
  CreateWallet = 'CreateWallet',
  PrepareTransfer = 'PrepareTransfer',
  ConfirmTransfer = 'ConfirmTransfer',
  ConfirmSwap = 'ConfirmSwap',
  SelectFromToken = 'SelectFromToken',
  SelectToToken = 'SelectToToken',
  TokenDetails = 'TokenDetails',
  TokenInfo = 'TokenInfo',
  SelectToken = 'SelectToken',
  StoryViewer= 'StoryViewer'
}

export interface GlobalWindowType<T> {
  window: T;
  payload?: Record<string, any>;
}

export interface GlobalSliceSchema {
  isLoading: boolean;
  windowsOpen: GlobalWindowType<GlobalWindow>[];
}
