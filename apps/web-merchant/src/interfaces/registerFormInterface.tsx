import { FormInstance } from "antd";

export interface EmailNameProps {
  form: FormInstance;
  email: string;
  name: string;
  setName: (name: string) => void;
  setEmail: (email: string) => void;
  setPageIdx: (num: number) => void;
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
  profilePicture: File | undefined;
  profilePictureDisplay: any; //TODO
  password: string;
  address: string;
  contactNumber: string;
  setProfilePicture: (anything: any) => void; //TODO
  setProfilePictureDisplay: (anything: any) => void; //TODO
  setContactNumber: (contact: string) => void;
  setAddress: (address: string) => void;
  setPageIdx: (num: number) => void;
}
