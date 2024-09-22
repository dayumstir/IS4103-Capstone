import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useVerifyPhoneNumberOTPMutation, useSendPhoneNumberOTPMutation } from "../redux/services/customerAuth";
import { login } from "../redux/features/customerAuthSlice";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { router, useNavigation } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";

// Zod schema for validation
const phoneVerificationSchema = z.object({
    otp: z.string().min(6, "OTP must be at least 6 characters"),
});

export type PhoneVerificationFormValues = z.infer<typeof phoneVerificationSchema>;

export default function PhoneVerificationScreen() {
    const dispatch = useDispatch();
    const [verifyPhoneNumberOTPMutation, { isLoading, error }] = useVerifyPhoneNumberOTPMutation();
    const navigation = useNavigation();  // Get navigation object
    const { customer } = useSelector((state: RootState) => state.customerAuth); // Get the customer from Redux
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<PhoneVerificationFormValues>({
        resolver: zodResolver(phoneVerificationSchema),
    });

    const onSubmit = async (data: PhoneVerificationFormValues) => {
        try {
          const result = await verifyPhoneNumberOTPMutation({ otp: data.otp }).unwrap();
          Alert.alert("Success", "Phone number verified successfully!");
          dispatch(login(result));
          router.push("/home"); // Redirect to home page after successful OTP verification
        } catch (err) {
          Alert.alert("Error", "The OTP you entered is incorrect");
        }
    };

    // Disable swipe back and back button
    useEffect(() => {
        navigation.setOptions({
        gestureEnabled: false,  // Disable swipe back gesture
        headerShown: false,     // Hide the back button
        });
    }, [navigation]);

    return (
        <View className="flex-1 items-center justify-center bg-blue-400 px-8">
            <View className="flex w-full flex-col gap-8 rounded-lg bg-white p-8 shadow-md">
                <View className="flex items-center gap-2">
                    <MaterialCommunityIcons
                        name="cellphone-check"
                        size={60}
                        color="#2563eb"
                    />
                    <Text className="text-center text-2xl font-bold">
                        Check Your Phone
                    </Text>
                </View>

                <View className="flex gap-4">
                    <Text className="text-center leading-normal text-gray-800">
                        We've sent an SMS to your registered contact number.
                        Please type in the OTP in the SMS to verify your contact number.
                    </Text>
                </View>

                <Controller
                    control={control}
                    name="otp"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            className="rounded-md border border-gray-300 p-4 focus:border-blue-500"
                            placeholder="Enter OTP"
                            onChangeText={onChange}
                            onBlur={onBlur}
                            value={value}
                        />
                    )}
                />
                {errors.otp && (
                    <Text className="mt-1 text-red-500">{errors.otp.message}</Text>
                )}

                {/* Verify Button */}
                <TouchableOpacity
                    onPress={handleSubmit(onSubmit)}
                    className="rounded-md bg-blue-500 py-4"
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
                        Verify Phone Number
                        </Text>
                    )}
                </TouchableOpacity>

                {/* Error Handling */}
                {error && <Text className="mt-1 text-red-500">Invalid OTP provided</Text>}
            </View>
        </View>
    );
}