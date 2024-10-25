// payments/_layout.tsx
import { Stack } from "expo-router";

export default function PaymentsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerTitle: "Payments" }} />
      <Stack.Screen
        name="allTransactions"
        options={{ headerTitle: "Transactions" }}
      />
      <Stack.Screen
        name="[transactionId]"
        options={{
          headerTitle: "Transaction Details",
        }}
      />
      <Stack.Screen
        name="instalments"
        options={{
          headerTitle: "Back",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
