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
        name="eligiblePlans"
        options={{ headerTitle: "Instalment Plans" }}
      />
      <Stack.Screen
        name="resetPassword"
        options={{ headerTitle: "Reset Password" }}
      />
      <Stack.Screen
        name="rewards"
        options={{ headerTitle: "Rewards", headerShown: false }}
      />
      <Stack.Screen
        name="issue"
        options={{ headerTitle: "Issues", headerShown: false }}
      />
    </Stack>
  );
}
