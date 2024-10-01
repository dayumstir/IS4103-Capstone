import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Button, DatePicker } from "@ant-design/react-native";
import { Controller, useForm } from "react-hook-form";
import { format, setMonth } from "date-fns";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEditProfileMutation } from "../../../../redux/services/customer";
import { useSelector } from "react-redux";
import Toast from "react-native-toast-message";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useRouter } from "expo-router";
import { RootState } from "../../../../redux/store";

// Validation Schema using zod
const profileSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  date_of_birth: z.date(),
});

export default function EditProfile() {
  const router = useRouter();
  const [editProfile, { isLoading }] = useEditProfileMutation(); // Mutation hook for editing profile
  const [customErrorMessage, setCustomErrorMessage] = useState<string | null>(
    null,
  );
  const profile = useSelector((state: RootState) => state.customer.profile);

  // Form state management using react-hook-form
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: profile?.name ?? "",
      address: profile?.address ?? "",
      date_of_birth: profile?.date_of_birth
        ? new Date(profile.date_of_birth)
        : new Date(),
    },
    resolver: zodResolver(profileSchema),
  });

  // Form submission handler
  const onSubmit = async (data: {
    name: string;
    address: string;
    date_of_birth: Date;
  }) => {
    try {
      await editProfile(data).unwrap();

      // Show success toast
      Toast.show({
        type: "success",
        text1: "Profile updated successfully",
      });

      // Navigate back to previous screen
      router.back();
    } catch (err: any) {
      let errorMessage = "An error occurred. Please try again.";

      // Check if the error is of type FetchBaseQueryError
      if ("data" in err) {
        const fetchError = err as FetchBaseQueryError;
        if (
          fetchError.data &&
          typeof fetchError.data === "object" &&
          "error" in fetchError.data
        ) {
          errorMessage = fetchError.data.error as string;
        }
      }

      // Set the error message in local state to be displayed
      setCustomErrorMessage(errorMessage);
    }
  };

  // Cancel edit and reset form
  const handleCancel = () => {
    reset();
    router.back();
  };

  return (
    <ScrollView>
      <View className="m-4 flex rounded-lg bg-white p-8">
        <Text className="mb-4 text-2xl font-bold">Edit Profile</Text>
        
        <Text className="mb-2 font-semibold">Name</Text>
        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <View className="mb-4 w-full">
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

        <Text className="mb-2 font-semibold">Address</Text>
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

        <Text className="mb-2 font-semibold">Date of Birth</Text>
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

        {/* ===== Save and Cancel Buttons ===== */}
        <View className="mt-4 w-full gap-4">
          <Button
            type="primary"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
            disabled={isLoading}
          >
            <Text className="font-semibold text-white">Save</Text>
          </Button>
          <Button type="ghost" onPress={handleCancel}>
            <Text className="font-semibold text-blue-500">Cancel</Text>
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
