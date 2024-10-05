// src/interfaces/voucherAssignedInterface.ts
import { VoucherAssignedStatus } from "./voucherAssignedStatusInterface";

export interface IVoucherAssigned {
    voucher_assigned_id: string;  
    status: VoucherAssignedStatus; 
    date_time_issued: Date;  
    remaining_uses: number;

    voucher_id: string;            
    customer_id: string;   

    used_installment_payment_id?: string;
}
