// packages/interfaces/adminInterface.ts
export enum AdminType {
    SUPER = "SUPER",
    NORMAL = "NORMAL",
    DEACTIVATED = "DEACTIVATED",
    UNVERIFIED = "UNVERIFIED",
}

export interface IAdmin {
    admin_id: string;
    name: string;
    profile_picture?: Buffer;
    email: string;
    username: string;
    password: string;
    contact_number: string;
    address: string;
    date_of_birth: Date;
    admin_type: AdminType;
    forgot_password: boolean;
}
