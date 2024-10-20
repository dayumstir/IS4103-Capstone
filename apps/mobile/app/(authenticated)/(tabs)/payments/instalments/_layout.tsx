// payments/instalments/_layout.tsx
import { Stack } from "expo-router";

export default function InstalmentsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="[instalmentPaymentId]"
        options={{
          headerTitle: "Payment Details",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
