import { useState, useEffect, useCallback } from "react";
import { ScrollView, Text, View, TextInput, Linking } from "react-native";
import { StripeProvider, useStripe } from "@stripe/stripe-react-native";
import { Button } from "@ant-design/react-native";
import Toast from "react-native-toast-message";

import { useCreatePaymentIntentMutation } from "../../../redux/services/paymentService";
import { useGetProfileQuery } from "../../../redux/services/customerService";
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

  const {
    control,
    handleSubmit,
    reset,
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
      reset();
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

  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <ScrollView>
        <View className="m-4 flex gap-4 rounded-lg bg-white p-8">
          <Text className="mb-4 text-2xl font-bold">Wallet Details</Text>
          <Text className="text-lg">
            Current Balance: ${profile?.wallet_balance.toFixed(2)}
          </Text>

          <Text className="mb-2 font-semibold">Amount</Text>
          <Controller
            control={control}
            name="amount"
            render={({ field: { onChange, onBlur, value } }) => (
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
      </ScrollView>
    </StripeProvider>
  );
}
