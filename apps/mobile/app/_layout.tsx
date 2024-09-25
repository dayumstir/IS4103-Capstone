import "../global.css";
import { Stack } from "expo-router";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "../redux/store";
import { Provider as AntProvider } from "@ant-design/react-native";
import enUS from "@ant-design/react-native/lib/locale-provider/en_US";
import Toast from "react-native-toast-message";

export default function RootLayout() {
  return (
    <AntProvider
      locale={enUS}
      theme={{
        primary_button_fill: "#3b82f6",
      }}
    >
      <ReduxProvider store={store}>
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
        <Toast />
      </ReduxProvider>
    </AntProvider>
  );
}
