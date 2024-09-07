import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          // headerShown: false,
          headerTitle: "Home",
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          // headerShown: false,
          headerTitle: "Payments",
        }}
      />
    </Tabs>
  );
}
