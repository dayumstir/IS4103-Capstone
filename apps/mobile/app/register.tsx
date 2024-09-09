import React from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { useDispatch } from "react-redux";
import { login } from "../redux/features/authSlice";
import { Link } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLoginMutation } from "../redux/services/auth";
import AntDesign from "@expo/vector-icons/AntDesign";

// Define your Zod schema
const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(30, "Password must not exceed 30 characters"),
});

// Define TypeScript types based on the schema
export type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const dispatch = useDispatch();
  const [loginMutation, { isLoading, error }] = useLoginMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  // Form submit handler
  const onSubmit = async (data: RegisterFormValues) => {
    const result = await loginMutation(data);
    if (result.data) {
      dispatch(login());
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
              className="rounded-md border border-gray-300 p-4"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              placeholder="Email"
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
              className="rounded-md border border-gray-300 p-4"
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              placeholder="Password"
              secureTextEntry
            />
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

      {/* ===== Register Button ===== */}
      <TouchableOpacity
        onPress={handleSubmit(onSubmit)}
        className="rounded-md bg-blue-500 py-4"
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
            Register
          </Text>
        )}
      </TouchableOpacity>

      {/* ===== Login Link ===== */}
      <View className="mt-4 flex flex-row items-center justify-center gap-2">
        <Text>Already have an account?</Text>
        <Link href="/login" className="text-center text-blue-500">
          Login
        </Link>
      </View>
    </View>
  );
}
