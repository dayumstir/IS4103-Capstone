enum MerchantStatus {
    PENDING_EMAIL_VERIFICATION = "PENDING_EMAIL_VERIFICATION",
    ACTIVE = "ACTIVE",
    SUSPENDED = "SUSPENDED",
}


export interface IMerchant {
    name: string;
    email: string;
    password: string;
    contact_number: string;
    address: string;
    profile_picture?: Buffer;
    status: MerchantStatus;
    qr_code: string;
}
