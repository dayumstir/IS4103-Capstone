import { setProfile } from "../../../../redux/features/customerSlice";
import { useEffect } from "react";
import { Buffer } from "buffer";
import { Text, View, Image, Linking, TouchableOpacity } from "react-native";
import { Button } from "@ant-design/react-native";
import { useDispatch } from "react-redux";
import { useGetProfileQuery } from "../../../../redux/services/customer";
import { logout } from "../../../../redux/features/customerAuthSlice";
import { useRouter } from "expo-router";
import { format } from "date-fns";
import { ScrollView } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";

export default function AccountPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  // Fetch the profile using the API call
  const { data: profile, isLoading } = useGetProfileQuery();

  // Logout handler
  const handleLogout = () => {
    dispatch(logout());
    router.replace("/login");
  };

  // Update Redux store when profile data is fetched
  useEffect(() => {
    if (profile && !isLoading) {
      dispatch(setProfile(profile));
    }
  }, [profile, isLoading, dispatch]);

  return (
    <ScrollView>
      <View className="flex w-screen items-center px-8 py-8">
        {profile && (
          <>
            <Image
              source={{
                uri: `data:image/png;base64,${Buffer.from(profile.profile_picture).toString("base64")}`,
              }}
              className="mb-2 h-32 w-32 rounded-full"
            />
            <Text className="mb-2 text-lg font-semibold text-gray-800">
              My Credit Rating
            </Text>
            <Text className="mb-2 text-4xl font-bold text-black">
              {profile.credit_score}
            </Text>
            <TouchableOpacity
              className="mb-2 flex flex-row items-center gap-2"
              onPress={() =>
                Linking.openURL("https://example.com/what-does-this-mean")
              }
            >
              <AntDesign name="infocirlceo" size={16} color="#3b82f6" />
              <Text className="text-blue-500 underline">
                What does this mean?
              </Text>
            </TouchableOpacity>

            <View className="mt-5 w-full px-4">
              <View className="mt-4 flex w-full gap-4 px-8">
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
                    {format(profile.date_of_birth, "dd MMMM yyyy")}
                  </Text>
                </View>
              </View>
              <View className="mt-10 w-full gap-4 px-8">
                <Button
                  type="primary"
                  onPress={() => router.push("/editProfile")}
                >
                  <Text className="font-semibold text-white">Edit Profile</Text>
                </Button>
                <Button
                  type="primary"
                  onPress={() => router.push("/resetPassword")}
                >
                  <Text className="font-semibold text-white">
                    Reset Password
                  </Text>
                </Button>
                <Button type="ghost" onPress={handleLogout}>
                  <Text className="font-semibold text-blue-500">Logout</Text>
                </Button>
              </View>
            </View>
          </>
        )}
      </View>
    </ScrollView>
  );
}
