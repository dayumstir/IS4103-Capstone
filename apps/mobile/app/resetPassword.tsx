// apps/mobile/app/resetPassword.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@ant-design/react-native";
import { useResetPasswordMutation } from "../redux/services/customerAuthService";
import { router, useLocalSearchParams } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import Toast from "react-native-toast-message";

// Define TypeScript types based on the schema
type ResetPasswordFormValues = {
  newPassword: string;
  confirmPassword: string;
};

export default function ResetPasswordScreen() {
  const { oldPassword } = useLocalSearchParams<{ oldPassword: string }>(); // Get `oldPassword` from params

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [customErrorMessage, setCustomErrorMessage] = useState<string | null>(
    null,
  );

  // Define password complexity regex
  const passwordComplexityRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

  // Create a schema function that uses oldPassword
  const resetPasswordSchema = z
    .object({
      newPassword: z
        .string()
        .regex(passwordComplexityRegex, {
          message:
            "Password must have at least 1 lowercase, 1 uppercase, 1 digit, 1 special character, and be at least 8 characters long",
        }),
      confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    })
    .refine((data) => data.newPassword !== oldPassword, {
      message: "New password cannot be the same as the old password",
      path: ["newPassword"],
    });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  const [resetPasswordMutation, { isLoading }] = useResetPasswordMutation();

  const handleResetPassword = async (data: ResetPasswordFormValues) => {
    try {
      await resetPasswordMutation({
        oldPassword: oldPassword as string,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      }).unwrap();

      // Show success message
      Toast.show({
        type: "success",
        text1: "Password reset successful",
      });

      // Reset form fields
      reset();

      // Navigate to home page
      router.replace("/home");
    } catch (error: any) {
      console.error(error);
      setCustomErrorMessage("An error occurred. Please try again.");
    }
  };

  return (
    <ScrollView>
      <View className="m-4 flex rounded-lg bg-white p-8">
        <Text className="mb-4 text-2xl font-bold">Reset Password</Text>

        {/* New Password Field */}
        <Text className="mb-2 font-semibold">New Password</Text>
        <Controller
          control={control}
          name="newPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <View className="mb-4 w-full">
              <TextInput
                className="rounded-md border border-gray-300 p-4 focus:border-blue-500"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                placeholder="Enter your new password"
                secureTextEntry={!showNewPassword}
              />
              <TouchableOpacity
                onPress={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-4 top-3"
              >
                <Ionicons
                  name={showNewPassword ? "eye" : "eye-off"}
                  size={24}
                  color="gray"
                />
              </TouchableOpacity>
              {errors.newPassword && (
                <Text className="mt-1 text-red-500">
                  {errors.newPassword.message}
                </Text>
              )}
            </View>
          )}
        />

        {/* Confirm New Password Field */}
        <Text className="mb-2 font-semibold">Confirm New Password</Text>
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <View className="mb-4 w-full">
              <TextInput
                className="rounded-md border border-gray-300 p-4 focus:border-blue-500"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                placeholder="Confirm your new password"
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-3"
              >
                <Ionicons
                  name={showConfirmPassword ? "eye" : "eye-off"}
                  size={24}
                  color="gray"
                />
              </TouchableOpacity>
              {errors.confirmPassword && (
                <Text className="mt-1 text-red-500">
                  {errors.confirmPassword.message}
                </Text>
              )}
            </View>
          )}
        />

        {/* Error Message */}
        {customErrorMessage && (
          <Text className="mb-4 text-red-500">{customErrorMessage}</Text>
        )}

        {/* Save Button */}
        <View className="mt-4 w-full gap-4">
          <Button
            onPress={handleSubmit(handleResetPassword)}
            type="primary"
            loading={isLoading}
            disabled={isLoading}
          >
            <Text className="font-semibold text-white">Save</Text>
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
