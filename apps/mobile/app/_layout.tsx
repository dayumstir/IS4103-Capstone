import "../global.css";
import { Stack } from "expo-router";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "../redux/store";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Provider as AntProvider } from "@ant-design/react-native";
import enUS from "@ant-design/react-native/lib/locale-provider/en_US";

export default function RootLayout() {
  return (
    <AntProvider locale={enUS}>
      <ReduxProvider store={store}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <Stack>
            <Stack.Screen name="index" options={{ headerTitle: "Index" }} />
            <Stack.Screen name="login" options={{ headerTitle: "Login" }} />
            <Stack.Screen
              name="register"
              options={{ headerTitle: "Register" }}
            />
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
      </ReduxProvider>
    </AntProvider>
  );
}
