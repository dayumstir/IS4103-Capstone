// apps/mobile/app/login.tsx
import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
} from "react-native";
import { useDispatch } from "react-redux";
import { login } from "../redux/features/customerAuthSlice";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoginMutation } from "../redux/services/customerAuthService";
import Ionicons from "@expo/vector-icons/Ionicons";
import { Button } from "@ant-design/react-native";
import Toast from "react-native-toast-message";

// Define your Zod schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(30, "Password must not exceed 30 characters"),
});

// Define TypeScript types based on the schema
export type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const dispatch = useDispatch();
  const [loginMutation, { isLoading }] = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [customErrorMessage, setCustomErrorMessage] = useState<string | null>(
    null,
  );

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  // Form submit handler
  const onSubmit = async (data: LoginFormValues) => {
    try {
      const result = await loginMutation(data).unwrap();
      dispatch(login(result));

      if (result.forgot_password) {
        Toast.show({
          type: "info",
          text1: "Login successful",
          text2: "Please reset your password",
        });

        router.replace({
          pathname: "/resetPassword",
          params: { oldPassword: data.password },
        });
      } else {
        // Navigate to home page
        router.replace("/home");
      }
    } catch (err: any) {
      console.error(err);
      // Set the error message in local state to be displayed
      setCustomErrorMessage("Invalid email or password. Please try again.");
    }
  };

  return (
    <View className="flex h-full px-8">
      {/* ===== Logo & Title===== */}
      <View className="flex flex-col items-center justify-center gap-2 py-16">
        <Image
          source={require("../assets/pandapay_logo.png")}
          className="h-32 w-32"
        />
        <Text className="text-3xl font-semibold">PandaPay</Text>
        <Text className="">Your ultimate BNPL solution</Text>
      </View>

      {/* ===== Email Field ===== */}
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <View className="mb-4">
            <TextInput
              className="rounded-md border border-gray-300 p-4 focus:border-blue-500"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              placeholder="Email"
              autoCapitalize="none"
              keyboardType="email-address"
            />
            {errors.email && (
              <Text className="mt-1 text-red-500">{errors.email.message}</Text>
            )}
          </View>
        )}
      />

      {/* ===== Password Field ===== */}
      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <View className="mb-4">
            <TextInput
              className="rounded-md border border-gray-300 p-4 focus:border-blue-500"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              placeholder="Password"
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
            {errors.password && (
              <Text className="mt-1 text-red-500">
                {errors.password.message}
              </Text>
            )}
          </View>
        )}
      />

      {/* ===== Error Message ===== */}
      {customErrorMessage && (
        <Text className="mb-4 text-red-500">{customErrorMessage}</Text>
      )}

      {/* ===== Login Button ===== */}
      <Button
        type="primary"
        onPress={handleSubmit(onSubmit)}
        loading={isLoading}
        disabled={isLoading}
      >
        <Text className="font-semibold uppercase text-white">Login</Text>
      </Button>

      {/* ===== Register Link ===== */}
      <View className="mt-4 flex flex-row items-center justify-center gap-1">
        <Text>Don't have an account?</Text>
        <Text
          onPress={() => router.replace("/register")}
          className="font-semibold text-blue-500"
        >
          Register
        </Text>
      </View>

      <View className="mt-2 flex flex-row items-center justify-center gap-1">
        <TouchableOpacity
          onPress={() => router.push("/forgetPassword")}
          className="mt-4"
        >
          <Text className="text-blue-500 underline">Forgot Password?</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
