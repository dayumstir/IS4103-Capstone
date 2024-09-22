// A screen component for the login functionality, handling email verification.

import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useConfirmEmailMutation } from "../redux/services/customerAuth";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";

// Zod schema for validation
const confirmEmailSchema = z.object({
  token: z.string().min(6, "Token must be at least 6 characters"),
});

export type ConfirmEmailFormValues = z.infer<typeof confirmEmailSchema>;

export default function ConfirmationScreen() {
  const [confirmEmailMutation, { isLoading, error }] = useConfirmEmailMutation();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ConfirmEmailFormValues>({
    resolver: zodResolver(confirmEmailSchema),
  });

  const onSubmit = async (data: ConfirmEmailFormValues) => {
    try {
      // Make the API call to confirm email
      await confirmEmailMutation(data).unwrap();

      // If successful, redirect to phone number OTP page
      router.push("/phoneVerification");
    } catch (err) {
      // Show an alert if there's an error
      Alert.alert("Error", "The token you entered is incorrect");
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-blue-400 px-8">
      <View className="flex w-full flex-col gap-8 rounded-lg bg-white p-8 shadow-md">
        <View className="flex items-center gap-2">
          <MaterialCommunityIcons
            name="email-check-outline"
            size={60}
            color="#2563eb"
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

        {/* Save Button */}
        <TouchableOpacity
          className="rounded-md bg-blue-500 py-4"
          onPress={handleSubmit(onSubmit)}
          disabled={isLoading}
        >
          {isLoading ? (
            <AntDesign
              name="loading1"
              size={17}
              color="#fff"
              className="mx-auto animate-spin"
            />
          ) : (
            <Text className="text-center font-semibold uppercase text-white">
              Verify Email
            </Text>
          )}
        </TouchableOpacity>

        <View className="flex gap-4">
          <TouchableOpacity className="w-full rounded-md bg-blue-600 p-3">
            <Text className="text-center font-semibold text-white">
              Resend Confirmation Email
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.replace("/login")}>
            <Text className="text-center font-semibold text-blue-600">
              Back to Login
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
