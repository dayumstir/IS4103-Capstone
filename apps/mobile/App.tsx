import React from "react";
import { Text, View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Button } from "@ant-design/react-native";
import { store } from "./src/store";
import { Provider } from "react-redux";
import "./globals.css";

export default function App() {
  return (
    <Provider store={store}>
      <View className="flex items-center justify-center bg-white">
        <Text className="mb-5 text-4xl font-bold">Native</Text>
        <Button type="primary">primary</Button>
        <StatusBar style="auto" />
      </View>
    </Provider>
  );
}
