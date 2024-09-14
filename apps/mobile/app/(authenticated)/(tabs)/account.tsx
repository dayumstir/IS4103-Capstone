import { Button } from "@ant-design/react-native";
import { ScrollView, Text, View } from "react-native";
import { useDispatch } from "react-redux";
import { logout } from "../../../redux/features/customerAuthSlice";
import { router } from "expo-router";

export default function AccountPage() {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    router.replace("/login");
  };

  return (
    <ScrollView>
      <View>
        <Text>Account Page</Text>
        <Button onPress={handleLogout}>Logout</Button>
      </View>
    </ScrollView>
  );
}
