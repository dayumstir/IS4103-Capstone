import { BarcodeScanningResult, CameraView } from "expo-camera";

export default function ScanQrCodeScreen({
  onBarcodeScanned,
}: {
  onBarcodeScanned: (scanningResult: BarcodeScanningResult) => void;
}) {
  return (
    <CameraView
      // tailwind not supported
      style={{ flex: 1 }}
      barcodeScannerSettings={{
        barcodeTypes: ["qr"],
      }}
      onBarcodeScanned={onBarcodeScanned}
    />
  );
}
