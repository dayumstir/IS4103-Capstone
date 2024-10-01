import { IVoucherAssigned } from "./voucherAssignedInterface";

export interface IVoucher {
    voucher_id: string;          
    title: string;
    description: string;
    percentage_discount: number;  
    amount_discount: number;     
    expiry_date: Date;         
    terms: string;
    usage_limit: number,
    is_active: boolean,
         
    createdAt: Date;            
    updatedAt: Date;    
    
    created_by_admin: string; 
    vouchersAssigned: IVoucherAssigned[];
}
