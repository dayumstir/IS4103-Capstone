// wallet/index.tsx
import React, { useState, useEffect, useCallback } from "react";
import { 
  ScrollView, 
  Text, 
  View, 
  TextInput, 
  Linking, 
  TouchableOpacity,
  ActivityIndicator 
} from "react-native";
import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
import { Button } from "@ant-design/react-native";
import Toast from "react-native-toast-message";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

import { useCreatePaymentIntentMutation } from "../../../../redux/services/paymentService";
import { useGetProfileQuery } from "../../../../redux/services/customerService";
import { useGetCustomerTransactionsQuery } from "../../../../redux/services/transactionService";
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
  const { initPaymentSheet, presentPaymentSheet, handleURLCallback } =
    useStripe();
  const [loading, setLoading] = useState(false);
  const { data: profile, refetch } = useGetProfileQuery();
  const [createPaymentIntent] = useCreatePaymentIntentMutation();

  const router = useRouter();

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


  // Fetch transactions
  const {
    data: transactions,
    isLoading: isTransactionsLoading,
    refetch: refetchTransactions,
  } = useGetCustomerTransactionsQuery("");

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
      <ScrollView>
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
                      className="flex-1 mx-1 rounded-md border border-blue-500 bg-white px-4 py-2"
                      onPress={() => setValue('amount', suggestedAmount.toString())}
                    >
                      <Text className="text-center text-blue-500 font-semibold">
                        ${suggestedAmount}
                      </Text>
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
          {isTransactionsLoading ? (
            <View className="items-center justify-center py-4">
              <ActivityIndicator size="large" />
            </View>
          ) : transactions && transactions.length > 0 ? (
            <>
              {transactions.slice(0, 3).map((transaction) => (
                <TouchableOpacity
                  key={transaction.transaction_id}
                  onPress={() => {
                    router.push(`/payments/${transaction.transaction_id}`);
                  }}
                >
                  <View className="flex-row items-center justify-between border-t border-gray-200 py-4">
                    <View className="flex-row items-center gap-4">
                      <View className="h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                        {/* TODO: Replace with merchant profile picture */}
                        <Text className="text-center font-bold text-blue-500">
                          {transaction.merchant.name.slice(0, 1).toUpperCase()}
                        </Text>
                      </View>
                      <View className="mr-4 flex-1">
                        <Text
                          className="text-base font-medium"
                          numberOfLines={1}
                          ellipsizeMode="tail"
                        >
                          {transaction.merchant.name}
                        </Text>
                        <Text className="text-sm text-gray-500">
                          {format(transaction.date_of_transaction, "dd MMM yyyy")}
                        </Text>
                      </View>
                      <Text className="text-base font-semibold text-red-600">
                        -{formatCurrency(transaction.amount)}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
              <Button
                type="primary"
                onPress={() => router.push("/payments/allTransactions")}
              >
                <Text className="font-semibold text-white">
                  View All Transactions
                </Text>
              </Button>
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
