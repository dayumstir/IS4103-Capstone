import { Buffer } from "buffer";
import {
  Text,
  View,
  Image,
  Linking,
  TouchableOpacity,
  RefreshControl,
} from "react-native";
import { ActivityIndicator, Button } from "@ant-design/react-native";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../../../redux/features/customerAuthSlice";
import { useRouter } from "expo-router";
import { format } from "date-fns";
import { ScrollView } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { RootState } from "../../../../redux/store";
import { useGetCustomerOutstandingInstalmentPaymentsQuery } from "../../../../redux/services/instalmentPaymentService";
import { formatCurrency } from "../../../../utils/formatCurrency";
import { useGetCustomerCreditTierQuery } from "../../../../redux/services/customerService";
import { useState } from "react";
import * as DocumentPicker from "expo-document-picker";
import Toast from "react-native-toast-message";

export default function AccountPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);

  const profile = useSelector((state: RootState) => state.customer.profile);

  const { data: outstandingInstalmentPayments, refetch: refetchInstallments } =
    useGetCustomerOutstandingInstalmentPaymentsQuery();
  const totalCreditUsed =
    outstandingInstalmentPayments?.reduce(
      (acc, curr) => acc + curr.amount_due,
      0,
    ) ?? 0;

  const { data: creditTier, refetch: refetchCreditTier } =
    useGetCustomerCreditTierQuery();

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchCreditTier(), refetchInstallments()]);
    setRefreshing(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    router.replace("/login");
  };

  const handleUploadCreditHistory = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) {
        return;
      }

      // TODO: Implement API call to upload file
      // const formData = new FormData();
      // formData.append('file', {
      //   uri: result.assets[0].uri,
      //   type: 'application/pdf',
      //   name: result.assets[0].name,
      // });
      // await uploadCreditHistoryMutation(formData);

      Toast.show({
        type: "success",
        text1: "File selected successfully",
        text2: result.assets[0].name,
      });
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error selecting file",
        text2: "Please try again",
      });
    }
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* ===== Profile Details ===== */}
      <View className="m-4 flex gap-4 rounded-lg bg-white p-8">
        <Text className="mb-4 text-2xl font-bold">Profile Details</Text>
        {profile ? (
          <>
            <View className="flex flex-row items-center gap-6">
              <Image
                source={{
                  uri: `data:image/png;base64,${Buffer.from(
                    profile.profile_picture,
                  ).toString("base64")}`,
                }}
                className="h-20 w-20 rounded-full"
              />
              <View className="flex w-full flex-wrap">
                <Text className="text-2xl font-semibold">{profile.name}</Text>
                <Text className="text-lg text-gray-600">{profile.email}</Text>
              </View>
            </View>

            <View>
              <Text className="text-gray-600">Contact Number</Text>
              <Text className="text-lg font-semibold">
                {profile.contact_number}
              </Text>
            </View>

            <View>
              <Text className="text-gray-600">Address</Text>
              <Text className="text-lg font-semibold">{profile.address}</Text>
            </View>

            <View>
              <Text className="text-gray-600">Date of Birth</Text>
              <Text className="text-lg font-semibold">
                {format(profile.date_of_birth, "dd MMMM yyyy")}
              </Text>
            </View>

            <Button
              type="ghost"
              onPress={() => router.push("/account/editProfile")}
            >
              <AntDesign
                name="edit"
                size={20}
                color="#3b82f6"
                className="mr-2"
              />
              <Text className="my-auto font-semibold text-blue-500">
                Edit Profile
              </Text>
            </Button>
          </>
        ) : (
          <ActivityIndicator size="large" />
        )}
      </View>

      {/* ===== Credit Rating ===== */}
      <View className="mx-4 flex gap-4 rounded-lg bg-white p-8">
        <Text className="mb-4 text-2xl font-bold">Credit Rating</Text>

        {/* ===== Credit Score ===== */}
        <View className="items-center gap-2">
          <Text className="text-gray-600">Credit Score</Text>
          <Text className="text-5xl font-bold text-black">
            {profile?.credit_score}
          </Text>
        </View>

        <TouchableOpacity
          className="mx-auto flex flex-row items-center gap-2"
          onPress={() =>
            Linking.openURL("https://example.com/what-does-this-mean")
          }
        >
          <AntDesign name="infocirlceo" size={16} color="#3b82f6" />
          <Text className="text-blue-500 underline">What does this mean?</Text>
        </TouchableOpacity>

        <Button
          type="primary"
          onPress={() => router.push("/account/eligiblePlans")}
        >
          <AntDesign
            name="filetext1"
            size={20}
            color="white"
            className="mr-2"
          />
          <Text className="my-auto font-semibold text-white">
            View Eligible Plans
          </Text>
        </Button>

        <View className="my-2 h-0.5 w-full rounded-full bg-gray-200" />

        {/* ===== Credit Limit ===== */}
        <View className="items-center gap-2">
          <Text className="mb-2 text-gray-600">Credit Limit</Text>
          <Text className="text-4xl font-bold text-black">
            {formatCurrency(creditTier?.credit_limit ?? 1)}
          </Text>

          <View className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <View
              className="h-full bg-blue-500"
              style={{
                width: `${((totalCreditUsed ?? 0) / (creditTier?.credit_limit ?? 1)) * 100}%`,
              }}
            />
          </View>

          <View className="flex w-full flex-row justify-between">
            <Text className="text-sm text-gray-600">
              {formatCurrency(totalCreditUsed)} Used
            </Text>
            <Text className="text-sm text-gray-600">
              {formatCurrency(
                (creditTier?.credit_limit ?? 1) - (totalCreditUsed ?? 0),
              )}{" "}
              Available
            </Text>
          </View>
        </View>

        <Button type="ghost" onPress={handleUploadCreditHistory}>
          <AntDesign
            name="pdffile1"
            size={20}
            color="#3b82f6"
            className="mr-2"
          />
          <Text className="my-auto font-semibold text-blue-500">
            Upload Credit History (PDF)
          </Text>
        </Button>
      </View>

      {/* ===== Account Services ===== */}
      <View className="m-4 flex gap-2 rounded-lg bg-white p-8">
        <Text className="mb-4 text-2xl font-bold">Account Services</Text>

        <Button type="primary" onPress={() => router.push("/account/rewards")}>
          <AntDesign name="gift" size={20} color="white" className="mr-2" />
          <Text className="my-auto font-semibold text-white">My Rewards</Text>
        </Button>

        <Button type="primary" onPress={() => router.push("/account/issue")}>
          <AntDesign name="warning" size={20} color="white" className="mr-2" />
          <Text className="my-auto font-semibold text-white">My Issues</Text>
        </Button>

        <Button
          type="ghost"
          onPress={() => router.push("/account/resetPassword")}
        >
          <MaterialIcons
            name="lock"
            size={20}
            color="#3b82f6"
            className="mr-2"
          />
          <Text className="my-auto font-semibold text-blue-500">
            Reset Password
          </Text>
        </Button>

        <TouchableOpacity
          className="mt-2 flex flex-row items-center justify-center gap-2"
          onPress={handleLogout}
        >
          <MaterialIcons name="logout" size={20} color="#ef4444" />
          <Text className="font-semibold text-red-500">Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
