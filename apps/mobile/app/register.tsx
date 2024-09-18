import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRegisterMutation } from "../redux/services/customerAuth";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useState, useRef } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { format } from "date-fns";
import BottomSheet from "@gorhom/bottom-sheet";

// Define your Zod schema
const registerSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(30, "Password must not exceed 30 characters"),
  contact_number: z.string().min(8, "Contact number must be at least 8 digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  date_of_birth: z.date(),
});

// Define TypeScript types based on the schema
export type RegisterFormValues = z.infer<typeof registerSchema>;

export default function Register() {
  const [registerMutation, { isLoading, error }] = useRegisterMutation();
  const [showPassword, setShowPassword] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const [tempDate, setTempDate] = useState<Date | null>(null);
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
      credit_tier_id: 3,
    };
    try {
      await registerMutation(registrationData).unwrap();
      router.replace("/confirmation");
      console.log("Register success:", data);
    } catch (error) {
      console.error("Register failed:", error);
    }
  };

  return (
    <ScrollView>
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
              <TouchableOpacity
                onPress={() => {
                  setTempDate(value || new Date());
                  bottomSheetRef.current?.expand();
                }}
                className="rounded-md border border-gray-300 p-4 focus:border-blue-500"
              >
                <Text>
                  {value
                    ? format(value, "dd MMMM yyyy")
                    : "Select Date of Birth"}
                </Text>
              </TouchableOpacity>
              {errors.date_of_birth && (
                <Text className="mt-1 text-red-500">
                  {errors.date_of_birth.message}
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
          <Text
            onPress={() => router.replace("/login")}
            className="text-center text-blue-500"
          >
            Login
          </Text>
        </View>

        {/* ===== Date Picker Bottom Drawer ===== */}
        <BottomSheet
          ref={bottomSheetRef}
          index={-1}
          snapPoints={[350]}
          enablePanDownToClose
        >
          <View className="flex-1 px-8 py-4">
            <Text className="text-center text-lg font-semibold">
              Select your Date of Birth
            </Text>
            <DateTimePicker
              value={tempDate || new Date()}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, selectedDate) => {
                if (selectedDate) {
                  setTempDate(selectedDate);
                }
              }}
            />
            <TouchableOpacity
              onPress={() => {
                if (tempDate) {
                  setValue("date_of_birth", tempDate);
                }
                bottomSheetRef.current?.close();
              }}
              className="mt-4 rounded bg-blue-500 p-3"
            >
              <Text className="text-center font-semibold text-white">
                Confirm
              </Text>
            </TouchableOpacity>
          </View>
        </BottomSheet>
      </View>
    </ScrollView>
  );
}
