import React, { useEffect, useState, useRef } from "react";
import { ScrollView, Text, View, Image, Linking, TextInput, TouchableOpacity, Platform } from "react-native";
import { Button } from "@ant-design/react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import BottomSheet from "@gorhom/bottom-sheet";
import { useDispatch } from "react-redux";
import { useGetProfileQuery, useEditProfileMutation } from "../../../redux/services/customer";
import { setProfile } from "../../../redux/features/customerSlice";
import { logout } from "../../../redux/features/customerAuthSlice";   
import { router, useRouter } from "expo-router";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import dayjs from 'dayjs';
import { format } from "date-fns";


// Validation Schema using zod
const profileSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  date_of_birth: z.string().refine((date) => {
    const parsedDate = dayjs(date, "YYYY-MM-DD", true);
    return parsedDate.isValid();
  }, { message: "Invalid date format" })
});

export default function AccountPage() {
  const dispatch = useDispatch();
  const router = useRouter(); 
  
  // Fetch the profile using the API call
  const { data: profile, error, isLoading, refetch } = useGetProfileQuery();

  // Form state management using react-hook-form
  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    defaultValues: {
      name: profile?.name,
      address: profile?.address,
      date_of_birth: dayjs(profile?.date_of_birth).format("YYYY-MM-DD"),  
    },
    resolver: zodResolver(profileSchema)
  });

  // Local state management
  const [isEditing, setIsEditing] = useState(false);  // Toggles between view and edit mode
  const [tempDate, setTempDate] = useState<Date | null>(null);  // For temporary date storage
  const bottomSheetRef = useRef<BottomSheet>(null);  // Reference for BottomSheet
  const [editProfile] = useEditProfileMutation();  // Mutation hook for editing profile

  // Effect to dispatch profile data into Redux store when fetched
  useEffect(() => {
    if (profile) {
      dispatch(setProfile(profile));
    }
  }, [profile]);
  
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
        date_of_birth: dayjs(data.date_of_birth).toISOString(),  // Convert date to ISO format
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

      setIsEditing(false);  // Exit edit mode
    } catch (error) {
      console.error("Failed to update profile:", error);
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
                  source={{ uri: profile.profile_picture }}
                  className="w-30 h-30 rounded-full mb-6"
                />
                <Text className="text-lg font-semibold text-gray-800 mb-1">My Credit Rating</Text>
                <Text className="text-5xl font-bold text-black mb-2">{profile.credit_score}</Text>
                <Text
                  className="text-blue-500 underline"
                  onPress={() => Linking.openURL("https://example.com/what-does-this-mean")}
                >
                  What does this mean?
                </Text>
              </>
            )}

            <View className="mt-5 w-full px-6">
              {!isEditing ? (
                <>
                  <View className="mt-5 w-full px-6">
                    <Text className="text-md font-regular text-gray-600 mb-2">Name: {profile.name}</Text>
                    <Text className="text-md font-regular text-gray-600 mb-2">Email: {profile.email}</Text>
                    <Text className="text-md font-regular text-gray-600 mb-2">Contact Number: {profile.contact_number}</Text>
                    <Text className="text-md font-regular text-gray-600 mb-2">Address: {profile.address}</Text>
                    <Text className="text-md font-regular text-gray-600 mb-2">
                      Date of Birth: {new Date(profile.date_of_birth).toLocaleDateString()}
                    </Text>
                  </View>
                  <View className="mt-10 w-full px-10 gap-4">
                    <Button type="primary" onPress={handleEditToggle}>
                      Edit Profile
                    </Button>
                    <Button type="primary" onPress={() => router.push("/resetPassword")}>
                      Reset Password
                    </Button>
                    <Button type="primary" onPress={handleLogout}>
                      Logout
                    </Button>
                  </View>
                </>
              ) : (
                <>
                  <Text className="text-lg font-semibold text-gray-800 mb-1 text-center mb-8">Edit Profile</Text>
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
                          <Text className="mt-1 text-red-500">{errors.name.message}</Text>
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
                        <TouchableOpacity
                          onPress={() => {
                            setTempDate(value ? dayjs(value).toDate() : new Date());
                            bottomSheetRef.current?.expand();
                          }}
                          className="rounded-md border border-gray-300 p-4 focus:border-blue-500"
                        >
                          <Text>
                            {value ? format(new Date(value), "dd MMMM yyyy") : "Select Date of Birth"}
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
                  <View className="mt-10 w-full px-10 gap-4">
                    <Button type="primary" onPress={handleSubmit(onSubmit)}>Save</Button>
                    <Button type="ghost" onPress={handleCancel}>Cancel</Button>
                  </View>
                  <BottomSheet ref={bottomSheetRef} index={-1} snapPoints={[350]} enablePanDownToClose>
                    <View className="flex-1 px-8 py-4">
                      <Text className="text-center text-lg font-semibold">Select your Date of Birth</Text>
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
                            console.log(tempDate)
                            setValue("date_of_birth", format(tempDate, "yyyy-MM-dd"));
                          }
                          bottomSheetRef.current?.close();
                        }}
                        className="mt-4 rounded bg-blue-500 p-3"
                      >
                        <Text className="text-center font-semibold text-white">Confirm</Text>
                      </TouchableOpacity>
                    </View>
                  </BottomSheet>
                </>
              )}
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}
