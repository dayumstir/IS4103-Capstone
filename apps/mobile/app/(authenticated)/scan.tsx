import { useState } from "react";
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

export default function ScanScreen() {
  const [status, requestPermission] = useCameraPermissions();
  const [product, setProduct] = useState({
    merchantName: "",
    price: 0,
  });
  const [selectedPlan, setSelectedPlan] = useState("Pay in Full");
  const paymentStage = useSelector(
    (state: RootState) => state.paymentStage.paymentStage,
  );
  const dispatch = useDispatch();
  const [createTransaction, { isLoading, isError, error }] =
    useCreateTransactionMutation();
  const [transaction, setTransaction] = useState<ITransaction | null>(null);

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
    // TODO: Replace with actual QR Code validation
    if (data.includes("|")) {
      dispatch(setPaymentStage("Verify Purchase"));

      // QR Code data is in the format "Merchant|Price"
      const [rawMerchantName, rawPrice] = data.split("|");

      // Sanitize the merchant name and price
      const merchantName = rawMerchantName.trim();
      const price = parseFloat(rawPrice.trim());
      if (isNaN(price) || price <= 0 || merchantName === "") {
        dispatch(setPaymentStage("Error"));
        return;
      }

      // Set the product details
      setProduct({
        merchantName: merchantName,
        price: price,
      });
    }
  };

  const handleCreateTransaction = async () => {
    // TODO: Replace with actual id values
    const newTransaction: Omit<ITransaction, "transaction_id"> = {
      amount: product.price,
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

  /* ===== Stage 1: Scan QR Code ===== */
  const scanQrCodeScreen = () => {
    return <ScanQrCodeScreen onBarcodeScanned={handleQrCodeScanned} />;
  };

  /* ===== Stage 2: Verify Purchase ===== */
  const verifyPurchaseScreen = () => {
    return (
      <VerifyPurchaseScreen
        merchantName={product.merchantName}
        price={product.price}
        onCancel={() => dispatch(setPaymentStage("Scan QR Code"))}
        onNext={() => dispatch(setPaymentStage("Select Payment Plan"))}
      />
    );
  };

  // TODO: Replace with actual payment plans from admin
  const paymentPlans = [
    {
      name: "Pay in Full",
      price: formatCurrency(product.price),
    },
    {
      name: "3 Month Plan",
      price: formatCurrency(product.price / 3),
    },
    {
      name: "6 Month Plan",
      price: formatCurrency(product.price / 6),
    },
    {
      name: "12 Month Plan",
      price: formatCurrency(product.price / 12),
    },
  ];
  /* ===== Stage 3: Select Payment Plan ===== */
  const selectPaymentPlanScreen = () => {
    return (
      <SelectPaymentPlanScreen
        paymentPlans={paymentPlans}
        selectedPlan={selectedPlan}
        setSelectedPlan={setSelectedPlan}
        onCancel={() => dispatch(setPaymentStage("Scan QR Code"))}
        onConfirm={handleCreateTransaction}
      />
    );
  };

  /* ===== Stage 4: Payment Complete ===== */
  const paymentCompleteScreen = () => {
    return (
      transaction && (
        <PaymentCompleteScreen
          transaction={transaction}
          merchantName={product.merchantName}
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
  };

  /* ===== Stage 0: Error ===== */
  const errorScreen = () => {
    return (
      <View className="flex-1 items-center justify-center p-16">
        <Text className="text-center text-xl font-semibold text-red-500">
          There has been an error. Please close this window and try again.
        </Text>
      </View>
    );
  };

  const displayScreen = () => {
    switch (paymentStage) {
      case "Scan QR Code":
        return scanQrCodeScreen();
      case "Verify Purchase":
        return verifyPurchaseScreen();
      case "Select Payment Plan":
        return selectPaymentPlanScreen();
      case "Payment Complete":
        return paymentCompleteScreen();
      default:
        return errorScreen();
    }
  };

  return <View className="flex-1">{displayScreen()}</View>;
}
