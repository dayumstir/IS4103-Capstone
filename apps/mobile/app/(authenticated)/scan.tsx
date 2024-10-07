import { useEffect, useState } from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { useCameraPermissions } from "expo-camera";
import { useDispatch, useSelector } from "react-redux";
import { setPaymentStage } from "../../redux/features/paymentStageSlice";
import { RootState } from "../../redux/store";
import { formatCurrency } from "../../utils/formatCurrency";
import { router } from "expo-router";
import { useCreateTransactionMutation } from "../../redux/services/transactionService";
import { ITransaction } from "../../interfaces/transactionInterface";
import ScanQrCodeScreen from "../../components/scan/scanQrCodeScreen";
import VerifyPurchaseScreen from "../../components/scan/verifyPurchaseScreen";
import SelectPaymentPlanScreen from "../../components/scan/selectPaymentPlanScreen";
import PaymentCompleteScreen from "../../components/scan/paymentCompleteScreen";
import { useGetMerchantByIdQuery } from "../../redux/services/merchantService";

export default function ScanScreen() {
  const [status, requestPermission] = useCameraPermissions();
  const [scannedMerchantId, setScannedMerchantId] = useState<string | null>(
    null,
  );
  const [purchase, setPurchase] = useState({
    merchantName: "",
    price: 0,
  });
  const [selectedPlan, setSelectedPlan] = useState("Pay in Full");
  const paymentStage = useSelector(
    (state: RootState) => state.paymentStage.paymentStage,
  );
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
    if (data.includes("|")) {
      // QR Code data is in the format "MerchantId|Price"
      const [rawMerchantId, rawPrice] = data.split("|");

      // Sanitize the merchant ID and price
      const merchantId = rawMerchantId.trim();
      const price = parseFloat(rawPrice.trim());

      if (merchantId === "" || isNaN(price) || price <= 0) {
        dispatch(setPaymentStage("Error"));
        return;
      } else {
        setScannedMerchantId(merchantId);
        setPurchase((prev) => ({ ...prev, price }));
        dispatch(setPaymentStage("Verify Purchase"));
      }
    }
  };

  const handleCreateTransaction = async () => {
    // TODO: Replace with actual id values
    const newTransaction: Omit<ITransaction, "transaction_id"> = {
      amount: purchase.price,
      date: new Date(),
      status: "In Progress",
      customer_id: 1,
      merchant_id: 2,
      merchant_payment_id: 3,
      installment_plan_id: 4,
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

  // TODO: Replace with actual payment plans from admin
  const paymentPlans = [
    {
      name: "Pay in Full",
      price: formatCurrency(purchase.price),
    },
    {
      name: "3 Month Plan",
      price: formatCurrency(purchase.price / 3),
    },
    {
      name: "6 Month Plan",
      price: formatCurrency(purchase.price / 6),
    },
    {
      name: "12 Month Plan",
      price: formatCurrency(purchase.price / 12),
    },
  ];

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
              onCancel={() => {
                setScannedMerchantId(null);
                dispatch(setPaymentStage("Scan QR Code"));
              }}
              onNext={() => {
                dispatch(setPaymentStage("Select Payment Plan"));
              }}
            />
          )
        );
      case "Select Payment Plan":
        return (
          <SelectPaymentPlanScreen
            paymentPlans={paymentPlans}
            selectedPlan={selectedPlan}
            setSelectedPlan={setSelectedPlan}
            onCancel={() => dispatch(setPaymentStage("Scan QR Code"))}
            onConfirm={handleCreateTransaction}
          />
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
