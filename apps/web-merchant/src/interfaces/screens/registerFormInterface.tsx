import { FormInstance } from "antd";

export type RegisterFormValues = {
  name: string;
  email: string;
  profile_picture?: File;
  password: string;
  contact_number: string;
  address: string;
};

export interface EmailNameProps {
  form: FormInstance;
  email: string;
  name: string;
  pendingEmailConfirmationModalOpen: boolean;
  setName: (name: string) => void;
  setEmail: (email: string) => void;
  setPageIdx: (num: number) => void;
  setPendingEmailConfirmationModalOpen: (isModalOpen: boolean) => void;
}

export interface PasswordProps {
  form: FormInstance;
  password: string;
  setPassword: (password: string) => void;
  setPageIdx: (num: number) => void;
}

export interface DetailsProps {
  form: FormInstance;
  name: string;
  email: string;
  password: string;
  otpVerified: boolean;
  address: string;
  contactNumber: string;
  setContactNumber: (contact: string) => void;
  setOtpVerified: (isVerified: boolean) => void;
  setAddress: (address: string) => void;
  setPageIdx: (num: number) => void;
}
