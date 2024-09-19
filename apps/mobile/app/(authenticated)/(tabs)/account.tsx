import { Button } from "@ant-design/react-native";
import { ScrollView, Text, View, Image } from "react-native";
import { useDispatch } from "react-redux";
import { useGetProfileQuery } from "../../../redux/services/customer";  // Import the profile query hook
import { setProfile } from "../../../redux/features/customerSlice";   // Import the setProfile action
import { logout } from "../../../redux/features/customerAuthSlice";   
import { router } from "expo-router";
import React, { useEffect } from "react";

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
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>Error fetching profile</Text>;
  }

  return (
    <ScrollView>
      <View>
        <Text>Account Page</Text>
        {profile && (
          <>
            <Image source={{ uri: profile.profile_picture }} style={{ width: 100, height: 100 }} />
            <Text>Name: {profile.name}</Text>
            <Text>Email: {profile.email}</Text>
            <Text>Contact Number: {profile.contact_number}</Text>
            <Text>Address: {profile.address}</Text>
            <Text>Date of Birth: {new Date(profile.date_of_birth).toLocaleDateString()}</Text>
            <Text>Credit Score: {profile.credit_score}</Text>
            <Text>Status: {profile.status}</Text>
          </>
        )}
        <Button onPress={handleLogout}>Logout</Button>
      </View>
    </ScrollView>
  );
}
