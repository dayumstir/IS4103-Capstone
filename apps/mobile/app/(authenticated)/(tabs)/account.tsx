import { Button } from "@ant-design/react-native";
import { ScrollView, Text, View } from "react-native";
import { useDispatch } from "react-redux";
import { logout } from "../../../redux/features/authSlice";

export default function AccountPage() {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
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
