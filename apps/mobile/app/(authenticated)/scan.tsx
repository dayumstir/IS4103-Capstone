import { useEffect, useState } from "react";
import { Text, View, TouchableOpacity, Alert } from "react-native";
import { useCameraPermissions } from "expo-camera";
import { useDispatch, useSelector } from "react-redux";
import { setPaymentStage } from "../../redux/features/paymentStageSlice";
import { RootState } from "../../redux/store";
import { router } from "expo-router";
import { useCreateTransactionMutation } from "../../redux/services/transactionService";
import {
  ITransaction,
  TransactionResult,
  TransactionStatus,
} from "@repo/interfaces";
import ScanQrCodeScreen from "../../components/scan/scanQrCodeScreen";
import VerifyPurchaseScreen from "../../components/scan/verifyPurchaseScreen";
import TransactionCompleteScreen from "../../components/scan/transactionCompleteScreen";
import { useGetMerchantByIdQuery } from "../../redux/services/merchantService";
import {
  useGetCustomerCreditTierQuery,
  useGetInstalmentPlansQuery,
} from "../../redux/services/customerService";
import SelectInstalmentPlanScreen from "../../components/scan/selectInstalmentPlanScreen";
import { useCreateNotificationMutation } from "../../redux/services/notificationService";
import { useGetCustomerOutstandingInstalmentPaymentsQuery } from "../../redux/services/instalmentPaymentService";
import Toast from "react-native-toast-message";

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
  const [createNotification] = useCreateNotificationMutation();
  const [transaction, setTransaction] = useState<TransactionResult | null>(
    null,
  );

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
  const [error, setError] = useState<string | null>(null);

  const { data: outstandingInstalmentPayments } =
    useGetCustomerOutstandingInstalmentPaymentsQuery();
  const totalCreditUsed =
    outstandingInstalmentPayments?.reduce(
      (acc, curr) => acc + curr.amount_due,
      0,
    ) ?? 0;

  const { data: creditTier } = useGetCustomerCreditTierQuery();

  useEffect(() => {
    if (merchant) {
      setPurchase((prev) => ({ ...prev, merchantName: merchant.name }));
    }
  }, [merchant]);

  // Merchant ID invalid
  useEffect(() => {
    if (merchantError) {
      console.error(merchantError);
      setError("Invalid QR code");
      dispatch(setPaymentStage("Error"));
      setScannedMerchantId(null); // Reset scanned merchant ID
    }
  }, [merchantError, dispatch]);

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

      if (!rawMerchantId || !rawPrice || !rawReferenceNo) {
        setError("Invalid QR code");
        dispatch(setPaymentStage("Error"));
        return;
      }

      // Sanitize merchant ID, price and reference number
      const merchantId = rawMerchantId.trim();
      const price = parseFloat(rawPrice.trim());
      const referenceNo = rawReferenceNo.trim();

      if (merchantId === "" || isNaN(price) || price <= 0) {
        setError("Invalid QR code");
        dispatch(setPaymentStage("Error"));
        return;
      }

      // Check if customer has enough credit
      if (totalCreditUsed + price > (creditTier?.credit_limit ?? 0)) {
        Toast.show({
          type: "error",
          text1: "Insufficient credit",
          text2:
            "You do not have enough credit to make this purchase.\n\nPlease pay your outstanding payments to increase your available credit.",
        });
        // Alert.alert(
        //   "Insufficient credit",
        //   "\nYou do not have enough credit to make this purchase.\n\nPlease pay your outstanding payments to increase your available credit.",
        // );
        return;
      }

      setScannedMerchantId(merchantId);
      setPurchase((prev) => ({ ...prev, price, referenceNo }));
      dispatch(setPaymentStage("Verify Purchase"));
    }
  };

  const handleCreateTransactionAndInstalmentPayments = async () => {
    if (!customer) {
      setError("Invalid customer");
      dispatch(setPaymentStage("Error"));
      return;
    }

    if (!scannedMerchantId) {
      setError("Invalid merchant");
      dispatch(setPaymentStage("Error"));
      return;
    }

    if (!selectedPlanId) {
      setError("Invalid instalment plan");
      dispatch(setPaymentStage("Error"));
      return;
    }

    const newTransaction: Omit<ITransaction, "transaction_id"> = {
      amount: purchase.price,
      date_of_transaction: new Date(),
      status: TransactionStatus.IN_PROGRESS,
      reference_no: purchase.referenceNo,
      cashback_percentage: merchant?.cashback ?? 0,

      customer_id: customer.customer_id,
      merchant_id: scannedMerchantId,
      instalment_plan_id: selectedPlanId,
      merchant_payment_id: "",
    };

    try {
      const transaction = await createTransaction(newTransaction).unwrap();
      setTransaction(transaction);
      dispatch(setPaymentStage("Transaction Complete"));
    } catch (err) {
      console.error(err);
      setError("Error creating transaction");
      dispatch(setPaymentStage("Error"));
    }
  };

  const handleCancel = () => {
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
      case "Transaction Complete":
        return (
          transaction && (
            <TransactionCompleteScreen
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
              {"\n"}
              {"\n"}
              Error: {error}
            </Text>
          </View>
        );
    }
  };

  return <View className="flex-1">{displayScreen()}</View>;
}
