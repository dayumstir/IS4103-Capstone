export interface ResetPasswordProps {
  merchantId: string;
  isModalOpen: boolean;
  setModalOpen: (isOpen: boolean) => void;
}

export interface ResetPasswordValues {
  newPassword: string;
  oldPassword: string;
}
