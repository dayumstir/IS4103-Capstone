// app/mobile/app/(authenticated)/(tabs)/wallet/_layout.tsx
import { Stack } from "expo-router";

export default function WalletLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ headerTitle: "Wallet" }} 
      />
      <Stack.Screen 
        name="allWalletHistory"
        options={{ headerTitle: "Wallet History" }}
      />
    </Stack>
  );
}
