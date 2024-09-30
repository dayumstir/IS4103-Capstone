import { View, Image } from "react-native";
import { useLocalSearchParams } from "expo-router";

const ImageViewer = () => {
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();

  return (
    <View className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center">
        <Image
          source={{ uri: imageUri }}
          className="h-full w-full"
          resizeMode="contain"
        />
      </View>
    </View>
  );
};

export default ImageViewer;
