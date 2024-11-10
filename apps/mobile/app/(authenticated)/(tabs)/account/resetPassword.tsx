import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useDispatch } from "react-redux";
import { Button } from "@ant-design/react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useResetPasswordMutation } from "../../../../redux/services/customerAuthService";
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";
import Toast from "react-native-toast-message";

// Zod schema for validation
export const resetPasswordSchema = z
  .object({
    oldPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(30, "Password must not exceed 30 characters"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(30, "Password must not exceed 30 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"], // Field that shows the error
  });

// Define TypeScript types based on the schema
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const dispatch = useDispatch();
  const [resetPasswordMutation, { isLoading, error }] =
    useResetPasswordMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [customErrorMessage, setCustomErrorMessage] = useState<string | null>(
    null,
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  // Form submit handler
  const onSubmit = async (data: ResetPasswordFormValues) => {
    try {
      // Call the mutation to reset the password
      const response = await resetPasswordMutation(data).unwrap();

      // If successful, show success message and navigate back
      Toast.show({
        type: "success",
        text1: "Password reset successful",
      });
      reset(); // Reset the form
      router.back(); // Navigate back to the account page
    } catch (err: any) {
      console.error(err);
      // Set the error message in local state to be displayed
      setCustomErrorMessage("An error occurred. Please try again.");
    }
  };

  return (
    <ScrollView>
      <View className="m-4 flex rounded-lg bg-white p-8">
        <Text className="mb-4 text-2xl font-bold">Reset Password</Text>

        <Text className="mb-2 font-semibold">Old Password</Text>
        <Controller
          control={control}
          name="oldPassword"
          render={({ field: { onChange, onBlur, value } }) => (
            <View className="mb-4 w-full">
              <TextInput
                className="rounded-md border border-gray-300 p-4 focus:border-blue-500"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                placeholder="Old Password"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3"
              >
                <Ionicons
                  name={showPassword ? "eye" : "eye-off"}
                  size={24}
                  color="gray"
                />
              </TouchableOpacity>
              {errors.oldPassword && (
                <Text className="mt-1 text-red-500">
                  {errors.oldPassword.message}
                </Text>
              )}
            </View>
          )}
        />

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
                placeholder="New Password"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-3"
              >
                <Ionicons
                  name={showPassword ? "eye" : "eye-off"}
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
                placeholder="Confirm New Password"
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

        {/* ===== Error Message ===== */}
        {customErrorMessage && (
          <Text className="mb-4 text-red-500">{customErrorMessage}</Text>
        )}

        {/* ===== Save and Cancel Buttons ===== */}
        <View className="mt-4 w-full gap-4">
          <Button
            onPress={handleSubmit(onSubmit)}
            type="primary"
            loading={isLoading}
            disabled={isLoading}
          >
            <Text className="font-semibold text-white">Save</Text>
          </Button>
          <Button onPress={() => router.back()} type="ghost">
            <Text className="font-semibold text-blue-500">Cancel</Text>
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
