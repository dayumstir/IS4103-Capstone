import React from "react";
import { View, Text } from "react-native";
import { StatusBar } from "expo-status-bar";

const HomeScreen = () => {
  return (
    <View className="flex h-screen items-center justify-center">
      <Text className="text-4xl font-bold text-red-700">
        Welcome to the home screen
      </Text>
      <StatusBar style="auto" />
    </View>
  );
};

export default HomeScreen;
