import React, { useState } from "react";
import { View, Text, TextInput, ScrollView } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@ant-design/react-native";
import { useForgetPasswordMutation } from "../redux/services/customerAuthService";
import { router } from "expo-router";

// Zod schema for validation
const forgetPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export type ForgetPasswordFormValues = z.infer<typeof forgetPasswordSchema>;

export default function ForgetPasswordScreen() {
  const [notification, setNotification] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgetPasswordFormValues>({
    resolver: zodResolver(forgetPasswordSchema),
    defaultValues: { email: "" },
  });

  const [forgetPasswordMutation, { isLoading }] = useForgetPasswordMutation();

  const handleForgetPassword = async (data: ForgetPasswordFormValues) => {
    try {
      await forgetPasswordMutation({ email: data.email }).unwrap();
      setNotification("Temporary password sent to your email.");
      router.replace({
        pathname: "/temporaryLogin",
        params: { email: data.email }, // Pass email to the next screen
      });
    } catch {
      setNotification("The provided email does not exist. Please try again.");
    }
  };

  return (
    <ScrollView>
      <View className="m-4 flex rounded-lg bg-white p-8">
        <Text className="mb-2 font-semibold">Email</Text>
        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className="rounded-md border border-gray-300 p-4 focus:border-blue-500"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          )}
        />
        {errors.email && (
          <Text className="mt-1 text-red-500">{errors.email.message}</Text>
        )}

        <View className="mt-6">
          <Button
            onPress={handleSubmit(handleForgetPassword)}
            type="primary"
            loading={isLoading}
            disabled={isLoading}
          >
            <Text className="font-semibold text-white">Send Email</Text>
          </Button>
        </View>

        {notification && (
          <Text className="mt-4 text-center text-green-500">{notification}</Text>
        )}
      </View>
    </ScrollView>
  );
}
