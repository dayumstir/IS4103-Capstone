// Defines the structure of a admin object
export interface IAdmin {
    admin_id: number;
    name: string;
    profile_picture: string;
    email: string;
    username: string;
    password: string;
    contact_number: string;
    address: string;
    date_of_birth: Date;
    admin_type:String;
}
