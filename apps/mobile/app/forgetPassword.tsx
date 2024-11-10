import React from "react";
import { View, Text, TextInput, ScrollView } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@ant-design/react-native";
import { useForgetPasswordMutation } from "../redux/services/customerAuthService";
import Toast from "react-native-toast-message";

// Define the Zod schema for email validation
const forgetPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});
  
// Define TypeScript types based on the schema
export type ForgetPasswordFormValues = z.infer<typeof forgetPasswordSchema>;

export default function ForgetPasswordScreen() {
    const {
      control,
      handleSubmit,
      formState: { errors },
      reset,
    } = useForm<ForgetPasswordFormValues>({
      resolver: zodResolver(forgetPasswordSchema),
      defaultValues: { email: "" },
    });
  
    const [forgetPasswordMutation, { isLoading }] = useForgetPasswordMutation();
  
    const onSubmit = async (data: ForgetPasswordFormValues) => {
      try {
        await forgetPasswordMutation({ email: data.email }).unwrap();
        Toast.show({
          type: "success",
          text1: "An email has been sent to reset your password.",
        });
        reset(); // Reset the form after successful submission
      } catch (error) {
        Toast.show({
          type: "error",
          text1: "Invalid username or password. Please try again.",
        });
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
                autoCapitalize="none"
                keyboardType="email-address"
              />
            )}
          />
          {errors.email && (
            <Text className="mt-1 text-red-500">{errors.email.message}</Text>
          )}
  
          <View className="mt-6">
            <Button
              onPress={handleSubmit(onSubmit)}
              type="primary"
              loading={isLoading}
              disabled={isLoading}
            >
              <Text className="font-semibold text-white">Send Email</Text>
            </Button>
          </View>
        </View>
      </ScrollView>
    );
  }
  