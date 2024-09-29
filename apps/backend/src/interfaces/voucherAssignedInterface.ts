import { VoucherStatus } from "./voucherStatusInterface";

export interface IVoucherAssigned {
    voucher_assigned_id: string;  
    status: VoucherStatus; 
    date_time_issued: Date;  

    voucher_id: string;            
    customer_id: string;   

    used_installment_payment_id: string;
}
