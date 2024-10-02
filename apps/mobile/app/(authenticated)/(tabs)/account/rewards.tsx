import {
  View,
  Text,
  ScrollView,
  Dimensions,
  RefreshControl,
} from "react-native";
import { Button } from "@ant-design/react-native";
import { router } from "expo-router";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { AntDesign } from "@expo/vector-icons";
import { useState } from "react";

export default function Rewards() {
  const Tab = createMaterialTopTabNavigator();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setRefreshing(false);
  };

  const cashbackList = [
    { id: 1, amount: 5.5, merchant: "SuperMart", date: "2023-09-25" },
    { id: 2, amount: 2.75, merchant: "CoffeeHouse", date: "2023-09-23" },
    { id: 3, amount: 10.0, merchant: "ElectroStore", date: "2023-09-20" },
  ];

  const vouchers = [
    {
      id: 1,
      discount: "10% off",
      merchant: "FashionHub",
      expiryDate: "2023-10-31",
    },
    {
      id: 2,
      discount: "$5 off $50",
      merchant: "GroceryWorld",
      expiryDate: "2023-11-15",
    },
    {
      id: 3,
      discount: "Buy 1 Get 1 Free",
      merchant: "CinemaPlus",
      expiryDate: "2023-10-10",
    },
    {
      id: 4,
      discount: "10% off",
      merchant: "FashionHub",
      expiryDate: "2023-10-31",
    },
    {
      id: 5,
      discount: "$5 off $50",
      merchant: "GroceryWorld",
      expiryDate: "2023-11-15",
    },
    {
      id: 31,
      discount: "Buy 1 Get 1 Free",
      merchant: "CinemaPlus",
      expiryDate: "2023-10-10",
    },
    {
      id: 11,
      discount: "10% off",
      merchant: "FashionHub",
      expiryDate: "2023-10-31",
    },
    {
      id: 24,
      discount: "$5 off $50",
      merchant: "GroceryWorld",
      expiryDate: "2023-11-15",
    },
    {
      id: 35,
      discount: "Buy 1 Get 1 Free",
      merchant: "CinemaPlus",
      expiryDate: "2023-10-10",
    },
  ];

  const CashbackView = () => (
    <ScrollView
      className="bg-white"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {cashbackList.map((cashback, index) => (
        <View
          key={cashback.id}
          className={`mb-4 rounded-lg border border-gray-300 p-4 ${index === 0 ? "mt-4" : ""}`}
        >
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-base font-bold">
                ${cashback.amount.toFixed(2)} Cashback
              </Text>
              <Text className="text-sm text-gray-500">
                From: {cashback.merchant}
              </Text>
            </View>
            <Text className="text-sm text-gray-500">Date: {cashback.date}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  const VoucherView = () => (
    <ScrollView
      className="bg-white"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {vouchers.map((voucher, index) => (
        <View
          key={voucher.id}
          className={`rounded-lg border border-gray-300 p-4 ${index === 0 ? "mt-4" : ""} ${index === vouchers.length - 1 ? "" : "mb-4"}`}
        >
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-base font-bold">{voucher.discount}</Text>
              <Text className="text-sm text-gray-500">
                At: {voucher.merchant}
              </Text>
            </View>
            <Text className="text-sm text-gray-500">
              Expires: {voucher.expiryDate}
            </Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );

  return (
    <View className="m-4 flex-1 rounded-lg bg-white p-8">
      <View className="mb-4 flex flex-row items-center gap-3">
        <View className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500">
          <AntDesign name="gift" size={20} color="white" />
        </View>
        <Text className="text-2xl font-bold">Rewards</Text>
      </View>

      <Tab.Navigator
        screenOptions={{
          tabBarLabelStyle: {
            fontWeight: "600",
            textTransform: "none",
            textAlign: "center",
            fontSize: 14,
          },
          tabBarItemStyle: {
            width: (Dimensions.get("window").width - 80) / 2,
          },
        }}
      >
        <Tab.Screen name="Cashback" component={CashbackView} />
        <Tab.Screen name="Vouchers" component={VoucherView} />
      </Tab.Navigator>

      <View className="mt-4">
        <Button type="primary" onPress={() => router.navigate("/account")}>
          <Text className="text-center font-semibold text-white">
            Back to Account
          </Text>
        </Button>
      </View>
    </View>
  );
}
