import React, { useEffect } from "react";
import { Button } from "@ant-design/react-native";
import { ScrollView, Text, View, Image, Linking } from "react-native";

import { useDispatch } from "react-redux";
import { useGetProfileQuery } from "../../../redux/services/customer";  // Import the profile query hook

import { setProfile } from "../../../redux/features/customerSlice";   // Import the setProfile action
import { logout } from "../../../redux/features/customerAuthSlice";   
import { router } from "expo-router";


export default function AccountPage() {
  const dispatch = useDispatch();

  // Fetch the profile using the API call
  const { data: profile, error, isLoading } = useGetProfileQuery();

  // Dispatch the profile data to the redux store when fetched
  useEffect(() => {
    if (profile) {
      console.log(profile);
      dispatch(setProfile(profile));
    }
  }, [profile]);

  const handleLogout = () => {
    dispatch(logout());
    router.replace("/login");
  };

  if (isLoading) {
    return <Text className="text-center text-lg">Loading...</Text>;
  }

  if (error) {
    return <Text className="text-center text-lg text-red-500">Error fetching profile</Text>;
  }

  return (
    <ScrollView>
      <View className="flex h-screen w-screen items-center px-8 pt-8">
        {profile && (
          <>
            {/* Profile Picture */}
            <Image
              source={{ uri: profile.profile_picture }}
              className="w-30 h-30 rounded-full mb-6"
            />

            {/* Credit Rating */}
            <Text className="text-lg font-semibold text-gray-800 mb-1">My Credit Rating</Text>
            <Text className="text-5xl font-bold text-black mb-2">{profile.credit_score}</Text>
            <Text
              className="text-blue-500 underline"
              onPress={() => Linking.openURL("https://example.com/what-does-this-mean")}
            >
              What does this mean?
            </Text>

            {/* Profile Information */}
            <View className="mt-5 w-full px-6">
              <Text className="text-md font-regular text-gray-600 mb-2">Name: {profile.name}</Text>
              <Text className="text-md font-regular text-gray-600 mb-2">Email: {profile.email}</Text>
              <Text className="text-md font-regular text-gray-600 mb-2">Contact Number: {profile.contact_number}</Text>
              <Text className="text-md font-regular text-gray-600 mb-2">Address: {profile.address}</Text>
              <Text className="text-md font-regular text-gray-600 mb-2">
                Date of Birth: {new Date(profile.date_of_birth).toLocaleDateString()}
              </Text>
            </View>

            {/* Buttons */}
            <View className="mt-10 w-full px-10 gap-4">
              <Button
                type="primary"
                onPress={() => router.push("/edit-profile")}
              >
                Update Profile
              </Button>
              <Button
                type="primary"
                // onPress={() => router.push("/reset-password")}
              >
                Reset Password
              </Button>
              <Button
                type="primary"
                // onPress={() => router.push("/raise-dispute")}
              >
                Raise Dispute
              </Button>
              <Button
                type="primary"
                onPress={handleLogout}
              >
                Logout
              </Button>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}
