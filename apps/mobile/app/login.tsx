import React from "react";
import { View, Text, TextInput, TouchableOpacity, Image } from "react-native";
import { useDispatch } from "react-redux";
import { login } from "../redux/features/authSlice";
import { Link } from "expo-router";
// import { Button } from "@ant-design/react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Define your Zod schema
const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(30, "Password must not exceed 30 characters"),
});

// Define TypeScript types based on the schema
type FormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const dispatch = useDispatch();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(loginSchema),
  });

  // Form submit handler
  const onSubmit = (data: FormValues) => {
    console.log(data);
    dispatch(login());
  };

  return (
    <View className="flex h-full px-8">
      <View className="flex flex-col items-center justify-center gap-2 py-16">
        <Image
          source={require("../assets/pandapay_logo.png")}
          className="h-32 w-32"
        />
        <Text className="text-3xl font-semibold">PandaPay</Text>
        <Text className="">Your ultimate BNPL solution</Text>
      </View>

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
      <TouchableOpacity
        onPress={handleSubmit(onSubmit)}
        className="rounded-md bg-blue-500 py-4"
      >
        <Text className="text-center font-semibold uppercase text-white">
          Login
        </Text>
      </TouchableOpacity>

      <View className="mt-4 flex flex-row items-center justify-center gap-2">
        <Text>Don't have an account?</Text>
        <Link href="/register" className="text-center text-blue-500">
          Register
        </Link>
      </View>
    </View>
  );
}
