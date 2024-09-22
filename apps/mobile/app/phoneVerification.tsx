import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, Alert } from "react-native";
import { useVerifyPhoneNumberOTPMutation, useSendPhoneNumberOTPMutation } from "../redux/services/customerAuth";
import { login } from "../redux/features/customerAuthSlice";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";

// Zod schema for validation
const phoneVerificationSchema = z.object({
    otp: z.string().min(6, "OTP must be at least 6 characters"),
});

export type PhoneVerificationFormValues = z.infer<typeof phoneVerificationSchema>;

export default function PhoneVerificationScreen() {
    const dispatch = useDispatch();
    const [verifyPhoneNumberOTPMutation, { isLoading, error }] = useVerifyPhoneNumberOTPMutation();
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

    return (
        <View style={{ flex: 1, padding: 16 }}>
            <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 16 }}>
            Verify Your Phone Number
            </Text>

            <Controller
            control={control}
            name="otp"
            render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                style={{
                    borderWidth: 1,
                    borderColor: errors.otp ? "red" : "gray",
                    padding: 12,
                    marginBottom: 16,
                }}
                placeholder="Enter OTP"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                />
            )}
            />
            {errors.otp && (
            <Text style={{ color: "red", marginBottom: 16 }}>{errors.otp.message}</Text>
            )}

            {/* Verify Button */}
            <TouchableOpacity
            onPress={handleSubmit(onSubmit)}
            style={{
                backgroundColor: "#2563eb",
                padding: 16,
                alignItems: "center",
                borderRadius: 8,
            }}
            disabled={isLoading}
            >
            <Text style={{ color: "#fff", fontWeight: "bold" }}>
                {isLoading ? "Verifying..." : "Verify OTP"}
            </Text>
            </TouchableOpacity>

            {/* Error Handling */}
            {error && <Text style={{ color: "red", marginTop: 16 }}>Invalid OTP provided</Text>}
        </View>
    );
}