import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { store } from "../redux/store";
import "../global.css";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack>
          <Stack.Screen name="index" options={{ headerTitle: "Index" }} />
          <Stack.Screen name="login" options={{ headerTitle: "Login" }} />
          <Stack.Screen name="register" options={{ headerTitle: "Register" }} />
          <Stack.Screen
            name="confirmation"
            options={{ headerTitle: "Email Confirmation" }}
          />
          <Stack.Screen
            name="(authenticated)"
            options={{ headerShown: false }}
          />
        </Stack>
      </GestureHandlerRootView>
    </Provider>
  );
}
