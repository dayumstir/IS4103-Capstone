import { useEffect, useState } from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { useCameraPermissions } from "expo-camera";
import { useDispatch, useSelector } from "react-redux";
import { setPaymentStage } from "../../redux/features/paymentStageSlice";
import { RootState } from "../../redux/store";
import { router } from "expo-router";
import { useCreateTransactionMutation } from "../../redux/services/transactionService";
import { ITransaction, TransactionStatus } from "@repo/interfaces";
import ScanQrCodeScreen from "../../components/scan/scanQrCodeScreen";
import VerifyPurchaseScreen from "../../components/scan/verifyPurchaseScreen";
import PaymentCompleteScreen from "../../components/scan/paymentCompleteScreen";
import { useGetMerchantByIdQuery } from "../../redux/services/merchantService";
import { useGetInstalmentPlansQuery } from "../../redux/services/customerService";
import SelectInstalmentPlanScreen from "../../components/scan/selectInstalmentPlanScreen";

export default function ScanScreen() {
  const [status, requestPermission] = useCameraPermissions();
  const [scannedMerchantId, setScannedMerchantId] = useState<string | null>(
    null,
  );
  const [purchase, setPurchase] = useState({
    merchantName: "",
    price: 0,
    referenceNo: "",
  });
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const paymentStage = useSelector(
    (state: RootState) => state.paymentStage.paymentStage,
  );
  const customer = useSelector((state: RootState) => state.customer.profile);
  const dispatch = useDispatch();
  const [createTransaction] = useCreateTransactionMutation();
  const [transaction, setTransaction] = useState<ITransaction | null>(null);

  const {
    data: merchant,
    isLoading: isMerchantLoading,
    error: merchantError,
  } = useGetMerchantByIdQuery(scannedMerchantId ?? "", {
    skip: !scannedMerchantId,
  });

  const {
    data: instalmentPlans,
    isLoading: isInstalmentPlansLoading,
    error: instalmentPlansError,
  } = useGetInstalmentPlansQuery();

  useEffect(() => {
    if (merchant) {
      setPurchase((prev) => ({ ...prev, merchantName: merchant.name }));
    }
  }, [merchant]);

  if (!status) {
    // Camera permissions are still loading
    return <View />;
  }

  if (!status.granted) {
    // Camera permissions not granted yet
    return (
      <View className="flex-1 justify-center">
        <Text className="text-center">
          We need your permission to show the camera
        </Text>
        <TouchableOpacity
          onPress={requestPermission}
          className="mx-auto mt-4 w-40 rounded-md bg-blue-500 p-2"
        >
          <Text className="text-center text-white">Grant permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Merchant ID invalid
  if (merchantError) {
    console.error(merchantError);
    dispatch(setPaymentStage("Error"));
  }

  const handleQrCodeScanned = ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    if (data.includes(":")) {
      // QR Code data is in the format "MerchantId:Price:ReferenceNo"
      const [rawMerchantId, rawPrice, rawReferenceNo] = data.split(":");

      // Sanitize the merchant ID, price and reference number
      const merchantId = rawMerchantId.trim();
      const price = parseFloat(rawPrice.trim());
      const referenceNo = rawReferenceNo.trim();

      if (merchantId === "" || isNaN(price) || price <= 0) {
        dispatch(setPaymentStage("Error"));
        return;
      }

      setScannedMerchantId(merchantId);
      setPurchase((prev) => ({ ...prev, price, referenceNo }));
      dispatch(setPaymentStage("Verify Purchase"));
    }
  };

  const handleCreateTransactionAndInstalmentPayments = async () => {
    if (!customer || !scannedMerchantId || !selectedPlanId) {
      dispatch(setPaymentStage("Error"));
      return;
    }

    const newTransaction: Omit<
      ITransaction,
      | "transaction_id"
      | "customer"
      | "merchant"
      | "instalment_plan"
      | "instalment_payments" // created in transactionRepository.ts
    > = {
      amount: purchase.price,
      date_of_transaction: new Date(),
      status: TransactionStatus.IN_PROGRESS,
      fully_paid_date: null,
      reference_no: purchase.referenceNo,
      cash_back_percentage: 0,

      customer_id: customer.customer_id,
      merchant_id: scannedMerchantId,
      instalment_plan_id: selectedPlanId,
    };

    try {
      const transaction = await createTransaction(newTransaction).unwrap();
      setTransaction(transaction);
      dispatch(setPaymentStage("Payment Complete"));
    } catch (err) {
      console.error(err);
      dispatch(setPaymentStage("Error"));
    }
  };

  const handleCancel = () => {
    setScannedMerchantId(null);
    dispatch(setPaymentStage("Scan QR Code"));
  };

  // Display the appropriate screen based on the payment stage
  const displayScreen = () => {
    switch (paymentStage) {
      case "Scan QR Code":
        return <ScanQrCodeScreen onBarcodeScanned={handleQrCodeScanned} />;
      case "Verify Purchase":
        return (
          merchant && (
            <VerifyPurchaseScreen
              merchantName={purchase.merchantName}
              price={purchase.price}
              isLoading={isMerchantLoading}
              onCancel={handleCancel}
              onNext={() => {
                dispatch(setPaymentStage("Select Instalment Plan"));
              }}
            />
          )
        );
      case "Select Instalment Plan":
        return (
          instalmentPlans && (
            <SelectInstalmentPlanScreen
              instalmentPlans={instalmentPlans}
              price={purchase.price}
              selectedPlanId={selectedPlanId}
              setSelectedPlanId={setSelectedPlanId}
              onCancel={handleCancel}
              onConfirm={handleCreateTransactionAndInstalmentPayments}
            />
          )
        );
      case "Payment Complete":
        return (
          transaction && (
            <PaymentCompleteScreen
              transaction={transaction}
              merchantName={purchase.merchantName}
              onViewPaymentHistory={() => {
                router.back();
                router.push("/payments");
                dispatch(setPaymentStage("Scan QR Code"));
              }}
              onBackToHome={() => {
                router.back();
                router.push("/home");
                dispatch(setPaymentStage("Scan QR Code"));
              }}
            />
          )
        );
      default:
        return (
          <View className="flex-1 items-center justify-center p-16">
            <Text className="text-center text-xl font-semibold text-red-500">
              There has been an error. Please close this window and try again.
            </Text>
          </View>
        );
    }
  };

  return <View className="flex-1">{displayScreen()}</View>;
}
