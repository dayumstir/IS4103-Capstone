import { Stack } from "expo-router";

export default function AccountLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerTitle: "Account" }} />
      <Stack.Screen
        name="editProfile"
        options={{ headerTitle: "Edit Profile" }}
      />
      <Stack.Screen
        name="resetPassword"
        options={{ headerTitle: "Reset Password" }}
      />
    </Stack>
  );
}
