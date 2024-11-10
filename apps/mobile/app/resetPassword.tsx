import React from "react";
import { View, Text, TextInput, ScrollView } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@ant-design/react-native";
import { useResetPasswordMutation } from "../redux/services/customerAuthService";
import { router, useLocalSearchParams } from "expo-router";
import { ResetPasswordFormValues, resetPasswordSchema } from "./(authenticated)/(tabs)/account/resetPassword";

export default function ResetPasswordScreen() {
  const { oldPassword } = useLocalSearchParams<{ oldPassword: string }>(); // Pass `oldPassword` from `temporaryLogin`

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { oldPassword, newPassword: "", confirmPassword: "" },
  });

  const [resetPasswordMutation, { isLoading }] = useResetPasswordMutation();

  const handleResetPassword = async (data: ResetPasswordFormValues) => {
    try {
      await resetPasswordMutation({
        oldPassword: oldPassword as string, // Use `oldPassword` from params
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      }).unwrap();
      router.replace("/home"); // Redirect to home page on success
    } catch {
      // Handle reset failure
    }
  };

  return (
    <ScrollView>
      <View className="m-4 flex rounded-lg bg-white p-8">
        <Text className="mb-2 font-semibold">New Password</Text>
        <Controller
          control={control}
          name="newPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className="rounded-md border border-gray-300 p-4 focus:border-blue-500"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              placeholder="Enter your new password"
              secureTextEntry
            />
          )}
        />
        {errors.newPassword && (
          <Text className="mt-1 text-red-500">{errors.newPassword.message}</Text>
        )}

        <Text className="mb-2 font-semibold mt-4">Confirm Password</Text>
        <Controller
          control={control}
          name="confirmPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className="rounded-md border border-gray-300 p-4 focus:border-blue-500"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              placeholder="Confirm your password"
              secureTextEntry
            />
          )}
        />
        {errors.confirmPassword && (
          <Text className="mt-1 text-red-500">{errors.confirmPassword.message}</Text>
        )}

        <View className="mt-6">
          <Button
            onPress={handleSubmit(handleResetPassword)}
            type="primary"
            loading={isLoading}
            disabled={isLoading}
          >
            <Text className="font-semibold text-white">Reset Password</Text>
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
