import React, { useState } from "react";
import { View, Text, TextInput, ScrollView } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@ant-design/react-native";
import { useLoginMutation } from "../redux/services/customerAuthService";
import { router, useLocalSearchParams } from "expo-router";
import { useDispatch } from "react-redux";
import { login } from "../redux/features/customerAuthSlice";

// Zod schema for validation
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

export default function TemporaryLoginScreen() {
  const dispatch = useDispatch();
  const { email } = useLocalSearchParams<{ email: string }>(); // Pre-fill email from previous screen
  const [notification, setNotification] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: email || "", password: "" },
  });

  const [loginMutation, { isLoading }] = useLoginMutation();

  const handleLogin = async (data: LoginFormValues) => {
    try {
      const result = await loginMutation(data).unwrap();
      dispatch(login(result));
      setNotification("Login successful. Please reset your password.");
      router.replace({
        pathname: "/resetPassword",
        params: { oldPassword: data.password },
      });
    } catch {
      setNotification("Invalid email or temporary password. Please try again.");
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
            />
          )}
        />
        {errors.email && (
          <Text className="mt-1 text-red-500">{errors.email.message}</Text>
        )}

        <Text className="mb-2 font-semibold mt-4">Temporary Password</Text>
        <Controller
          control={control}
          name="password"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              className="rounded-md border border-gray-300 p-4 focus:border-blue-500"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              placeholder="Enter your password"
              secureTextEntry
            />
          )}
        />
        {errors.password && (
          <Text className="mt-1 text-red-500">{errors.password.message}</Text>
        )}

        <View className="mt-6">
          <Button
            onPress={handleSubmit(handleLogin)}
            type="primary"
            loading={isLoading}
            disabled={isLoading}
          >
            <Text className="font-semibold text-white">Login</Text>
          </Button>
        </View>

        {notification && (
          <Text className="mt-4 text-center text-green-500">{notification}</Text>
        )}
      </View>
    </ScrollView>
  );
}
