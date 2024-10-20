// wallet/_layout.tsx
import { Stack } from "expo-router";

export default function WalletLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerTitle: "Wallet" }} />
      {/* Add additional screens here as you create them */}
    </Stack>
  );
}
