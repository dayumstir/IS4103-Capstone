import { Redirect, Tabs } from "expo-router";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useSelector } from "react-redux";
import { RootState } from "../../redux/store";

export default function AuthenticatedLayout() {
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={
        {
          // headerShown: false,
        }
      }
    >
      <Tabs.Screen
        name="home"
        options={{
          headerTitle: "Home",
          title: "Home",
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          headerTitle: "Payments",
          title: "Payments",
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="creditcard" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          headerTitle: "Wallet",
          title: "Wallet",
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="wallet" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          headerTitle: "Account",
          title: "Account",
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="user" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
