import { useState, useEffect } from 'react';
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';
import { ScrollView, Text, View, TextInput } from "react-native";
import { Button } from '@ant-design/react-native';
import Toast from "react-native-toast-message";

import { useCreatePaymentIntentMutation } from '../../../redux/services/paymentService';
import { useGetProfileQuery } from '../../../redux/services/customerService';
import { STRIPE_PUBLISHABLE_KEY } from '@env';

export default function WalletPage() {
  const [publishableKey, setPublishableKey] = useState('');
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  const [createPaymentIntent] = useCreatePaymentIntentMutation();

  const [amount, setAmount] = useState('');
  const { data: profile, refetch } = useGetProfileQuery();

  // Fetch publishable key from environment variables on component mount
  useEffect(() => {
    const fetchPublishableKey = async () => {
      const key = STRIPE_PUBLISHABLE_KEY;
  
      if (!key) {
        Toast.show({
          type: 'error',
          text1: 'Publishable key not found',
        });
        return;
      }
  
      setPublishableKey(key);
    };

    fetchPublishableKey();
  }, []);

  // Fetch payment sheet parameters from backend
  const fetchPaymentSheetParams = async () => {
    try {
      const response = await createPaymentIntent({ amount: Number(amount) }).unwrap();
      const { paymentIntent, ephemeralKey, customer } = response;
      
      return { 
        paymentIntent, 
        ephemeralKey, 
        customer, 
      };
    } catch (error) {
      console.error('Error fetching payment sheet parameters:', error);
      Toast.show({
        type: 'error',
        text1: 'Failed to fetch payment sheet parameters',
      });
      throw error;
    }
  };

  // Initialize payment sheet
  const initializePaymentSheet = async () => {
    try {
      const { paymentIntent, ephemeralKey, customer } = await fetchPaymentSheetParams();

      const { error } = await initPaymentSheet({ 
        merchantDisplayName: 'Panda Pay',
        customerId: customer,
        customerEphemeralKeySecret: ephemeralKey,
        paymentIntentClientSecret: paymentIntent,
        // applePay: {
        //   merchantCountryCode: 'SG',
        // },
        // googlePay: {
        //   merchantCountryCode: 'SG',
        //   testEnv: true,
        // }
      });

      if (!error) {
        setLoading(true);
      } else {
        console.error('Error initializing payment sheet:', error);
        Toast.show({
          type: 'error',
          text1: 'Error initializing payment sheet',
        });
        setLoading(false);
        throw error;
      }
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  // Open payment sheet
  const openPaymentSheet = async () => {
    const { error } = await presentPaymentSheet();

    if (error) {
      console.error('Payment failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Payment failed',
        text2: error.message,
      });
      setLoading(false);
    } else {
      Toast.show({
        type: 'success',
        text1: 'Payment successful',
      });
      // Refresh wallet balance
      refetch();
      // Reset state
      setAmount('');
      setLoading(false);
    }
  };

  const handleTopUp = async() => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      Toast.show({
        type: 'error',
        text1: 'Please enter a valid amount',
      });
      return;
    }
    try {
      await initializePaymentSheet();
      await openPaymentSheet();
    } catch (error) {
      console.error('Error topping up wallet:', error);
      Toast.show({
        type: 'error',
        text1: 'Error topping up wallet',
      });
    }
  };

  return (
    <StripeProvider publishableKey={publishableKey}>
      <ScrollView>
        <View className="mx-4 flex gap-4 rounded-lg bg-white p-8">
          <Text className="mb-4 text-2xl font-bold">Wallet Details</Text>
          <Text className="text-lg">
            Current Balance: ${profile?.wallet_balance.toFixed(2)}
          </Text>

          <TextInput
            className="rounded-md border border-gray-300 p-4 focus:border-blue-500"
            onChangeText={setAmount}
            value={amount}
            placeholder="Enter amount to top up"
          />

          <Button type="primary" onPress={handleTopUp} disabled={!publishableKey || loading} loading={loading}>
            Top Up
          </Button>

        </View>
      </ScrollView>
    </StripeProvider>
  );
}
