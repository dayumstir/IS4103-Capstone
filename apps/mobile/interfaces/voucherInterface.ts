export interface IVoucher {
  voucher_id: string;
  title: string;
  description: string;
  percentage_discount: number;
  amount_discount: number;
  expiry_date: Date;
  terms: string;
  usage_limit: number;
  is_active: boolean;

  createdAt: Date;
  updatedAt: Date;

  created_by_admin: string;
}

export interface IVoucherAssigned {
  voucher_assigned_id: string;
  status: VoucherStatus;
  date_time_issued: Date;
  remaining_uses: number;

  voucher_id: string;
  voucher: IVoucher;

  customer_id: string;

  used_installment_payment_id: string;
}

export enum VoucherStatus {
  AVAILABLE = "AVAILABLE",
  EXPIRED = "EXPIRED",
  USED = "USED",
  UNAVAILABLE = "UNAVAILABLE",
}
