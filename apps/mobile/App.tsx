import React from "react";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import { store } from "./src/store";
import { Provider } from "react-redux";
import HomeScreen from "./src/screens/homeScreen";

export default function App() {
  return (
    <Provider store={store}>
      <View className="">
        <HomeScreen />
        <StatusBar style="auto" />
      </View>
    </Provider>
  );
}
