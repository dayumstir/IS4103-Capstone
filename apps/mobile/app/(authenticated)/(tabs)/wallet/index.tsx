// wallet/index.tsx
import React, { useState, useEffect, useCallback } from "react";
import { 
  ScrollView, 
  Text, 
  View, 
  TextInput, 
  Linking, 
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl
} from "react-native";
import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
import { Button } from "@ant-design/react-native";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { useCreatePaymentIntentMutation, useGetPaymentHistoryQuery } from "../../../../redux/services/paymentService";
import { useGetProfileQuery } from "../../../../redux/services/customerService";
import { useGetCustomerOutstandingInstalmentPaymentsQuery } from "../../../../redux/services/instalmentPaymentService";
import { formatCurrency } from "../../../../utils/formatCurrency";
import { format } from "date-fns";
import { STRIPE_PUBLISHABLE_KEY } from "@env";

import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Define Zod schema for validation
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
  const { data: profile, refetch } = useGetProfileQuery();
  const [createPaymentIntent] = useCreatePaymentIntentMutation();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    Promise.all([refetchPaymentHistory(), refetchInstalmentPayments()])
      .then(() => setRefreshing(false))
      .catch((error) => {
        console.error("Error refreshing data:", error);
        setRefreshing(false);
      });
  };

  // Form state
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<TopUpFormValues>({
    resolver: zodResolver(topUpSchema),
  });

  // Ensure publishable key is available
  if (!STRIPE_PUBLISHABLE_KEY) {
    console.error("Stripe publishable key is missing");
    return null;
  }

  // Fetch payment sheet parameters from backend
  const fetchPaymentSheetParams = async (amount: string) => {
    const response = await createPaymentIntent({
      amount: Number(amount),
    }).unwrap();
    const { paymentIntent, ephemeralKey, customer } = response;

    return { paymentIntent, ephemeralKey, customer };
  };

  // Initialize payment sheet
  const initializePaymentSheet = async (amount: string) => {
    const { paymentIntent, ephemeralKey, customer } =
      await fetchPaymentSheetParams(amount);

    const { error } = await initPaymentSheet({
      merchantDisplayName: "Panda Pay",
      customerId: customer,
      customerEphemeralKeySecret: ephemeralKey,
      paymentIntentClientSecret: paymentIntent,
      returnURL: "panda://stripe-redirect",
      // Additional configurations if needed
    });

    if (error) {
      throw new Error(`Error initializing payment sheet: ${error.message}`);
    }
  };

  // Open payment sheet
  const openPaymentSheet = async () => {
    console.log("Opening payment sheet...");
    const { error } = await presentPaymentSheet();

    if (error) {
      if (error.code === "Canceled") {
        // User canceled the payment
        Toast.show({
          type: "info",
          text1: "Payment canceled",
          text2: "You have canceled the payment.",
        });
      } else {
        console.error("Payment failed:", error);
        Toast.show({
          type: "error",
          text1: "Payment failed",
          text2: error.message,
        });
      }
      // Reset loading state
      setLoading(false);
    } else {
      Toast.show({
        type: "success",
        text1: "Payment successful",
      });
      // Refresh wallet balance
      refetch();
      // Refresh payment history
      refetchPaymentHistory();
      // Reset form
      reset({
        amount: '',
      });
      // Reset loading state
      setLoading(false);
    }
  };

  const handleTopUp = async (data: TopUpFormValues) => {
    const { amount } = data;

    setLoading(true);

    try {
      await initializePaymentSheet(amount);
      await openPaymentSheet();
    } catch (error: any) {
      console.error("Error topping up wallet:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message,
      });
      setLoading(false);
    }
  };

  // Handle deep links
  const handleDeepLink = useCallback(
    async (url: string | null) => {
      if (url) {
        const stripeHandled = await handleURLCallback(url);
        if (stripeHandled) {
          // The URL was handled by Stripe
          // You can perform additional actions if needed
        } else {
          // The URL was not handled by Stripe
          // Handle other deep links if your app uses them
        }
      }
    },
    [handleURLCallback],
  );

  // Listen for incoming links
  useEffect(() => {
    // Handle the case where the app is opened via a deep link
    const getUrlAsync = async () => {
      const initialUrl = await Linking.getInitialURL();
      handleDeepLink(initialUrl);
    };

    getUrlAsync();

    // Set up an event listener for incoming links
    const deepLinkListener = Linking.addEventListener(
      "url",
      (event: { url: string }) => {
        handleDeepLink(event.url);
      },
    );

    return () => deepLinkListener.remove();
  }, [handleDeepLink]);

  // Fetch payment history
  const {
    data: paymentHistory,
    isLoading: isPaymentHistoryLoading,
    refetch: refetchPaymentHistory,
  } = useGetPaymentHistoryQuery();

  // Fetch outstanding instalment payments
  const {
    data: outstandingInstalmentPayments,
    isLoading: isInstalmentPaymentsLoading,
    refetch: refetchInstalmentPayments,
  } = useGetCustomerOutstandingInstalmentPaymentsQuery();

  // Calculate total outstanding instalment payments
  const totalOutstanding =
    outstandingInstalmentPayments?.reduce(
      (sum, payment) => sum + payment.amount_due,
      0,
    ) ?? 0;

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
                
                {/* Suggested Amount Buttons */}
                <View className="mb-4 flex-row justify-between">
                  {[10, 20, 50, 100].map((suggestedAmount) => (
                    <TouchableOpacity
                      key={suggestedAmount}
                      className="flex-1 mx-1"
                      onPress={() => {
                        setValue('amount', suggestedAmount.toString());
                        handleSubmit(handleTopUp)();
                      }}
                    >
                      <View className="rounded-lg p-1 items-center justify-center border">
                        <Text className="font-semibold text-lg">
                          ${suggestedAmount}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          />
          <Button
            type="primary"
            onPress={handleSubmit(handleTopUp)}
            disabled={!STRIPE_PUBLISHABLE_KEY || loading}
            loading={loading}
          >
            <Text className="font-semibold text-white">Top Up</Text>
          </Button>
        </View>

        {/* ===== Recent Transactions ===== */}
        <View className="mx-4 mb-4 rounded-xl bg-white p-8">
          <Text className="mb-2 text-xl font-bold">Recent Transactions</Text>
          {isPaymentHistoryLoading ? (
            <View className="items-center justify-center py-4">
              <ActivityIndicator size="large" />
            </View>
          ) : paymentHistory && paymentHistory.length > 0 ? (
            <>
              {paymentHistory.map((record) => {
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
                        {/* Icon representing the transaction type */}
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
                          {format(new Date(record.payment_date), "dd MMM yyyy, hh:mm a")}
                        </Text>
                      </View>
                      <Text className={`text-base font-semibold ${amountColor}`}>
                        {amountPrefix}{formatCurrency(record.amount)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </>
          ) : (
            <View className="items-center gap-2 px-8 py-4">
              <Text className="text-center font-medium leading-6 text-gray-500">
                You have no recent transactions
              </Text>
              <Text className="text-center text-4xl">😊</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </StripeProvider>
  );
}
