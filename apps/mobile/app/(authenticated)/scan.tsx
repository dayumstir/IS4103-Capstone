import React, { useState } from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useDispatch, useSelector } from "react-redux";
import { setPaymentStage } from "../../redux/features/paymentSlice";
import { RootState } from "../../redux/store";

export default function ScanScreen() {
  const [status, requestPermission] = useCameraPermissions();
  const [product, setProduct] = useState({
    name: "",
    merchant: "",
    price: 0,
  });
  const [selectedPlan, setSelectedPlan] = useState("Pay in Full");

  const paymentStage = useSelector(
    (state: RootState) => state.paymentStage.paymentStage,
  );
  const dispatch = useDispatch();

  // TODO: Use actual QR Code data
  const handleQrCodeScanned = ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    dispatch(setPaymentStage("Verify Purchase"));
    setProduct({
      name: "Example Product",
      merchant: data,
      price: 100,
    });
    // alert(`Barcode type ${type} with data ${data} has been scanned!`);
  };

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

  const handlePaymentComplete = () => {
    console.log("You have chosen the " + selectedPlan);
  };

  /* ===== Stage 1: Scan QR Code ===== */
  const scanQrCodeScreen = () => {
    return (
      <CameraView
        // tailwind not supported
        style={{ flex: 1 }}
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={handleQrCodeScanned}
      />
    );
  };

  /* ===== Stage 2: Verify Purchase ===== */
  const verifyPurchaseScreen = () => {
    return (
      <View className="flex-1 items-center justify-center gap-4">
        <Text className="text-center text-xl">
          You are making a purchase from
        </Text>
        <Text className="text-2xl font-semibold">{product.merchant}</Text>
        <Text className="text-xl">for a</Text>
        <Text className="text-2xl font-semibold">{product.name}</Text>
        <Text className="text-xl">which costs</Text>
        <Text className="text-4xl font-bold">${product.price}</Text>

        {/* ===== Cancel/Next Buttons ===== */}
        <View className="mt-12 flex flex-row gap-8">
          <TouchableOpacity
            className="min-w-32 rounded-md bg-red-500 p-3"
            onPress={() => dispatch(setPaymentStage("Scan QR Code"))}
          >
            <Text className="text-center text-lg font-semibold text-white">
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="min-w-32 rounded-md bg-blue-500 p-3"
            onPress={() => dispatch(setPaymentStage("Select Payment Plan"))}
          >
            <Text className="text-center text-lg font-semibold text-white">
              Next
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  /* ===== Stage 3: Select Payment Plan ===== */
  const selectPaymentPlanScreen = () => {
    return (
      <View className="flex-1 items-center justify-center gap-8">
        <Text className="text-center text-xl font-semibold">
          Which payment plan would you like to use?
        </Text>

        {/* ===== Payment Plans Radio Group ===== */}
        <View className="w-full px-8">
          <TouchableOpacity
            className="mb-4 flex-row items-center rounded-md border border-gray-300 p-4"
            onPress={() => setSelectedPlan("Pay in Full")}
          >
            <View className="mr-4 h-6 w-6 items-center justify-center rounded-full border border-blue-500">
              <View
                className={`h-4 w-4 rounded-full ${selectedPlan === "Pay in Full" ? "bg-blue-500" : "bg-white"}`}
              />
            </View>
            <View>
              <Text className="text-lg font-semibold">Pay in Full</Text>
              <Text className="text-sm text-gray-600">$100 now</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="mb-4 flex-row items-center rounded-md border border-gray-300 p-4"
            onPress={() => setSelectedPlan("3 Month Plan")}
          >
            <View className="mr-4 h-6 w-6 items-center justify-center rounded-full border border-blue-500">
              <View
                className={`h-4 w-4 rounded-full ${selectedPlan === "3 Month Plan" ? "bg-blue-500" : "bg-white"}`}
              />
            </View>
            <View>
              <Text className="text-lg font-semibold">3 Month Plan</Text>
              <Text className="text-sm text-gray-600">$33.33/month</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="mb-4 flex-row items-center rounded-md border border-gray-300 p-4"
            onPress={() => setSelectedPlan("6 Month Plan")}
          >
            <View className="mr-4 h-6 w-6 items-center justify-center rounded-full border border-blue-500">
              <View
                className={`h-4 w-4 rounded-full ${selectedPlan === "6 Month Plan" ? "bg-blue-500" : "bg-white"}`}
              />
            </View>
            <View>
              <Text className="text-lg font-semibold">6 Month Plan</Text>
              <Text className="text-sm text-gray-600">$16.67/month</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            className="mb-4 flex-row items-center rounded-md border border-gray-300 p-4"
            onPress={() => setSelectedPlan("12 Month Plan")}
          >
            <View className="mr-4 h-6 w-6 items-center justify-center rounded-full border border-blue-500">
              <View
                className={`h-4 w-4 rounded-full ${selectedPlan === "12 Month Plan" ? "bg-blue-500" : "bg-white"}`}
              />
            </View>
            <View>
              <Text className="text-lg font-semibold">12 Month Plan</Text>
              <Text className="text-sm text-gray-600">$8.33/month</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ===== Cancel/Next Buttons ===== */}
        <View className="mt-12 flex flex-row gap-8">
          <TouchableOpacity
            className="min-w-32 rounded-md bg-red-500 p-3"
            onPress={() => dispatch(setPaymentStage("Scan QR Code"))}
          >
            <Text className="text-center text-lg font-semibold text-white">
              Cancel
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="min-w-32 rounded-md bg-blue-500 p-3"
            onPress={() => handlePaymentComplete()}
          >
            <Text className="text-center text-lg font-semibold text-white">
              Confirm
            </Text>
          </TouchableOpacity>
        </View>
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
      default:
        return (
          <Text className="text-red-500">
            There has been an error. Please close the app and try again.
          </Text>
        );
    }
  };

  return <View className="flex-1">{displayScreen()}</View>;
}
