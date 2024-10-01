export interface EditProfileProps {
  refetch: () => void;
  merchantId: string;
  initName: string;
  initContactNumber: string;
  initAddress: string;
  initProfileDisplay: string;
  isModalOpen: boolean;
  setModalOpen: (isOpen: boolean) => void;
}
