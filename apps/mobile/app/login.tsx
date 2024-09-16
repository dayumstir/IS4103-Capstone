import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { useDispatch } from "react-redux";
import { login } from "../redux/features/customerAuthSlice";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoginMutation } from "../redux/services/customerAuth";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";

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
  const [loginMutation, { isLoading, error }] = useLoginMutation();
  const [showPassword, setShowPassword] = useState(false);

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
      // Delete the history to prevent user from swiping back to the login page
      router.replace("/home");
    } catch (error) {
      console.error("Login failed:", error);
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
      {error && (
        <Text className="mb-4 text-red-500">
          Your email or password is incorrect
        </Text>
      )}

      {/* ===== Login Button ===== */}
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
            Login
          </Text>
        )}
      </TouchableOpacity>

      {/* ===== Register Link ===== */}
      <View className="mt-4 flex flex-row items-center justify-center gap-2">
        <Text>Don't have an account?</Text>
        <Text
          onPress={() => router.replace("/register")}
          className="text-center text-blue-500"
        >
          Register
        </Text>
      </View>
    </View>
  );
}
