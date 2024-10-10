import { Stack } from "expo-router";

export default function PaymentsLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerTitle: "Payments" }} />
      <Stack.Screen
        name="allTransactions"
        options={{ headerTitle: "All Transactions" }}
      />
    </Stack>
  );
}
