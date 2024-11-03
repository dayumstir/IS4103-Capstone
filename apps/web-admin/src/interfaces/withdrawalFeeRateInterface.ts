export interface IWithdrawalFeeRate {
  withdrawal_fee_rate_id: string;
  name: string;
  wallet_balance_max: number;
  wallet_balance_min: number;
  monthly_revenue_max: number;
  percentage_withdrawal_fee: number;
  monthly_revenue_min: number;
  percentage_transaction_fee: number;

}
