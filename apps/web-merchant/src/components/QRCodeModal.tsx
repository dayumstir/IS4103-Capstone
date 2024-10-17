import { Modal } from "antd";
import { QRCodeSVG } from "qrcode.react";

interface QrCodeModalProps {
  isModalOpen: boolean;
  setIsModalClose: (isClosed: boolean) => void;
  value: string;
}

const QrCodeModal = ({
  isModalOpen,
  setIsModalClose,
  value,
}: QrCodeModalProps) => {
  return (
    <Modal
      open={isModalOpen}
      footer={null}
      onCancel={() => setIsModalClose(false)}
    >
      <div className="flex h-full w-full items-center justify-center">
        <QRCodeSVG value={value} className="h-full w-full p-6" />
      </div>
    </Modal>
  );
};

export default QrCodeModal;
