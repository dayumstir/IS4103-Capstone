// payments/instalments/[instalmentPaymentId].tsx
import { useState } from "react";
import { 
    ActivityIndicator, 
    ScrollView, 
    Text, 
    View,
} from "react-native";
import { Button } from "@ant-design/react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import Toast from "react-native-toast-message";

import { useGetInstalmentPaymentByIdQuery, usePayInstalmentPaymentMutation } from "../../../../../redux/services/instalmentPaymentService";
import { formatCurrency } from "../../../../../utils/formatCurrency";
import { format } from "date-fns";

import { useSelector } from "react-redux";
import { RootState } from "../../../../../redux/store";

export default function InstalmentPaymentDetails() {
  const { instalmentPaymentId } = useLocalSearchParams<{ instalmentPaymentId: string }>();
  const router = useRouter();
  const [payInstalmentPayment] = usePayInstalmentPaymentMutation();
  const { profile } = useSelector((state: RootState) => state.customer);

  // Fetch the instalment payment by ID
  const {
    data: instalmentPayment,
    isLoading,
    error,
    refetch,
  } = useGetInstalmentPaymentByIdQuery(instalmentPaymentId);

  // Handle payment
  const handlePayInstalment = async () => {
    try {
      // await payInstalmentPayment(instalmentPaymentId).unwrap();
      Toast.show({
        type: "success",
        text1: "Payment Successful",
      });
      // Refresh data
      refetch();
      // Navigate back to payments page
      router.back();
    } catch (error) {
      console.error("Payment failed:", error);
      Toast.show({
        type: "error",
        text1: "Payment failed"
      });
    }
  };

  if (isLoading)
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  if (error)
    return (
      <View className="flex-1 items-center justify-center">
        <Text>Error: Please try again later</Text>
      </View>
    );
  if (!instalmentPayment)
    return (
      <View className="flex-1 items-center justify-center">
        <Text>No instalment payment found</Text>
      </View>
    );

  return (
    <ScrollView>
      <View className="m-4">
        {/* ===== Instalment Payment Details ===== */}
        <View className="mb-4 rounded-xl bg-white p-8">
          <Text className="mb-4 text-xl font-bold">Payment Details</Text>
          <View className="flex-row flex-wrap">
            <View className="mb-4 w-1/2 pr-2">
              <View className="flex-row items-center">
                <Ionicons
                  name="wallet-outline"
                  size={20}
                  color="#3b82f6"
                  className="mr-4"
                />
                <View>
                  <Text className="text-sm text-gray-500">Amount Due</Text>
                  <Text className="font-medium">
                    {formatCurrency(instalmentPayment.amount_due)}
                  </Text>
                </View>
              </View>
            </View>
            <View className="mb-4 w-1/2 pl-2">
              <View className="flex-row items-center">
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color="#3b82f6"
                  className="mr-4"
                />
                <View>
                  <Text className="text-sm text-gray-500">Due Date</Text>
                  <Text className="font-medium">
                    {format(new Date(instalmentPayment.due_date), "dd MMM yyyy")}
                  </Text>
                </View>
              </View>
            </View>
            <View className="mb-4 w-1/2 pr-2">
              <View className="flex-row items-center">
                <Ionicons
                  name="document-text-outline"
                  size={20}
                  color="#3b82f6"
                  className="mr-4"
                />
                <View>
                  <Text className="text-sm text-gray-500">Instalment Number</Text>
                  <Text className="font-medium">
                    {instalmentPayment.instalment_number}
                  </Text>
                </View>
              </View>
            </View>
            <View className="mb-4 w-1/2 pl-2">
              <View className="flex-row items-center">
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color="#3b82f6"
                  className="mr-4"
                />
                <View>
                  <Text className="text-sm text-gray-500">Status</Text>
                  <Text className="font-medium">{instalmentPayment.status}</Text>
                </View>
              </View>
            </View>
            {instalmentPayment.late_payment_amount_due > 0 && (
              <View className="mb-4 w-full">
                <View className="flex-row items-center">
                  <Ionicons
                    name="alert-circle-outline"
                    size={20}
                    color="#f87171"
                    className="mr-4"
                  />
                  <View>
                    <Text className="text-sm text-gray-500">Late Payment Fee</Text>
                    <Text className="font-medium text-red-600">
                      {formatCurrency(instalmentPayment.late_payment_amount_due)}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* ===== Merchant Details ===== */}
        <View className="mb-4 rounded-xl bg-white p-8">
          <Text className="mb-4 text-xl font-bold">Merchant Details</Text>
          <View className="flex-row items-center">
            <Ionicons
              name="storefront-outline"
              size={20}
              color="#3b82f6"
              className="mr-4"
            />
            {/* <View>
              <Text className="text-sm text-gray-500">Name</Text>
              <Text className="font-medium">
                {instalmentPayment.transaction.merchant.name}
              </Text>
            </View> */}
          </View>
        </View>

        {/* ===== Voucher and Cashback Buttons ===== */}
        <View className="mb-4 justify-between">
          <Button
            type="ghost"
            // onPress={() => setVoucherModalVisible(true)}
          >
            <Text className="font-semibold text-blue-500">Use Voucher</Text>
          </Button>
          <Button
            type="ghost"
            // onPress={() => setCashbackModalVisible(true)}
          >
            <Text className="font-semibold text-blue-500">Use Cashback</Text>
          </Button>
        </View>

        {/* ===== Display Selected Voucher/Cashback ===== */}
        {/* {selectedVoucher && (
          <View className="mb-2 rounded-md bg-green-100 p-4">
            <Text className="font-semibold text-green-800">
              Voucher Applied: {selectedVoucher.title}
            </Text>
            <TouchableOpacity onPress={() => setSelectedVoucher(null)}>
              <Text className="text-sm text-red-500">Remove Voucher</Text>
            </TouchableOpacity>
          </View>
        )}
        {selectedCashback && (
          <View className="mb-2 rounded-md bg-green-100 p-4">
            <Text className="font-semibold text-green-800">
              Cashback Applied: ${selectedCashback.amount.toFixed(2)}
            </Text>
            <TouchableOpacity onPress={() => setSelectedCashback(null)}>
              <Text className="text-sm text-red-500">Remove Cashback</Text>
            </TouchableOpacity>
          </View>
        )} */}

        {/* ===== Pay Button ===== */}
        {instalmentPayment.status === "UNPAID" && (
          <Button type="primary" onPress={handlePayInstalment}>
            <Text className="font-semibold text-white">Pay Now</Text>
          </Button>
        )}
      </View>
    </ScrollView>
  );
};
