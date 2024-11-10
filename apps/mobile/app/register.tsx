// A register screen component

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useDispatch } from "react-redux";
import { useRegisterMutation } from "../redux/services/customerAuthService";
import { setCustomer } from "../redux/features/customerAuthSlice";
import { useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import { format, setMonth } from "date-fns";
import { Button, DatePicker } from "@ant-design/react-native";

// Define your Zod schema
const registerSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(30, "Password must not exceed 30 characters"),
  contact_number: z
    .string()
    .regex(
      /^\+\d{1,3}\d{6,14}$/,
      "Phone number must follow the format +[country code][number] (e.g., +1234567890)",
    ),
  address: z.string().min(5, "Address must be at least 5 characters"),
  date_of_birth: z.date(),
});

// Define TypeScript types based on the schema
export type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const dispatch = useDispatch();
  const [registerMutation, { isLoading, error }] = useRegisterMutation();
  const [showPassword, setShowPassword] = useState(false);
  const [customErrorMessage, setCustomErrorMessage] = useState<string | null>(
    null,
  );
  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  // Form submit handler
  const onSubmit = async (data: RegisterFormValues) => {
    // TODO: Use default profile picture and credit score
    const registrationData = {
      ...data,
      profile_picture: "Picture of Green",
      status: "Active",
      credit_score: 3,
    };
    try {
      const result = await registerMutation(registrationData).unwrap();

      // Sore customer data in redux
      dispatch(setCustomer(result))

      router.replace("/confirmation");
    } catch (err: any) {
      console.error(err);
      // Set the error message in local state to be displayed
      setCustomErrorMessage("An error occurred. Please try again.");
    }
  };

  return (
    <ScrollView>
      <View className="flex h-full px-8 pb-8">
        {/* ===== Logo & Title===== */}
        <View className="flex flex-col items-center justify-center gap-2 py-16">
          <Image
            source={require("../assets/pandapay_logo.png")}
            className="h-32 w-32"
          />
          <Text className="text-3xl font-semibold">PandaPay</Text>
          <Text className="">Your ultimate BNPL solution</Text>
        </View>

        {/* ===== Name Field ===== */}
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <View className="mb-4">
              <TextInput
                className="rounded-md border border-gray-300 p-4 focus:border-blue-500"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                placeholder="Name"
              />
              {errors.name && (
                <Text className="mt-1 text-red-500">{errors.name.message}</Text>
              )}
            </View>
          )}
        />

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
                <Text className="mt-1 text-red-500">
                  {errors.email.message}
                </Text>
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

        {/* ===== Contact Number Field ===== */}
        <Controller
          control={control}
          name="contact_number"
          render={({ field: { onChange, onBlur, value } }) => (
            <View className="mb-4">
              <TextInput
                className="rounded-md border border-gray-300 p-4 focus:border-blue-500"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                placeholder="Contact Number"
                keyboardType="phone-pad"
              />
              {errors.contact_number && (
                <Text className="mt-1 text-red-500">
                  {errors.contact_number.message}
                </Text>
              )}
            </View>
          )}
        />

        {/* ===== Address Field ===== */}
        <Controller
          control={control}
          name="address"
          render={({ field: { onChange, onBlur, value } }) => (
            <View className="mb-4">
              <TextInput
                className="rounded-md border border-gray-300 p-4 focus:border-blue-500"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                placeholder="Address"
                multiline
              />
              {errors.address && (
                <Text className="mt-1 text-red-500">
                  {errors.address.message}
                </Text>
              )}
            </View>
          )}
        />

        {/* ===== Date of Birth Field ===== */}
        <Controller
          control={control}
          name="date_of_birth"
          render={({ field: { onChange, value } }) => (
            <View className="mb-4">
              <DatePicker
                value={value ? new Date(value) : new Date()}
                minDate={new Date(1900, 0, 1)}
                maxDate={new Date()}
                onChange={(date) => {
                  if (date) {
                    onChange(date);
                  }
                }}
                okText="Confirm"
                dismissText="Cancel"
                format="DD MMMM YYYY"
                renderLabel={(type, data) => {
                  if (type === "month") {
                    const date = setMonth(new Date(2000, 0, 1), data - 1);
                    return <Text>{format(date, "MMMM")}</Text>;
                  } else {
                    return data;
                  }
                }}
              >
                <TouchableOpacity className="rounded-md border border-gray-300 p-4 focus:border-blue-500">
                  <Text>
                    {value
                      ? format(new Date(value), "dd MMMM yyyy")
                      : "Select Date of Birth"}
                  </Text>
                </TouchableOpacity>
              </DatePicker>
              {errors.date_of_birth && (
                <Text className="mt-1 text-red-500">
                  {errors.date_of_birth.message}
                </Text>
              )}
            </View>
          )}
        />

        {/* ===== Error Message ===== */}
        {customErrorMessage && (
          <Text className="mb-4 text-red-500">{customErrorMessage}</Text>
        )}

        {/* ===== Register Button ===== */}
        <Button
          type="primary"
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
          disabled={isLoading}
        >
          <Text className="font-semibold uppercase text-white">Register</Text>
        </Button>

        {/* ===== Login Link ===== */}
        <View className="mt-4 flex flex-row items-center justify-center gap-1">
          <Text>Already have an account?</Text>
          <Text
            onPress={() => router.replace("/login")}
            className="font-semibold text-blue-500"
          >
            Login
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
