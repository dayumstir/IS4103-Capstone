import React from "react";
import { View, Text } from "react-native";
import { StatusBar } from "expo-status-bar";
import { AntDesign } from "@expo/vector-icons";
import { Button } from "@ant-design/react-native";
import { format } from "date-fns";

const HomeScreen = () => {
  const name = "John";
  const walletBalance = 1200;

  const outstandingPayments = [
    {
      id: 1,
      name: "iPhone",
      amount: 500,
    },
    {
      id: 2,
      name: "Apple Watch",
      amount: 150,
    },
    {
      id: 3,
      name: "MacBook",
      amount: 700,
    },
  ];

  const getTotalOutstandingPayments = () => {
    let total = 0;
    outstandingPayments.forEach((payment) => {
      total += payment.amount;
    });
    return total;
  };

  const transactions = [
    {
      id: 1,
      dateTime: new Date(2024, 8, 30),
      name: "TOP UP",
      merchant: "DBS",
      amount: 1100,
    },
    {
      id: 2,
      dateTime: new Date(2024, 8, 29),
      name: "MacBook",
      merchant: "APPLE SG PTE LTD",
      amount: -500,
    },
  ];

  return (
    <View className="flex h-screen w-screen items-center px-8 pt-8">
      {/* ===== Header ===== */}
      <View className="flex w-full flex-row justify-between">
        <View className="flex max-w-[200px]">
          <Text className="text-3xl">
            Hello <Text className="font-bold">{name}</Text>
          </Text>
          <Text className="text-base">
            You do not have enough balance in ur wallet for this month's
            payments
          </Text>
        </View>

        <View className="flex flex-row items-center gap-4">
          <Button
            style={{
              borderRadius: 100,
              padding: 4,
              backgroundColor: "#1777ff",
            }}
          >
            <AntDesign name="message1" size={16} />
          </Button>
          <Button
            style={{
              borderRadius: 100,
              padding: 4,
              backgroundColor: "#1777ff",
            }}
          >
            <AntDesign name="bells" size={16} />
          </Button>
        </View>
      </View>

      {/* ===== Wallet Balance ===== */}
      <View className="mt-4 flex w-full items-center justify-center gap-4 rounded-lg border bg-gray-200 p-8">
        <AntDesign name="user" size={24} />
        <Text className="font-medium">My Wallet Balance</Text>
        <Text className="text-3xl font-bold text-orange-500">
          ${walletBalance}
        </Text>
        <Text className="">Outstanding Payments for the month</Text>
        <View className="flex w-full gap-2">
          {outstandingPayments.map((payment) => (
            <View
              className="flex w-full flex-row justify-between"
              key={payment.id}
            >
              <Text className="">{payment.name}</Text>
              <Text className="">${payment.amount}</Text>
            </View>
          ))}
          <View className="flex w-full flex-row justify-between">
            <Text className="font-bold">Total</Text>
            <Text className="font-bold">${getTotalOutstandingPayments()}</Text>
          </View>
        </View>
      </View>

      {/* ===== Scan to Pay ===== */}
      <Button style={{ marginTop: 20, height: 100 }}>
        <View className="flex w-full items-center justify-center gap-4 py-8">
          <Text className="text-xl">Scan to Pay</Text>
          <AntDesign name="scan1" size={40} />
        </View>
      </Button>

      {/* ===== Transactions ===== */}
      <View className="mt-5 flex">
        <Text className="text-xl font-bold">Transactions</Text>
        <View className="mt-2 flex gap-4 rounded-lg bg-gray-200 p-4">
          {transactions.map((transaction) => (
            <View className="flex w-full flex-col gap-2" key={transaction.id}>
              <Text className="font-bold">
                {format(transaction.dateTime, "d MMM yyyy")}
              </Text>
              <View className="flex w-full flex-row justify-between">
                <View className="">
                  <Text className="">{transaction.name}</Text>
                  <Text className="text-gray-500">
                    {transaction.merchant +
                      " " +
                      format(transaction.dateTime, "k:mm")}
                  </Text>
                </View>
                <Text
                  className={`${transaction.amount < 0 ? "text-red-500" : "text-green-500"} h-full font-bold`}
                >
                  {transaction.amount < 0 ? "-" : "+"}$
                  {Math.abs(transaction.amount)}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <StatusBar style="auto" />
    </View>
  );
};

export default HomeScreen;
