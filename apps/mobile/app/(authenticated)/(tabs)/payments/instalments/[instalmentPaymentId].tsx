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
import { useMakePaymentMutation } from "../../../../../redux/services/paymentService";
import { formatCurrency } from "../../../../../utils/formatCurrency";
import { format } from "date-fns";

import { useSelector } from "react-redux";
import { RootState } from "../../../../../redux/store";
import { IVoucherAssigned } from "@repo/interfaces";

export default function InstalmentPaymentDetails() {
  const { instalmentPaymentId } = useLocalSearchParams<{ instalmentPaymentId: string }>();
  const [voucherModalVisible, setVoucherModalVisible] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<IVoucherAssigned | null>(null);
  const [isConfirmationVisible, setIsConfirmationVisible] = useState(false);
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
    refetch: refetchVouchers,
  } = useGetAllVouchersQuery({ customer_id: profile?.customer_id ?? ""});

  // Mutation hook for making payment
  const [makePayment, { isLoading: isPaying }] = useMakePaymentMutation();

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

  // Calculate voucher discount
  let voucherDiscount = 0;

  if (selectedVoucher) {
    const voucher = selectedVoucher.voucher;
    if (voucher.percentage_discount > 0) {
      voucherDiscount = instalmentPayment.amount_due * (voucher.percentage_discount / 100);
    } else if (voucher.amount_discount > 0) {
      voucherDiscount = voucher.amount_discount;
    }
  }

  // Ensure voucher discount does not exceed instalment amount
  voucherDiscount = Math.min(voucherDiscount, instalmentPayment.amount_due);

  const walletBalance = profile?.wallet_balance || 0;

  const amountFromWallet = instalmentPayment.amount_due - voucherDiscount;

  // Make payment
  const handlePayInstalment = async () => {
    try {
      if (amountFromWallet > walletBalance) {
        Toast.show({
          type: "error",
          text1: "Insufficient Wallet Balance",
          text2: "You do not have enough balance in your wallet.",
        });
        return;
      }

      await makePayment({
        instalment_payment_id: instalmentPaymentId as string,
        voucher_assigned_id: selectedVoucher?.voucher_assigned_id,
        amount_discount_from_voucher: voucherDiscount,
        amount_deducted_from_wallet: amountFromWallet,
      }).unwrap();

      Toast.show({
        type: "success",
        text1: "Payment Successful",
      });
      // Refresh data
      refetch();
      refetchVouchers();
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

  // Filter out unusable vouchers
  const usableVouchers = vouchers?.filter(
    (voucherAssigned) =>
      voucherAssigned.remaining_uses > 0 &&
      voucherAssigned.status === "AVAILABLE"
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
          <View className="flex-row flex-wrap">
            {/* Name */}
            <View className="mb-4 w-1/2 pr-2">
              <View className="flex-row items-center">
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#3b82f6"
                  className="mr-4"
                />
                <View>
                  <Text className="text-sm text-gray-500">Name</Text>
                  <Text className="font-medium">
                    {instalmentPayment.transaction.merchant.name}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* ===== Payment Breakdown ===== */}
        <View className="mb-4 rounded-xl bg-white p-4">
          <Text className="mb-2 text-xl font-bold">Payment Breakdown</Text>
          <View className="flex-row justify-between mb-2">
            <Text className="text-base">Instalment Amount:</Text>
            <Text className="text-base">
              {formatCurrency(instalmentPayment.amount_due)}
            </Text>
          </View>
          {voucherDiscount > 0 && (
            <View className="flex-row justify-between mb-2">
              <Text className="text-base">Voucher Discount:</Text>
              <Text className="text-base text-green-600">
                -{formatCurrency(voucherDiscount)}
              </Text>
            </View>
          )}
          <View className="border-t border-gray-200 my-2" />
          <View className="flex-row justify-between">
            <Text className="text-lg font-semibold">Total Payable:</Text>
            <Text className="text-lg font-semibold">
              {formatCurrency(amountFromWallet)}
            </Text>
          </View>
        </View>

        {/* ===== Voucher Button (visible only when no voucher is selected) ===== */}
        {!selectedVoucher && (
          <View className="mb-4">
            <Button
              type="ghost"
              onPress={() => setVoucherModalVisible(true)}
            >
              <Text className="font-semibold text-blue-500">Use Voucher</Text>
            </Button>
          </View>
        )}
        {/* Uncomment and implement cashback logic as needed */}
          {/* <Button
            type="ghost"
            onPress={() => setCashbackModalVisible(true)}
          >
            <Text className="font-semibold text-blue-500">Use Cashback</Text>
          </Button> */}

        {/* ===== Display Selected Voucher ===== */}
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
              {selectedVoucher.voucher.percentage_discount > 0
                ? `${selectedVoucher.voucher.percentage_discount}%`
                : formatCurrency(selectedVoucher.voucher.amount_discount)}
            </Text>
            <Text className="text-sm text-gray-700">
              Valid Until:{" "}
              {format(new Date(selectedVoucher.voucher.expiry_date), "dd MMM yyyy")}
            </Text>
          </View>
        )}

        {/* Implement cashback display if needed */}

        {/* ===== Pay Button ===== */}
        {instalmentPayment.status === "UNPAID" && (
          <Button
            type="primary"
            onPress={() => setIsConfirmationVisible(true)}
            loading={isPaying}
          >
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
            ) : usableVouchers && usableVouchers.length > 0 ? (
              <ScrollView>
              {usableVouchers.map((voucherAssigned) => {
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

      {/* ===== Confirmation Modal ===== */}
      <Modal
        visible={isConfirmationVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsConfirmationVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setIsConfirmationVisible(false)}>
          <BlurView intensity={100} tint="dark"/>
        </TouchableWithoutFeedback>
        <View className="flex-1 items-center justify-center">
          <View className="rounded-lg bg-white p-6">
            <Text className="mb-4 text-lg font-bold">Confirm Payment</Text>
            <Text className="mb-6 text-base">
              Are you sure you want to pay {formatCurrency(amountFromWallet)} for this instalment?
            </Text>
            <View className="flex-row justify-end">
              <Button
                type="ghost"
                onPress={() => setIsConfirmationVisible(false)}
                style={{ marginRight: 8 }}
              >
                <Text className="font-semibold text-gray-500">Cancel</Text>
              </Button>
              <Button
                type="primary"
                onPress={async () => {
                  setIsConfirmationVisible(false);
                  await handlePayInstalment();
                }}
                loading={isPaying}
              >
                <Text className="font-semibold text-white">Confirm</Text>
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};
