// A screen component for the login functionality, handling email verification.

import { View, Text, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { router } from "expo-router";

export default function ConfirmationScreen() {
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
            Please click the link in the email to verify your account.
          </Text>
          <Text className="text-center text-sm leading-normal text-gray-500">
            If you don't see the email, check your spam folder.
          </Text>
        </View>

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
