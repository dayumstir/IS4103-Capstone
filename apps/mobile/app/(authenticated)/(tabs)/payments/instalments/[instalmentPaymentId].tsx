// app/mobile/app/(authenticated)/(tabs)/payments/installments/[instalmentPaymentId].tsx
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  RefreshControl,
  TextInput,
} from "react-native";
import { Button } from "@ant-design/react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import Toast from "react-native-toast-message";
import { BlurView } from "expo-blur";
import { z } from "zod";

import { useGetInstalmentPaymentByIdQuery } from "../../../../../redux/services/instalmentPaymentService";
import { useGetAllVouchersQuery } from "../../../../../redux/services/voucherService";
import { useGetAllCashbackWalletsQuery } from "../../../../../redux/services/cashbackWalletService";
import { useMakePaymentMutation } from "../../../../../redux/services/paymentService";
import { formatCurrency } from "../../../../../utils/formatCurrency";
import { format, isAfter } from "date-fns";

import { useSelector } from "react-redux";
import { RootState } from "../../../../../redux/store";
import { IVoucherAssigned, ICashbackWallet } from "@repo/interfaces";

export default function InstalmentPaymentDetails() {
  const { instalmentPaymentId } = useLocalSearchParams<{
    instalmentPaymentId: string;
  }>();
  const [voucherModalVisible, setVoucherModalVisible] = useState(false);
  const [cashbackModalVisible, setCashbackModalVisible] = useState(false);
  const [selectedVoucher, setSelectedVoucher] =
    useState<IVoucherAssigned | null>(null);
  const [selectedCashbackWallet, setSelectedCashbackWallet] =
    useState<ICashbackWallet | null>(null);
  const [cashbackAmount, setCashbackAmount] = useState<string>("0");
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
  } = useGetAllVouchersQuery({ customer_id: profile?.customer_id ?? "" });

  // Fetch customer's cashback wallets
  const {
    data: cashbackWallets,
    isLoading: isCashbackWalletsLoading,
    error: cashbackWalletsError,
    refetch: refetchCashbackWallets,
  } = useGetAllCashbackWalletsQuery({
    customer_id: profile?.customer_id ?? "",
  });

  // Mutation hook for making payment
  const [makePayment, { isLoading: isPaying }] = useMakePaymentMutation();

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    Promise.all([
      refetch(),
      refetchVouchers(),
      refetchCashbackWallets(),
    ]).finally(() => {
      setRefreshing(false);
    });
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

  // Determine if the instalment payment is past due
  const isPastDue = isAfter(new Date(), new Date(instalmentPayment.due_date));

  // Retrieve the interest rate from the instalment plan
  const interestRate =
    instalmentPayment.transaction.instalment_plan.interest_rate || 0;

  // Calculate the late payment fee
  const latePaymentFee = isPastDue
    ? (instalmentPayment.amount_due * interestRate) / 100
    : 0;

  // Calculate voucher discount
  let voucherDiscount = 0;

  if (selectedVoucher) {
    const voucher = selectedVoucher.voucher;
    if (voucher.percentage_discount > 0) {
      voucherDiscount =
        instalmentPayment.amount_due * (voucher.percentage_discount / 100);
    } else if (voucher.amount_discount > 0) {
      voucherDiscount = voucher.amount_discount;
    }
  }

  // Ensure voucher discount does not exceed instalment amount
  voucherDiscount = Math.min(voucherDiscount, instalmentPayment.amount_due);

  // Find applicable cashback wallet
  const applicableCashbackWallet = cashbackWallets?.find(
    (wallet) =>
      wallet.merchant_id ===
      instalmentPayment.transaction.merchant.merchant_id,
  );

  // Only calculate maxCashbackUsable if a cashback wallet is selected
  const maxCashbackUsable = selectedCashbackWallet
    ? Math.min(
        selectedCashbackWallet.wallet_balance,
        instalmentPayment.amount_due - voucherDiscount,
      )
    : 0;

  // Input validation using Zod
  let cashbackAmountError = "";

  if (selectedCashbackWallet) {
    const cashbackAmountSchema = z.object({
      amount: z
        .string()
        .min(1, { message: "Amount is required" })
        .refine(
          (val) => {
            const num = parseFloat(val);
            return (
              !isNaN(num) &&
              num >= 0 &&
              num <= maxCashbackUsable
            );
          },
          {
            message: `Please enter a valid amount between $0 and ${formatCurrency(
              maxCashbackUsable
            )}`,
          }
        ),
    });

    const validateCashbackAmount = (amount: string) => {
      try {
        cashbackAmountSchema.parse({ amount });
        return "";
      } catch (e) {
        if (e instanceof z.ZodError) {
          return e.errors[0].message;
        }
        return "An unexpected error occurred.";
      }
    };

    cashbackAmountError = validateCashbackAmount(cashbackAmount);
  }

  const adjustedCashbackAmount =
    selectedCashbackWallet && !cashbackAmountError
      ? parseFloat(cashbackAmount)
      : 0;

  // Calculate total payable amount
  const totalPayable =
    instalmentPayment.amount_due +
    latePaymentFee -
    voucherDiscount -
    adjustedCashbackAmount;

  const walletBalance = profile?.wallet_balance || 0;

  const amountFromWallet = totalPayable;

  // Make payment
  const handlePayInstalment = async () => {
    try {
      if (amountFromWallet > walletBalance) {
        Toast.show({
          type: "error",
          text1: "Insufficient Wallet Balance",
          text2: "You do not have enough balance in your wallet.",
        });
        setIsConfirmationVisible(false);
        return;
      }

      await makePayment({
        instalment_payment_id: instalmentPaymentId as string,
        voucher_assigned_id: selectedVoucher?.voucher_assigned_id,
        amount_discount_from_voucher: voucherDiscount,
        amount_deducted_from_wallet: amountFromWallet,
        cashback_wallet_id: selectedCashbackWallet?.cashback_wallet_id,
        amount_deducted_from_cashback_wallet: adjustedCashbackAmount,
      }).unwrap();

      Toast.show({
        type: "success",
        text1: "Payment Successful",
      });
      // Refresh data
      refetch();
      refetchVouchers();
      refetchCashbackWallets();
      // Navigate back to payments page
      router.back();
    } catch (error) {
      console.error("Payment failed:", error);
      setIsConfirmationVisible(false);
      Toast.show({
        type: "error",
        text1: "Payment failed",
      });
    }
  };

  // Filter out unusable vouchers
  const usableVouchers = vouchers?.filter((voucherAssigned) => {
    const isNotExpired =
      isAfter(new Date(voucherAssigned.voucher.expiry_date), new Date());
    return (
      voucherAssigned.remaining_uses > 0 &&
      voucherAssigned.status === "AVAILABLE" &&
      isNotExpired
    );
  });

  // Handle cashback amount input
  const handleCashbackAmountChange = (value: string) => {
    setCashbackAmount(value);
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="m-4">
        {/* ===== Instalment Payment Details ===== */}
        <View className="mb-4 rounded-xl bg-white p-8">
          <Text className="mb-4 text-xl font-bold">
            Instalment Payment Details
          </Text>
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
                    {format(
                      new Date(instalmentPayment.due_date),
                      "dd MMM yyyy",
                    )}
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
                  <Text className="text-sm text-gray-500">
                    Instalment Number
                  </Text>
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
                  <Text className="font-medium">
                    {instalmentPayment.status}
                  </Text>
                </View>
              </View>
            </View>

            <View className="mb-4 w-1/2 pr-2">
              <View className="flex-row items-center">
                <Ionicons
                  name="alert-circle-outline"
                  size={20}
                  color={
                    latePaymentFee > 0
                      ? "#ef4444"
                      : "#3b82f6"
                  }
                  className="mr-4"
                />
                <View>
                  <Text className="text-sm text-gray-500">
                    Late Payment Fee
                  </Text>
                  <Text
                    className={`font-medium ${latePaymentFee > 0 ? "text-red-500" : ""}`}
                  >
                    {latePaymentFee > 0
                      ? formatCurrency(
                        latePaymentFee,
                        )
                      : "N/A"}
                  </Text>
                </View>
              </View>
            </View>

            <View className="mb-4 w-1/2 pl-2">
              <View className="flex-row items-center">
                <Ionicons
                  name="time-outline"
                  size={20}
                  color="#3b82f6"
                  className="mr-4"
                />
                <View>
                  <Text className="text-sm text-gray-500">Date Paid</Text>
                  <Text className="font-medium">
                    {instalmentPayment.paid_date
                      ? format(
                          new Date(instalmentPayment.paid_date),
                          "d MMM yyyy",
                        )
                      : "N/A"}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          {/* ===== Navigate to Transaction Details ===== */}
          <Button
            type="primary"
            onPress={() =>
              router.push(`/payments/${instalmentPayment.transaction_id}`)
            }
            className="w-full"
          >
            <View className="flex-row items-center justify-center">
              <Ionicons
                name="receipt-outline"
                size={20}
                color="#fff"
                className="mr-2"
              />
              <Text className="font-semibold text-white">View Transaction</Text>
            </View>
          </Button>
        </View>

        {/* ===== Merchant Details ===== */}
        <View className="mb-4 rounded-xl bg-white p-8">
          <Text className="mb-4 text-xl font-bold">Merchant Details</Text>
          <View className="flex-row flex-wrap">
            {/* Name */}
            <View className="w-1/2 pr-2">
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
        <View className="mb-4 rounded-xl bg-white p-8">
          <Text className="mb-2 text-xl font-bold">Payment Breakdown</Text>

          {instalmentPayment.status === "PAID" ? (
            // Display payment breakdown for paid instalments
            <>
              <View className="mb-2 flex-row justify-between">
                <Text className="text-base">Instalment Amount:</Text>
                <Text className="text-base">
                  {formatCurrency(instalmentPayment.amount_due ?? 0)}
                </Text>
              </View>

              {(instalmentPayment.amount_discount_from_voucher ?? 0) > 0 && (
                <View className="mb-2 flex-row justify-between">
                  <Text className="text-base">Voucher Discount:</Text>
                  <Text className="text-base text-green-600">
                    -{formatCurrency(instalmentPayment.amount_discount_from_voucher ?? 0)}
                  </Text>
                </View>
              )}

              {(instalmentPayment.amount_deducted_from_cashback_wallet ?? 0) > 0 && (
                <View className="mb-2 flex-row justify-between">
                  <Text className="text-base">Cashback Applied:</Text>
                  <Text className="text-base text-green-600">
                    -{formatCurrency(instalmentPayment.amount_deducted_from_cashback_wallet ?? 0)}
                  </Text>
                </View>
              )}

              <View className="mb-2 flex-row justify-between">
                <Text className="text-base">Late Payment Fee:</Text>
                <Text className="text-base">
                  {instalmentPayment.late_payment_amount_due
                    ? formatCurrency(instalmentPayment.late_payment_amount_due)
                    : "N/A"}
                </Text>
              </View>

              <View className="mt-2 border-t border-gray-200" />
              <View className="flex-row justify-between">
                <Text className="text-lg font-semibold">Total Paid:</Text>
                <Text className="text-lg font-semibold">
                  {formatCurrency(instalmentPayment.amount_deducted_from_wallet ?? 0)}
                </Text>
              </View>
            </>
          ) : (
            // Display payment details for unpaid instalments
            <>
              <View className="mb-2 flex-row justify-between">
                <Text className="text-base">Instalment Amount:</Text>
                <Text className="text-base">
                  {formatCurrency(instalmentPayment.amount_due ?? 0)}
                </Text>
              </View>

              {latePaymentFee > 0 && (
                <View className="mb-2 flex-row justify-between">
                  <Text className="text-base">Late Payment Fee ({interestRate}%):</Text>
                  <Text className="text-base text-red-600">
                    +{formatCurrency(latePaymentFee)}
                  </Text>
                </View>
              )}

              {voucherDiscount > 0 && (
                <View className="mb-2 flex-row justify-between">
                  <Text className="text-base">Voucher Discount:</Text>
                  <Text className="text-base text-green-600">
                    -{formatCurrency(voucherDiscount)}
                  </Text>
                </View>
              )}

              {adjustedCashbackAmount > 0 && (
                <View className="mb-2 flex-row justify-between">
                  <Text className="text-base">Cashback Applied:</Text>
                  <Text className="text-base text-green-600">
                    -{formatCurrency(adjustedCashbackAmount)}
                  </Text>
                </View>
              )}

              <View className="my-2 border-t border-gray-200" />
              <View className="flex-row justify-between">
                <Text className="text-lg font-semibold">Total Payable:</Text>
                <Text className="text-lg font-semibold">
                  {formatCurrency(amountFromWallet)}
                </Text>
              </View>
            </>
          )}
        </View>


        {/* ===== Voucher Button (visible only when no voucher is selected) ===== */}
        {instalmentPayment.status === "UNPAID" && !selectedVoucher && (
          <View className="mb-4">
            <Button type="ghost" onPress={() => setVoucherModalVisible(true)}>
              <Text className="font-semibold text-blue-500">Use Voucher</Text>
            </Button>
          </View>
        )}

        {/* ===== Display Selected Voucher ===== */}
        {selectedVoucher && (
          <View className="mb-4 rounded-md border bg-green-50 p-4">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-green-800">
                {selectedVoucher.voucher.title}
              </Text>
              <TouchableOpacity onPress={() => setSelectedVoucher(null)}>
                <Ionicons name="close-circle" size={24} color="red" />
              </TouchableOpacity>
            </View>
            <Text className="mb-1 text-sm text-gray-700">
              Discount:{" "}
              {selectedVoucher.voucher.percentage_discount > 0
                ? `${selectedVoucher.voucher.percentage_discount}%`
                : formatCurrency(selectedVoucher.voucher.amount_discount)}
            </Text>
            <Text className="text-sm text-gray-700">
              Valid Until:{" "}
              {format(
                new Date(selectedVoucher.voucher.expiry_date),
                "dd MMM yyyy"
              )}
            </Text>
          </View>
        )}

        {/* ===== Cashback Button ===== */}
        {instalmentPayment.status === "UNPAID" && !selectedCashbackWallet && (
          <View className="mb-4">
            <Button
              type="ghost"
              onPress={() => setCashbackModalVisible(true)}
              disabled={!applicableCashbackWallet}
            >
              <Text
                className={`font-semibold ${
                  applicableCashbackWallet ? "text-blue-500" : "text-gray-400"
                }`}
              >
                Use Cashback
              </Text>
            </Button>
          </View>
        )}

        {/* ===== Display Selected Cashback ===== */}
        {selectedCashbackWallet && adjustedCashbackAmount > 0 && (
          <View className="mb-4 rounded-md border bg-green-50 p-4">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="text-lg font-semibold text-green-800">
                Cashback Applied
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setSelectedCashbackWallet(null);
                  setCashbackAmount("0");
                }}
              >
                <Ionicons name="close-circle" size={24} color="red" />
              </TouchableOpacity>
            </View>
            <Text className="mb-1 text-sm text-gray-700">
              Amount Used: {formatCurrency(adjustedCashbackAmount)}
            </Text>
            <Text className="text-sm text-gray-700">
              Remaining Balance:{" "}
              {formatCurrency(
                selectedCashbackWallet.wallet_balance - adjustedCashbackAmount
              )}
            </Text>
          </View>
        )}

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
        <View className="absolute bottom-0 left-0 right-0 h-4/5 rounded-t-xl bg-white p-4">
          <Text className="mb-4 text-xl font-bold">Select a Voucher</Text>
          {isVouchersLoading ? (
            <ActivityIndicator size="large" />
          ) : vouchersError ? (
            <Text>Error loading vouchers. Please try again later.</Text>
          ) : usableVouchers && usableVouchers.length > 0 ? (
            <ScrollView className="mb-4">
              {usableVouchers.map((voucherAssigned, index) => (
                <TouchableOpacity
                  key={voucherAssigned.voucher_assigned_id}
                  onPress={() => {
                    setSelectedVoucher(voucherAssigned);
                    setVoucherModalVisible(false);
                  }}
                  className="mb-4"
                >
                  {/* VoucherAssignedCard code directly included here */}
                  <View className="w-full rounded-lg border border-gray-300 bg-white p-4">
                    <View className="mb-2 flex-row items-center justify-between">
                      <Text className="text-lg font-bold">
                        {voucherAssigned.voucher.title.length > 25
                          ? voucherAssigned.voucher.title.substring(0, 25) +
                            "..."
                          : voucherAssigned.voucher.title}
                      </Text>
                      <View
                        className={`rounded px-1 py-0.5 ${
                          voucherAssigned.status === "AVAILABLE"
                            ? "bg-blue-500"
                            : "bg-gray-500"
                        }`}
                      >
                        <Text className="text-xs font-semibold text-white">
                          {voucherAssigned.status}
                        </Text>
                      </View>
                    </View>
                    <Text className="text-sm text-gray-800">
                      {voucherAssigned.voucher.description.length > 80
                        ? voucherAssigned.voucher.description.substring(0, 80) +
                          "..."
                        : voucherAssigned.voucher.description}
                    </Text>
                    <View className="mt-2 border-t border-gray-200 pt-2">
                      <Text className="text-xs text-gray-600">
                        Expires:{" "}
                        {format(
                          new Date(voucherAssigned.voucher.expiry_date),
                          "d MMM yyyy",
                        )}
                      </Text>
                      <Text className="text-xs text-gray-600">
                        Remaining Uses: {voucherAssigned.remaining_uses}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <Text>No vouchers available.</Text>
          )}
          <Button type="ghost" onPress={() => setVoucherModalVisible(false)}>
            <Text className="font-semibold text-blue-500">Close</Text>
          </Button>
        </View>
      </Modal>

      {/* ===== Cashback Modal ===== */}
      <Modal
        visible={cashbackModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          setCashbackModalVisible(false);
          setCashbackAmount("0");
        }}
      >
        <TouchableWithoutFeedback
          onPress={() => {
            setCashbackModalVisible(false);
            setCashbackAmount("0");
          }}
        >
          <BlurView intensity={10} tint="dark" style={{ flex: 1 }} />
        </TouchableWithoutFeedback>
        <View className="absolute bottom-0 left-0 right-0 max-h-3/4 rounded-t-xl bg-white p-4">
          <Text className="mb-4 text-xl font-bold">Use Cashback</Text>
          {isCashbackWalletsLoading ? (
            <ActivityIndicator size="large" />
          ) : cashbackWalletsError ? (
            <Text>Error loading cashback wallets. Please try again later.</Text>
          ) : applicableCashbackWallet ? (
            <View>
              {/* Display cashback wallet details */}
              <View className="mb-4 rounded-lg bg-white p-4">
                <View className="mb-4 flex-row items-center gap-4">
                  <View className="h-12 w-12 items-center justify-center rounded-full bg-green-500">
                    <MaterialCommunityIcons
                      name="wallet-outline"
                      size={24}
                      color="white"
                    />
                  </View>
                  <View>
                    <Text className="text-2xl font-bold">
                      {applicableCashbackWallet.merchant.name}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      Cashback Wallet
                    </Text>
                  </View>
                </View>

                <View className="flex gap-2">
                  <Text>
                    <Text className="font-bold">Wallet Balance:</Text>{" "}
                    {formatCurrency(applicableCashbackWallet.wallet_balance)}
                  </Text>
                  <Text>
                    <Text className="font-bold">Updated At:</Text>{" "}
                    {format(
                      new Date(applicableCashbackWallet.updatedAt),
                      "d MMM yyyy"
                    )}
                  </Text>
                </View>
              </View>

              {/* Calculate maxCashbackUsable here */}
              {(() => {
                const maxCashbackUsable = Math.min(
                  applicableCashbackWallet.wallet_balance,
                  instalmentPayment.amount_due - voucherDiscount
                );

                // Update the validation schema
                const cashbackAmountSchema = z.object({
                  amount: z
                    .string()
                    .min(1, { message: "Amount is required" })
                    .refine(
                      (val) => {
                        const num = parseFloat(val);
                        return (
                          !isNaN(num) &&
                          num > 0 &&
                          num <= maxCashbackUsable
                        );
                      },
                      {
                        message: `Please enter a valid amount between $0 and ${formatCurrency(
                          maxCashbackUsable
                        )}`,
                      }
                    ),
                });

                const validateCashbackAmount = (amount: string) => {
                  try {
                    cashbackAmountSchema.parse({ amount });
                    return "";
                  } catch (e) {
                    if (e instanceof z.ZodError) {
                      return e.errors[0].message;
                    }
                    return "An unexpected error occurred.";
                  }
                };

                const cashbackAmountError = validateCashbackAmount(cashbackAmount);

                return (
                  <>
                    {/* Input for cashback amount */}
                    <View className="mb-4">
                      <Text className="mb-2 text-base font-semibold">
                        Enter Amount to Use:
                      </Text>
                      <TextInput
                        keyboardType="numeric"
                        placeholder="0.00"
                        value={cashbackAmount}
                        onChangeText={handleCashbackAmountChange}
                        className="w-full rounded border border-gray-300 p-2"
                      />
                      {cashbackAmountError ? (
                        <Text className="mt-1 text-sm text-red-500">
                          {cashbackAmountError}
                        </Text>
                      ) : null}
                      <Text className="mt-2 text-sm text-gray-500">
                        Maximum amount you can use:{" "}
                        {formatCurrency(maxCashbackUsable)}
                      </Text>
                    </View>

                    {/* Buttons */}
                    <View className="flex-row justify-end">
                      <Button
                        type="ghost"
                        onPress={() => {
                          setCashbackModalVisible(false);
                          setCashbackAmount("0");
                        }}
                        style={{ marginRight: 8 }}
                      >
                        <Text className="font-semibold text-gray-500">
                          Cancel
                        </Text>
                      </Button>
                      <Button
                        type="primary"
                        onPress={() => {
                          if (cashbackAmountError) {
                            // Toast.show({
                            //   type: "error",
                            //   text1: "Invalid Amount",
                            //   text2: cashbackAmountError,
                            // });
                            return;
                          }
                          setSelectedCashbackWallet(applicableCashbackWallet);
                          setCashbackModalVisible(false);
                        }}
                      >
                        <Text className="font-semibold text-white">Apply</Text>
                      </Button>
                    </View>
                  </>
                );
              })()}
            </View>
          ) : (
            <Text>No applicable cashback wallet available.</Text>
          )}
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
          <BlurView intensity={30} tint="dark" style={{ flex: 1 }} />
        </TouchableWithoutFeedback>
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center' }}>
          <View className="w-11/12 rounded-xl bg-white p-4">
            <Text className="mb-4 text-xl font-bold">Confirm Payment</Text>
            <Text className="mb-4 text-base">
              Are you sure you want to proceed with the payment of{' '}
              <Text className="font-semibold">
                {formatCurrency(amountFromWallet)}
              </Text>
              ?
            </Text>
            <View className="flex-row justify-end">
              <Button
                type="ghost"
                onPress={() => setIsConfirmationVisible(false)}
                style={{ marginRight: 8 }}
              >
                <Text className="font-semibold text-gray-500">Cancel</Text>
              </Button>
              <Button type="primary" onPress={handlePayInstalment} loading={isPaying}>
                <Text className="font-semibold text-white">Confirm</Text>
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
