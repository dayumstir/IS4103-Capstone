// packages/interfaces/voucherInterface.ts
import { ICustomer } from "./customerInterface";
import { IInstalmentPayment } from "./instalmentPaymentInterface";

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
  vouchersAssigned: IVoucherAssigned[];
}

export interface IVoucherAssigned {
  voucher_assigned_id: string;
  status: VoucherAssignedStatus;
  remaining_uses: number;
  date_time_issued: Date;

  voucher: IVoucher;
  voucher_id: string;
  customer: ICustomer;
  customer_id: string;
  instalment_payment?: IInstalmentPayment;
  instalment_payment_id?: string;
}

export enum VoucherAssignedStatus {
  AVAILABLE = "AVAILABLE",
  EXPIRED = "EXPIRED",
  USED = "USED",
  UNAVAILABLE = "UNAVAILABLE",
}
