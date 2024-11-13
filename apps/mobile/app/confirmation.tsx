// A screen component for the login functionality, handling email verification.
import { useEffect } from "react";
import { View, Text, TextInput, Alert, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  useConfirmEmailMutation,
  useSendPhoneNumberOTPMutation,
  useResendEmailVerificationMutation,
} from "../redux/services/customerAuthService";
import { useForm, Controller } from "react-hook-form";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useNavigation } from "expo-router";
import { Button } from "@ant-design/react-native";

// Zod schema for validation
const confirmEmailSchema = z.object({
  token: z.string().min(6, "Token must be at least 6 characters"),
});

export type ConfirmEmailFormValues = z.infer<typeof confirmEmailSchema>;

export default function ConfirmationScreen() {
  const [confirmEmailMutation, { isLoading, error }] =
    useConfirmEmailMutation();
  const [sendPhoneNumberOTPMutation] = useSendPhoneNumberOTPMutation();
  const [resendEmailVerificationMutation, { isLoading: isResending }] =
    useResendEmailVerificationMutation();
  const { customer } = useSelector((state: RootState) => state.customerAuth); // Get the customer from Redux
  const navigation = useNavigation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ConfirmEmailFormValues>({
    resolver: zodResolver(confirmEmailSchema),
  });

  // Disable back navigation
  useEffect(() => {
    navigation.setOptions({
      gestureEnabled: false, // Disable swipe back gesture
      headerShown: false, // Hide header if you want to remove the back button
    });
  }, [navigation]);

  const onSubmit = async (data: ConfirmEmailFormValues) => {
    try {
      // Make the API call to confirm email
      await confirmEmailMutation(data).unwrap();

      // After email confirmation, send OTP to phone number
      if (customer?.contact_number) {
        await sendPhoneNumberOTPMutation({
          contact_number: customer.contact_number,
        }).unwrap();
      }

      // If successful, redirect to phone number OTP page
      router.replace("/phoneVerification");
    } catch (err: any) {
      // Show an alert if there's an error
      Alert.alert("Error", "The token you entered is incorrect");
    }
  };

  const handleResendEmail = async () => {
    try {
      if (customer?.email) {
        await resendEmailVerificationMutation({
          email: customer.email,
        }).unwrap();
        Alert.alert("Success", "A new confirmation email has been sent.");
      }
    } catch (err) {
      Alert.alert("Error", "Failed to resend the confirmation email.");
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-blue-400 px-8">
      <View className="flex w-full flex-col gap-8 rounded-lg bg-white p-8 shadow-md">
        <View className="flex items-center gap-2">
          <MaterialCommunityIcons
            name="email-check-outline"
            size={60}
            color="#3b82f6"
          />
          <Text className="text-center text-2xl font-bold">
            Check Your Email
          </Text>
        </View>

        <View className="flex gap-4">
          <Text className="text-center leading-normal text-gray-800">
            We've sent a confirmation email to your registered email address.
            Please type in the number in the email to verify your account.
          </Text>
          <Text className="text-center text-sm leading-normal text-gray-500">
            If you don't see the email, check your spam folder.
          </Text>
        </View>

        <Controller
          control={control}
          name="token"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className="rounded-md border border-gray-300 p-4 focus:border-blue-500"
              placeholder="Enter Verification Code"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
            />
          )}
        />
        {errors.token && (
          <Text className="mt-1 text-red-500">{errors.token.message}</Text>
        )}

        {/* ===== Error Message ===== */}
        {error && (
          <Text className="mb-4 text-red-500">
            Your email token is incorrect
          </Text>
        )}

        {/* ===== Button Group ===== */}
        <View className="flex gap-4">
          <Button
            type="primary"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            disabled={isLoading}
          >
            <Text className="text-center font-semibold uppercase text-white">
              Verify Email
            </Text>
          </Button>

          <Button
            type="ghost"
            onPress={handleResendEmail}
            loading={isResending}
            disabled={isResending}
          >
            <Text className="text-center font-semibold text-blue-500">
              Resend Confirmation Email
            </Text>
          </Button>

          <TouchableOpacity onPress={() => router.replace("/register")}>
            <Text className="text-center font-semibold">Back to Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
