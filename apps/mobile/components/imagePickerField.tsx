import { Image, View, TouchableOpacity, Text } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Button } from "@ant-design/react-native";
import AntDesign from "@expo/vector-icons/AntDesign";

interface ImagePickerFieldProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}

export default function ImagePickerField({
  value,
  onChange,
}: ImagePickerFieldProps) {
  const pickImage = async (sourceType: "library" | "camera") => {
    let result;
    if (sourceType === "library") {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
    } else {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        alert("Sorry, we need camera permissions to make this work!");
        return;
      }
      result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });
    }

    console.log(result);

    if (!result.canceled) {
      onChange(result.assets[0].uri);
    }
  };

  const removeImage = () => {
    onChange(undefined);
  };

  return (
    <View className="flex flex-col items-center justify-center">
      {/* ===== Image picker buttons ===== */}
      {!value && (
        <View className="flex w-full flex-row gap-2">
          <View className="flex-1">
            <Button onPress={() => pickImage("library")}>
              <AntDesign name="picture" size={24} color="black" />
              <Text className="ml-2 text-lg">Camera Roll</Text>
            </Button>
          </View>
          <View className="flex-1">
            <Button onPress={() => pickImage("camera")}>
              <AntDesign name="camerao" size={24} color="black" />
              <Text className="ml-2 text-lg">Take Photo</Text>
            </Button>
          </View>
        </View>
      )}

      {/* ===== Image preview ===== */}
      {value && (
        <>
          <TouchableOpacity onPress={() => pickImage("library")}>
            <Image
              source={{ uri: value }}
              className="mt-2 h-48 w-48 rounded-md border border-gray-300"
            />
          </TouchableOpacity>
          <TouchableOpacity className="my-2" onPress={removeImage}>
            <Text className="text-lg text-blue-500">Remove image</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}
