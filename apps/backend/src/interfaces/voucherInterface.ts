export interface IVoucher {
    voucher_id: string;          
    title: string;
    description: string;
    percentage_discount: number;  
    amount_discount: number;     
    expiry_date: Date;         
    terms: string;
         
    createdAt?: Date;            
    updatedAt?: Date;    
    
    created_by_admin: string; 
}
