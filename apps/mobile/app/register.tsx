import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Link } from "expo-router";

export default function Register() {
  const handleRegister = () => {
    // Implement your registration logic here
  };

  return (
    <View>
      <Text>Register</Text>
      <TextInput placeholder="Email" />
      <TextInput placeholder="Password" secureTextEntry />
      <TextInput placeholder="Confirm Password" secureTextEntry />
      <TouchableOpacity onPress={handleRegister}>
        <Text>Register</Text>
      </TouchableOpacity>
      <Link href="/login">Login</Link>
    </View>
  );
}
