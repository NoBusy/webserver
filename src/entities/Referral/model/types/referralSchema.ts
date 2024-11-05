export interface Referral {
  id: string;
  user_id: string;
  telegram_id: string;
  link: string;
  invited_count: number;
  balance: number;
  invited_by: string; // Telegram ID
  total_earned: number;
  total_swap_volume_usd: number;
  monthly_swap_volume_usd: number;
  ast_volume_update: Date;
  created_at: string;
  updated_at: string;
}
