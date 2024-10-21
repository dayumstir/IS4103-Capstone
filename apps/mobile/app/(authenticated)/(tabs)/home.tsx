import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  Image,
} from "react-native";
import { format } from "date-fns";
import { router } from "expo-router";
import { formatCurrency } from "../../../utils/formatCurrency";
import { useGetProfileQuery } from "../../../redux/services/customerService";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setProfile } from "../../../redux/features/customerSlice";
import { Ionicons } from "@expo/vector-icons";
import { useGetCustomerOutstandingInstalmentPaymentsQuery } from "../../../redux/services/instalmentPaymentService";
import { ActivityIndicator, Button } from "@ant-design/react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useGetCustomerTransactionsQuery } from "../../../redux/services/transactionService";
import { Buffer } from "buffer";

export default function HomePage() {
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);

  // Fetch the profile using the API call
  const {
    data: profile,
    isLoading,
    refetch: refetchProfile,
  } = useGetProfileQuery();

  // Update Redux store when profile data is fetched
  useEffect(() => {
    if (profile && !isLoading) {
      dispatch(setProfile(profile));
    }
  }, [profile, isLoading, dispatch]);

  const {
    data: outstandingInstalmentPayments,
    isLoading: isInstalmentPaymentsLoading,
    refetch: refetchInstalmentPayments,
  } = useGetCustomerOutstandingInstalmentPaymentsQuery();

  const {
    data: transactions,
    isLoading: isTransactionsLoading,
    refetch: refetchTransactions,
  } = useGetCustomerTransactionsQuery("");

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchProfile(),
        refetchInstalmentPayments(),
        refetchTransactions(),
      ]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const getTotalOutstandingPayments = () => {
    let total = 0;
    outstandingInstalmentPayments?.forEach((payment) => {
      total += payment.amount_due;
    });
    return total;
  };

  const getProgressValue = () => {
    return (profile?.wallet_balance ?? 0) / getTotalOutstandingPayments();
  };

  return (
    <ScrollView
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="m-4 flex-row items-center justify-between">
        <Text className="text-4xl font-bold">Home</Text>
        <TouchableOpacity className="p-2">
          <Ionicons name="notifications-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* ===== Wallet Overview ===== */}
      <View className="mx-4 flex-1 rounded-xl bg-blue-500 p-8">
        <View className="mb-4 flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View className="mr-4 h-12 w-12 items-center justify-center rounded-full bg-white">
              {profile?.profile_picture ? (
                <Image
                  source={{
                    uri: `data:image/png;base64,${Buffer.from(
                      profile.profile_picture,
                    ).toString("base64")}`,
                  }}
                  style={{ width: 48, height: 48, borderRadius: 24 }}
                />
              ) : (
                <Ionicons name="person" size={24} color="black" />
              )}
            </View>
            <View className="flex-1">
              <Text
                className="text-2xl font-bold text-white"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                Hello, {profile?.name || "User"}
              </Text>
              <Text className="text-sm text-white">
                Here's your wallet overview
              </Text>
            </View>
          </View>
        </View>
        <View>
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="font-semibold text-white">Wallet Balance</Text>
            <Text className="text-lg font-bold text-white">
              {formatCurrency(profile?.wallet_balance ?? 0)}
            </Text>
          </View>
          <View className="mb-2 flex-row items-center justify-between">
            <Text className="font-semibold text-white">
              Outstanding Payments
            </Text>
            <Text className="text-lg font-bold text-white">
              {formatCurrency(getTotalOutstandingPayments())}
            </Text>
          </View>
          <View className="mt-4 h-2 w-full rounded-full bg-blue-700">
            <View
              className="h-full rounded-full bg-white"
              style={{
                width: `${getProgressValue() * 100}%`,
              }}
            />
          </View>
          <Text className="mt-2 text-center font-medium text-white">
            {(
              ((profile?.wallet_balance ?? 0) / getTotalOutstandingPayments()) *
              100
            ).toFixed(1)}
            % of payments covered
          </Text>
        </View>
      </View>

      {/* ===== Outstanding Payments ===== */}
      <View className="m-4 rounded-xl bg-white p-8">
        <Text className="mb-4 text-xl font-bold">Outstanding Payments</Text>

        {isInstalmentPaymentsLoading ? (
          <View className="items-center justify-center py-4">
            <ActivityIndicator size="large" />
          </View>
        ) : outstandingInstalmentPayments &&
          outstandingInstalmentPayments.length > 0 ? (
          <View>
            {outstandingInstalmentPayments.slice(0, 3).map((payment, index) => (
              <View
                key={payment.instalment_payment_id}
                className="flex-row items-center justify-between border-t border-gray-200 py-4"
              >
                <View className="mr-4 flex-1">
                  <Text
                    className="font-medium"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                  >
                    {payment.transaction.merchant.name}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    Due: {format(payment.due_date, "d MMM yyyy")}
                  </Text>
                </View>
                <View className="flex-row items-center gap-4">
                  <Text className="font-semibold">
                    {formatCurrency(payment.amount_due)}
                  </Text>
                  <TouchableOpacity className="rounded-md border border-blue-500 bg-white px-4 py-2">
                    <Text className="text-sm font-semibold text-blue-500">
                      Pay
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className="items-center gap-2 px-8 py-4">
            <Text className="text-center font-medium leading-6 text-gray-500">
              Hooray, you have paid all your outstanding instalment payments!
            </Text>
            <Text className="text-center text-4xl"> 🎉</Text>
          </View>
        )}
        <Button type="primary" onPress={() => router.push("/payments")}>
          <Text className="font-semibold text-white">View All</Text>
        </Button>
      </View>

      {/* ===== Scan to Pay ===== */}
      <LinearGradient
        colors={["#3b82f6", "#9333ea"]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{
          padding: 8,
          borderRadius: 12,
          marginHorizontal: 16,
        }}
      >
        <TouchableOpacity
          onPress={() => router.push("/scan")}
          className="rounded-xl bg-white"
        >
          <View className="flex-row items-center justify-center gap-4 rounded-lg bg-white p-4">
            <Ionicons name="qr-code" size={28} color="#3b82f6" />
            <Text className="text-xl font-bold text-blue-600">Scan to Pay</Text>
          </View>
        </TouchableOpacity>
      </LinearGradient>

      {/* TODO: Include wallet top ups */}
      {/* ===== Recent Activity ===== */}
      <View className="m-4 rounded-xl bg-white p-8">
        <Text className="mb-4 text-xl font-bold">Recent Activity</Text>
        {isTransactionsLoading ? (
          <View className="items-center justify-center py-4">
            <ActivityIndicator size="large" />
          </View>
        ) : transactions && transactions.length > 0 ? (
          <View>
            {transactions.slice(0, 3).map((transaction, index) => (
              <View
                key={transaction.transaction_id}
                className={`flex-row items-center justify-between border-t border-gray-200 ${
                  index === 2 ? "pt-4" : "py-4"
                }`}
              >
                <View className="flex-row items-center gap-2">
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    {/* TODO: Replace with merchant profile picture */}
                    <Text className="text-center font-bold text-blue-500">
                      {transaction.merchant.name.slice(0, 1).toUpperCase()}
                    </Text>
                  </View>
                  <View className="mr-4 flex-1">
                    <Text
                      className="font-medium"
                      numberOfLines={1}
                      ellipsizeMode="tail"
                    >
                      {transaction.merchant.name}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      {format(transaction.date_of_transaction, "d MMM yyyy, h:mm a")}
                    </Text>
                  </View>
                  <Text
                    className={`font-semibold ${transaction.amount <= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {transaction.amount <= 0 ? "+" : "-"}
                    {formatCurrency(Math.abs(transaction.amount))}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className="items-center gap-2 px-8 py-4">
            <Text className="text-center font-medium leading-6 text-gray-500">
              You have no recent transactions
            </Text>
            <Text className="text-center text-4xl"> 😊</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}
