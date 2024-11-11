export interface IWithdrawalFeeRate {
  withdrawal_fee_rate_id: string;
  name: string;
  wallet_balance_max: number;
  wallet_balance_min: number;
  percentage_withdrawal_fee: number;
  percentage_transaction_fee: number;
  merchant_size_id: number;
}
