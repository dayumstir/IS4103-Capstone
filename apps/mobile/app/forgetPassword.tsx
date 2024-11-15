// apps/mobile/app/forgetPassword.tsx
import React, { useState } from "react";
import { View, Text, TextInput, ScrollView } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@ant-design/react-native";
import { useForgetPasswordMutation } from "../redux/services/customerAuthService";
import Toast from "react-native-toast-message";

// Zod schema for validation
const forgetPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export type ForgetPasswordFormValues = z.infer<typeof forgetPasswordSchema>;

export default function ForgetPasswordScreen() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const {
    control,
    handleSubmit,
    resetField, // Destructure resetField here
    formState: { errors },
  } = useForm<ForgetPasswordFormValues>({
    resolver: zodResolver(forgetPasswordSchema),
    defaultValues: { email: "" },
  });

  const [forgetPasswordMutation] = useForgetPasswordMutation();

  const handleForgetPassword = async (data: ForgetPasswordFormValues) => {
    setIsSubmitting(true); // Start loading state
    const MIN_LOADING_DURATION = 2000; // Minimum loading duration in milliseconds
    const startTime = Date.now();

    try {
      await forgetPasswordMutation({ email: data.email }).unwrap();
    } catch {
      // Handle silently to keep consistent messaging
    } finally {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = MIN_LOADING_DURATION - elapsedTime;

      // Ensure the loading state lasts at least MIN_LOADING_DURATION
      setTimeout(() => {
        setIsSubmitting(false); // End loading state after minimum duration

        // Display toast notification with consistent message
        Toast.show({
          type: "success",
          text1: "A new password has been sent to your email.",
          text2: "Please check your inbox.",
        });

        // Reset the form fields
        handleReset();
      }, remainingTime > 0 ? remainingTime : 0);
    }
  };

  const handleReset = () => {
    // Reset form fields
    resetField("email"); // Use resetField method
  };

  return (
    <ScrollView>
      <View className="m-4 flex rounded-lg bg-white p-8">
        {/* Instructional Text */}
        <Text className="mb-4 text-base text-gray-700">
          Please enter your email address below. If it exists in our system, we will send you a new password.
        </Text>

        {/* Email Input */}
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
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            <Text className="font-semibold text-white">Send Email</Text>
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
