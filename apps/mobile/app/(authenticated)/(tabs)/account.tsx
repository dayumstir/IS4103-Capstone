import React, { useEffect, useState } from "react";
import { Buffer } from "buffer";
import {
  Text,
  View,
  Image,
  Linking,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert
} from "react-native";
import { Button, DatePicker, Toast } from "@ant-design/react-native";
import { useDispatch } from "react-redux";
import {
  useGetProfileQuery,
  useEditProfileMutation,
} from "../../../redux/services/customer";
import { setProfile } from "../../../redux/features/customerSlice";
import { logout } from "../../../redux/features/customerAuthSlice";
import { router, useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from "dayjs";
import { format, setMonth } from "date-fns";
import AntDesign from "@expo/vector-icons/AntDesign";
import { FetchBaseQueryError } from '@reduxjs/toolkit/query';

// Validation Schema using zod
const profileSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  date_of_birth: z.string().refine(
    (date) => {
      const parsedDate = dayjs(date, "YYYY-MM-DD", true);
      return parsedDate.isValid();
    },
    { message: "Invalid date format" },
  ),
});

export default function AccountPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [customErrorMessage, setCustomErrorMessage] = useState<string | null>(null);

  // Fetch the profile using the API call
  const { data: profile, error, isLoading, refetch } = useGetProfileQuery();

  // Form state management using react-hook-form
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      address: "",
      date_of_birth: "",
    },
    resolver: zodResolver(profileSchema),
  });

  // Local state management
  const [isEditing, setIsEditing] = useState(false); // Toggles between view and edit mode
  const [editProfile] = useEditProfileMutation(); // Mutation hook for editing profile

  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name,
        address: profile.address,
        date_of_birth: dayjs(profile.date_of_birth).format("YYYY-MM-DD"),
      });
      dispatch(setProfile(profile));
    }
  }, [profile, reset]);

  // Logout handler
  const handleLogout = () => {
    dispatch(logout());
    router.replace("/login");
  };

  // Toggle edit mode
  const handleEditToggle = () => {
    setIsEditing(true);
  };

  // Cancel edit and reset form
  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  // Form submission handler
  const onSubmit = async (data: any) => {
    try {
      const updatedProfileData = {
        ...data,
        date_of_birth: dayjs(data.date_of_birth).toISOString(), // Convert date to ISO format
      };
      const updatedProfile = await editProfile(updatedProfileData).unwrap();

      // Refetch the latest profile information
      refetch();

      // Update Redux state and reset form with new profile data
      dispatch(setProfile(updatedProfile));
      reset({
        name: updatedProfile.name,
        address: updatedProfile.address,
        date_of_birth: dayjs(updatedProfile.date_of_birth).format("YYYY-MM-DD"),
      });

      Alert.alert("Success", "Profile updated successfully");
      // Toast.success({
      //   content: "Profile updated successfully",
      //   duration: 1,
      // });
      setIsEditing(false); // Exit edit mode
    } catch (err: any) {
      // console.error("Failed to update profile:", error);

      let errorMessage = "An error occurred. Please try again.";

      // Check if the error is of type FetchBaseQueryError
      if ('data' in err) {
          const fetchError = err as FetchBaseQueryError;
          if (fetchError.data && typeof fetchError.data === 'object' && 'error' in fetchError.data) {
              errorMessage = fetchError.data.error as string;
          }
      }

      // Set the error message in local state to be displayed
      setCustomErrorMessage(errorMessage);
    }
  };

  return (
    <ScrollView>
      <View className="flex h-screen w-screen items-center px-8 pt-8">
        {profile && (
          <>
            {!isEditing && (
              <>
                <Image
                  source={{ uri: `data:image/png;base64,${Buffer.from(profile.profile_picture).toString("base64")}` }}
                  style={{height: 100, width: 100}}
                />
                <Text className="mb-1 text-lg font-semibold text-gray-800">
                  My Credit Rating
                </Text>
                <Text className="mb-2 text-4xl font-bold text-black">
                  {profile.credit_score}
                </Text>
                <Text
                  className="text-blue-500 underline"
                  onPress={() =>
                    Linking.openURL("https://example.com/what-does-this-mean")
                  }
                >
                  What does this mean?
                </Text>
              </>
            )}

            <View className="mt-5 w-full px-6">
              {!isEditing ? (
                <>
                  <View className="mt-5 flex w-full gap-4 px-6">
                    <View>
                      <Text className="mb-1 text-gray-600">Name</Text>
                      <Text className="text-lg">{profile.name}</Text>
                    </View>
                    <View>
                      <Text className="mb-1 text-gray-600">Email</Text>
                      <Text className="text-lg">{profile.email}</Text>
                    </View>
                    <View>
                      <Text className="mb-1 text-gray-600">Contact Number</Text>
                      <Text className="text-lg">{profile.contact_number}</Text>
                    </View>
                    <View>
                      <Text className="mb-1 text-gray-600">Address</Text>
                      <Text className="text-lg">{profile.address}</Text>
                    </View>
                    <View>
                      <Text className="mb-1 text-gray-600">Date of Birth</Text>
                      <Text className="text-lg">
                        {dayjs(profile.date_of_birth).format("DD MMMM YYYY")}
                      </Text>
                    </View>
                  </View>
                  <View className="mt-10 w-full gap-4 px-10">
                    <Button type="primary" onPress={handleEditToggle}>
                      Edit Profile
                    </Button>
                    <Button
                      type="primary"
                      onPress={() => router.push("/resetPassword")}
                    >
                      Reset Password
                    </Button>
                    <Button type="ghost" onPress={handleLogout}>
                      Logout
                    </Button>
                  </View>
                </>
              ) : (
                <>
                  <Text className="mb-8 text-center text-lg font-semibold text-gray-800">
                    Edit Profile
                  </Text>
                  <Text>Name</Text>
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
                          <Text className="mt-1 text-red-500">
                            {errors.name.message}
                          </Text>
                        )}
                      </View>
                    )}
                  />
                  <Text>Address</Text>
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
                  <Text>Date of Birth</Text>
                  <Controller
                    control={control}
                    name="date_of_birth"
                    render={({ field: { onChange, value } }) => (
                      <View className="mb-4">
                        <DatePicker
                          value={new Date(value)}
                          defaultValue={new Date()}
                          minDate={new Date(1900, 0, 1)}
                          maxDate={new Date()}
                          onChange={(date) => {
                            if (date) {
                              onChange(format(date, "yyyy-MM-dd"));
                            }
                          }}
                          okText="Confirm"
                          dismissText="Cancel"
                          format="DD MMMM YYYY"
                          renderLabel={(type, data) => {
                            if (type === "month") {
                              const date = setMonth(
                                new Date(2000, 0, 1),
                                data - 1,
                              );
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
                      <Text className="mb-4 text-red-500">
                          {customErrorMessage}
                      </Text>
                  )}
                  <View className="mt-10 w-full gap-4 px-10">
                    <Button type="primary" onPress={handleSubmit(onSubmit)}>
                      Save
                    </Button>
                    <Button type="ghost" onPress={handleCancel}>
                      Cancel
                    </Button>
                  </View>
                </>
              )}
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}
