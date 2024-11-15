import "../global.css";
import { Stack } from "expo-router";
import { Provider as ReduxProvider } from "react-redux";
import { store } from "../redux/store";
import { Provider as AntProvider, View } from "@ant-design/react-native";
import enUS from "@ant-design/react-native/lib/locale-provider/en_US";
import Toast, { SuccessToast, ErrorToast } from "react-native-toast-message";
import AntDesign from "@expo/vector-icons/AntDesign";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function RootLayout() {
  const toastConfig = {
    success: (props: any) => (
      <SuccessToast
        {...props}
        text1Style={{
          fontSize: 14,
          fontWeight: "600",
        }}
        renderLeadingIcon={() => (
          // Tailwind not supported
          <View style={{ justifyContent: "center", marginLeft: 20 }}>
            <AntDesign name="checkcircle" size={24} color="#68C77A" />
          </View>
        )}
      />
    ),
    error: (props: any) => (
      <ErrorToast
        {...props}
        text1Style={{
          fontSize: 14,
          fontWeight: "600",
        }}
        renderLeadingIcon={() => (
          // Tailwind not supported
          <View style={{ justifyContent: "center", marginLeft: 20 }}>
            <AntDesign name="closecircle" size={24} color="#FE6301" />
          </View>
        )}
      />
    ),
  };

  return (
    <AntProvider
      locale={enUS}
      theme={{
        primary_button_fill: "#3b82f6",
      }}
    >
      <ReduxProvider store={store}>
        <GestureHandlerRootView>
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
              name="forgetPassword"
              options={{ title: "Forget Password" }}
            />
            <Stack.Screen
              name="resetPassword"
              options={{ title: "Reset Password" }}
            />
            <Stack.Screen
              name="(authenticated)"
              options={{ headerShown: false, title: "Back" }}
            />
          </Stack>
          <Toast config={toastConfig} topOffset={60} visibilityTime={2000} />
        </GestureHandlerRootView>
      </ReduxProvider>
    </AntProvider>
  );
}
