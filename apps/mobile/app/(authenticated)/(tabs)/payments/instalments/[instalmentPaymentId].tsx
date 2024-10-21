// payments/instalments/[instalmentPaymentId].tsx
import { useState } from "react";
import { 
    ActivityIndicator, 
    ScrollView, 
    Text, 
    View,
    Modal,
    TouchableOpacity,
    TouchableWithoutFeedback
} from "react-native";
import { Button } from "@ant-design/react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { BlurView } from 'expo-blur';

import { useGetInstalmentPaymentByIdQuery } from "../../../../../redux/services/instalmentPaymentService";
import { useGetAllVouchersQuery } from "../../../../../redux/services/voucherService";
import { formatCurrency } from "../../../../../utils/formatCurrency";
import { format } from "date-fns";

import { useSelector } from "react-redux";
import { RootState } from "../../../../../redux/store";
import { IVoucherAssigned } from "@repo/interfaces";

export default function InstalmentPaymentDetails() {
  const { instalmentPaymentId } = useLocalSearchParams<{ instalmentPaymentId: string }>();
  const [voucherModalVisible, setVoucherModalVisible] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<IVoucherAssigned | null>(null);
  const { profile } = useSelector((state: RootState) => state.customer);
  const router = useRouter();

  // Fetch the instalment payment by ID
  const {
    data: instalmentPayment,
    isLoading,
    error,
    refetch,
  } = useGetInstalmentPaymentByIdQuery(instalmentPaymentId);

  // Fetch customer's vouchers
  const {
    data: vouchers,
    isLoading: isVouchersLoading,
    error: vouchersError,
  } = useGetAllVouchersQuery({ customer_id: profile?.customer_id ?? ""});

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
        <View className="mb-4">
          <Button
            type="ghost"
            onPress={() => setVoucherModalVisible(true)}
          >
            <Text className="font-semibold text-blue-500">Use Voucher</Text>
          </Button>
          {/* Uncomment and implement cashback logic as needed */}
          {/* <Button
            type="ghost"
            onPress={() => setCashbackModalVisible(true)}
          >
            <Text className="font-semibold text-blue-500">Use Cashback</Text>
          </Button> */}
        </View>

        {/* ===== Display Selected Voucher/Cashback ===== */}
        {selectedVoucher && (
          <View className="mb-4 p-4 border rounded-md bg-green-50">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="font-semibold text-lg text-green-800">
                {selectedVoucher.voucher.title}
              </Text>
              <TouchableOpacity onPress={() => setSelectedVoucher(null)}>
                <Ionicons name="close-circle" size={24} color="red" />
              </TouchableOpacity>
            </View>
            <Text className="text-sm text-gray-700 mb-1">
              Discount:{" "}
              {selectedVoucher.voucher.percentage_discount !== 0
                ? `${selectedVoucher.voucher.percentage_discount}%`
                : formatCurrency(selectedVoucher.voucher.amount_discount)}
            </Text>
            <Text className="text-sm text-gray-700">
              Valid Until:{" "}
              {format(new Date(selectedVoucher.voucher.expiry_date), 'dd MMM yyyy')}
            </Text>
          </View>
        )}

        {/* Implement cashback display if needed */}

        {/* ===== Pay Button ===== */}
        {instalmentPayment.status === "UNPAID" && (
          <Button type="primary" onPress={handlePayInstalment}>
            <Text className="font-semibold text-white">Pay Now</Text>
          </Button>
        )}
      </View>

      {/* ===== Voucher Modal ===== */}
      <Modal
        visible={voucherModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setVoucherModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setVoucherModalVisible(false)}>
          <BlurView intensity={10} tint="dark" style={{ flex: 1 }} />
        </TouchableWithoutFeedback>
        <View>
          <View className="max-h-3/4 bg-white p-4 rounded-t-xl">
            <Text className="mb-4 text-xl font-bold">Select a Voucher</Text>
            {isVouchersLoading ? (
              <ActivityIndicator size="large" />
            ) : vouchersError ? (
              <Text>Error loading vouchers. Please try again later.</Text>
            ) : vouchers && vouchers.length > 0 ? (
              <ScrollView>
              {vouchers.map((voucherAssigned) => {
                const voucher = voucherAssigned.voucher;
                return (
                  <TouchableOpacity
                    key={voucherAssigned.voucher_assigned_id}
                    className="mb-2 p-4 border rounded-md bg-white shadow-sm"
                    onPress={() => {
                      setSelectedVoucher(voucherAssigned);
                      setVoucherModalVisible(false);
                    }}
                  >
                    <Text className="font-semibold text-lg mb-1">{voucher.title}</Text>

                    <View className="flex-row flex-wrap mb-2">
                      <View className="w-1/2 mb-2">
                        <Text className="text-sm text-gray-500">Percentage Discount:</Text>
                        <Text className="text-base font-medium">
                          {voucher.percentage_discount}%
                        </Text>
                      </View>

                      <View className="w-1/2 mb-2">
                        <Text className="text-sm text-gray-500">Discount Amount:</Text>
                        <Text className="text-base font-medium">
                          ${voucher.amount_discount}
                        </Text>
                      </View>

                      <View className="w-1/2 mb-2">
                        <Text className="text-sm text-gray-500">Usage Limit:</Text>
                        <Text className="text-base font-medium">
                          {voucherAssigned.remaining_uses} / {voucher.usage_limit}
                        </Text>
                      </View>

                      <View className="w-1/2 mb-2">
                        <Text className="text-sm text-gray-500">Valid Until:</Text>
                        <Text className="text-base font-medium">
                          {format(new Date(voucher.expiry_date), 'dd MMM yyyy')}
                        </Text>
                      </View>

                      <View className="w-1/2 mb-2">
                        <Text className="text-sm text-gray-500">Status:</Text>
                        <Text
                          className={`text-base font-medium ${
                            voucher.is_active ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {voucher.is_active ? 'Active' : 'Inactive'}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            ) : (
              <Text>No vouchers available.</Text>
            )}
            <Button type="ghost" onPress={() => setVoucherModalVisible(false)}>
              <Text className="font-semibold text-blue-500">Close</Text>
            </Button>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};
