import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useDispatch } from "react-redux";
import { Button } from '@ant-design/react-native';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useResetPasswordMutation } from '../../redux/services/customerAuth';
import { router } from "expo-router";
import Ionicons from "@expo/vector-icons/Ionicons";

// Zod schema for validation
const resetPasswordSchema = z.object({
    email: z.string().email("Invalid email"),
    oldPassword: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(30, "Password must not exceed 30 characters"),
    newPassword: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(30, "Password must not exceed 30 characters"),
  });

// Define TypeScript types based on the schema
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
    const dispatch = useDispatch();
    const [resetPasswordMutation, { isLoading, error }] = useResetPasswordMutation();
    const [showPassword, setShowPassword] = useState(false);

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
            Alert.alert('Success', 'Password reset successful');
            reset();  // Reset the form
            router.push('/account');  // Navigate back to the account page

        } catch (err) {
            // If there is an error, handle it (error is already handled via RTK)
            console.error("Reset Password failed:", err);
        }
    };

    return (
        <ScrollView>
            <View className="flex h-screen w-screen px-8 pt-8">
                {/* ===== Email Field ===== */}
                <Text>Email</Text>
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
                <Text>Old Password</Text>
                <Controller
                    control={control}
                    name="oldPassword"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <View className="mb-4">
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

                {/* ===== Password Field ===== */}
                <Text>New Password</Text>
                <Controller
                    control={control}
                    name="newPassword"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <View className="mb-4">
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

                {/* ===== Error Message ===== */}
                {error && (
                <Text className="mb-4 text-red-500">
                    Your email or password is incorrect
                </Text>
                )}

                {/* Buttons */}
                <View className="mt-10 w-full px-10 gap-4">
                    <Button onPress={handleSubmit(onSubmit)} type="primary" loading={isLoading}>Save</Button>
                    <Button onPress={() => router.push('/account')} type="ghost">Cancel</Button>
                </View>
            </View>
        </ScrollView>
        
    );

}   