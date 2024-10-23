enum VoucherStatus {
    AVAILABLE = "AVAILABLE",
    EXPIRED = "EXPIRED",
    USED = "USED",
    UNAVAILABLE = "UNAVAILABLE"
}

export interface IVoucherAssigned {
    voucher_assigned_id: string;  
    status: VoucherStatus; 
    date_time_issued: Date;  
    remaining_uses: number;

    voucher_id: string;            
    customer_id: string;   

    installment_payment_id?: string;
}
