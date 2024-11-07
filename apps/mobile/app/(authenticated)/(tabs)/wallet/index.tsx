// app/mobile/app/(authenticated)/(tabs)/wallet/index.tsx

import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "@ant-design/react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
import Toast from "react-native-toast-message";
import { useRouter } from "expo-router";
import { format } from "date-fns";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { STRIPE_PUBLISHABLE_KEY } from "@env";
import {
  useCreatePaymentIntentMutation,
  useGetPaymentHistoryQuery,
} from "../../../../redux/services/paymentService";
import { useGetProfileQuery } from "../../../../redux/services/customerService";
import { useGetCustomerOutstandingInstalmentPaymentsQuery } from "../../../../redux/services/instalmentPaymentService";
import { formatCurrency } from "../../../../utils/formatCurrency";

// Define validation schema
const topUpSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => {
      const num = parseFloat(val);
      return !isNaN(num) && num > 0;
    }, "Please enter a valid positive amount"),
});

type TopUpFormValues = z.infer<typeof topUpSchema>;

export default function WalletPage() {
  const { initPaymentSheet, presentPaymentSheet, handleURLCallback } = useStripe();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { data: profile, refetch } = useGetProfileQuery();
  const [createPaymentIntent] = useCreatePaymentIntentMutation();

  // Form state
  const { control, handleSubmit, reset, formState: { errors } } = useForm<TopUpFormValues>({
    resolver: zodResolver(topUpSchema),
  });

  // Fetch payment history and outstanding instalments
  const {
    data: outstandingInstalmentPayments,
    refetch: refetchInstalmentPayments,
  } = useGetCustomerOutstandingInstalmentPaymentsQuery();
  
  const {
    data: paymentHistory,
    isLoading: isPaymentHistoryLoading,
    refetch: refetchPaymentHistory,
  } = useGetPaymentHistoryQuery();

  // Total outstanding payments
  const totalOutstanding = outstandingInstalmentPayments?.reduce((sum, payment) => sum + payment.amount_due, 0) ?? 0;

  // Define handlers and helper functions
  const fetchPaymentSheetParams = async (amount: string) => {
    const roundedAmount = Math.round(parseFloat(amount) * 100); // Convert to cents and round
    const response = await createPaymentIntent({ amount: roundedAmount }).unwrap();
    return response;
  };

  const initializePaymentSheet = async (amount: string) => {
    const { paymentIntent, ephemeralKey, customer } = await fetchPaymentSheetParams(amount);
    const { error } = await initPaymentSheet({
      merchantDisplayName: "Panda Pay",
      customerId: customer,
      customerEphemeralKeySecret: ephemeralKey,
      paymentIntentClientSecret: paymentIntent,
      returnURL: "panda://stripe-redirect",
    });

    if (error) {
      throw new Error(`Error initializing payment sheet: ${error.message}`);
    }
  };

  const openPaymentSheet = async () => {
    const { error } = await presentPaymentSheet();

    if (error) {
      if (error.code === "Canceled") {
        Toast.show({
          type: "info",
          text1: "Payment canceled",
          text2: "You have canceled the payment.",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Payment failed",
          text2: error.message,
        });
      }
      setLoading(false);
    } else {
      Toast.show({
        type: "success",
        text1: "Payment successful",
      });
      refetch();
      refetchPaymentHistory();
      reset({ amount: "" });
      setLoading(false);
    }
  };

  const handleTopUpAmount = async (amount: string) => {
    setLoading(true);

    try {
      await initializePaymentSheet(amount);
      await openPaymentSheet();
    } catch (error: any) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message,
      });
      setLoading(false);
    }
  };

  const handleTopUp = async (data: TopUpFormValues) => {
    const { amount } = data;
    await handleTopUpAmount(amount);
  };

  const handleTopUpSuggestedAmount = async (amount: number) => {
    await handleTopUpAmount(amount.toString());
  };

  const handleDeepLink = useCallback(
    async (url: string | null) => {
      if (url) {
        const stripeHandled = await handleURLCallback(url);
        if (!stripeHandled) {
          // Handle non-Stripe deep links if necessary
        }
      }
    },
    [handleURLCallback],
  );

  useEffect(() => {
    const getUrlAsync = async () => {
      const initialUrl = await Linking.getInitialURL();
      handleDeepLink(initialUrl);
    };
    getUrlAsync();

    const deepLinkListener = Linking.addEventListener("url", (event) => {
      handleDeepLink(event.url);
    });

    return () => deepLinkListener.remove();
  }, [handleDeepLink]);

  const onRefresh = () => {
    setRefreshing(true);
    Promise.all([refetchPaymentHistory(), refetchInstalmentPayments()])
      .then(() => setRefreshing(false))
      .catch((error) => {
        console.error("Error refreshing data:", error);
        setRefreshing(false);
      });
  };

  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="m-4 flex-row items-center justify-between">
          <Text className="text-4xl font-bold">Wallet</Text>
          <TouchableOpacity className="p-2">
            <Ionicons name="notifications-outline" size={24} color="black" />
          </TouchableOpacity>
        </View>

        {/* ===== Wallet Balance & Outstanding Payments ===== */}
        <LinearGradient
          colors={["#3b82f6", "#9333ea"]}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
          style={{
            borderRadius: 12,
            padding: 24,
            marginHorizontal: 16,
          }}
        >
          <View className="mb-4 flex-row items-center justify-between">
            <View>
              <Text className="text-sm font-semibold text-white">
                Wallet Balance
              </Text>
              <Text className="text-3xl font-bold text-white">
                {formatCurrency(profile?.wallet_balance ?? 0)}
              </Text>
            </View>
          </View>
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm font-semibold text-white">
                Outstanding Payments
              </Text>
              <Text className="text-2xl font-bold text-white">
                {formatCurrency(totalOutstanding)}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {/* ===== Top Up ===== */}
        <View className="m-4 rounded-xl bg-white p-8">
          <Text className="mb-2 text-xl font-bold">Top Up Wallet</Text>

          {/* Instruction for Suggested Amounts */}
          <Text className="mb-2 text-sm text-gray-700">
            Tap on any of the suggested amounts for top up:
          </Text>

          {/* Suggested Amount Buttons */}
          <View className="mb-4 flex-row justify-between">
            {[10, 20, 50, 100].map((suggestedAmount) => (
              <TouchableOpacity
                key={suggestedAmount}
                className="mx-1 flex-1"
                onPress={() => handleTopUpSuggestedAmount(suggestedAmount)}
                disabled={loading}
              >
                <View
                  className={`items-center justify-center rounded-lg border p-2 ${
                    loading ? "bg-gray-200" : "bg-white"
                  }`}
                >
                  <Text className="text-lg font-semibold">
                    ${suggestedAmount}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Instruction for Custom Amount */}
          <Text className="mb-2 text-sm text-gray-700">
            Or enter your own custom amount:
          </Text>

          {/* Custom Amount Input */}
          <Controller
            control={control}
            name="amount"
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <View className="mb-4">
                  <TextInput
                    className="rounded-md border border-gray-300 p-4 focus:border-blue-500"
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                    placeholder="Enter amount to top up"
                    keyboardType="numeric"
                  />
                  {errors.amount && (
                    <Text className="mt-1 text-red-500">
                      {errors.amount.message}
                    </Text>
                  )}
                </View>
              </View>
            )}
          />

          {/* Top Up Button */}
          <Button
            type="primary"
            onPress={handleSubmit(handleTopUp)}
            disabled={!STRIPE_PUBLISHABLE_KEY || loading}
            loading={loading}
          >
            <Text className="font-semibold text-white">Top Up</Text>
          </Button>
        </View>

        {/* ===== Recent Payment/Top Up History ===== */}
        <View className="mx-4 mb-4 rounded-xl bg-white p-8">
          <Text className="mb-2 text-xl font-bold">
            Recent Wallet History
          </Text>
          {isPaymentHistoryLoading ? (
            <View className="items-center justify-center py-4">
              <ActivityIndicator size="large" />
            </View>
          ) : paymentHistory && paymentHistory.length > 0 ? (
            <>
              {paymentHistory.slice(0, 3).map((record) => {
                let icon = "💰";
                let title = "Top Up";
                let amountColor = "text-green-600";
                let amountPrefix = "+";

                if (record.payment_type === "INSTALMENT_PAYMENT") {
                  icon = "💸";
                  title = "Instalment Payment";
                  amountColor = "text-red-600";
                  amountPrefix = "-";
                } else if (record.payment_type === "REFUND") {
                  icon = "💵";
                  title = "Refund";
                  amountColor = "text-green-600";
                  amountPrefix = "+";
                } else if (record.payment_type === "OTHER") {
                  icon = "🔄";
                  title = "Transaction";
                  amountColor = "text-gray-600";
                  amountPrefix = "";
                }

                return (
                  <View
                    key={record.payment_history_id}
                    className="flex-row items-center justify-between border-t border-gray-200 py-4"
                  >
                    <View className="flex-row items-center gap-4">
                      <View className="h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                        <Text className="text-center text-2xl">{icon}</Text>
                      </View>
                      <View className="mr-4 flex-1">
                        <Text
                          className="text-base font-medium"
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {title}
                        </Text>
                        <Text className="text-sm text-gray-500">
                          {format(
                            new Date(record.payment_date),
                            "dd MMM yyyy, hh:mm a",
                          )}
                        </Text>
                      </View>
                      <Text
                        className={`text-base font-semibold ${amountColor}`}
                      >
                        {amountPrefix}
                        {formatCurrency(record.amount)}
                      </Text>
                    </View>
                  </View>
                );
              })}
              <Button
                type="primary"
                onPress={() => router.push("/wallet/allWalletHistory")}
                className="mt-4"
              >
                <Text className="font-semibold text-white">
                  View Wallet History
                </Text>
              </Button>
            </>
          ) : (
            <View className="items-center gap-2 px-8 py-4">
              <Text className="text-center font-medium leading-6 text-gray-500">
                You have no recent payments/top ups
              </Text>
              <Text className="text-center text-4xl">😊</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </StripeProvider>
  );
}
