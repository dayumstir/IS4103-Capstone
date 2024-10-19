export interface EditProfileProps {
  refetch: () => void;
  merchantId: string;
  initName: string;
  initContactNumber: string;
  initAddress: string;
  initProfileDisplay: string;
  initCashback: number;
  isModalOpen: boolean;
  setModalOpen: (isOpen: boolean) => void;
}
