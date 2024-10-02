import { Image, View, TouchableOpacity, Text } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Button } from "@ant-design/react-native";
import AntDesign from "@expo/vector-icons/AntDesign";
import * as ImageManipulator from "expo-image-manipulator";
import * as FileSystem from "expo-file-system";
import { useState } from "react";

interface ImagePickerFieldProps {
  value: ImagePicker.ImagePickerAsset[] | undefined;
  onChange: (value: ImagePicker.ImagePickerAsset[] | undefined) => void;
}

export default function ImagePickerField({
  value,
  onChange,
}: ImagePickerFieldProps) {
  const [isLoading, setIsLoading] = useState(false);

  const compressImage = async (
    image: ImagePicker.ImagePickerAsset,
  ): Promise<ImagePicker.ImagePickerAsset> => {
    let compressionQuality = 0.7; // Start with 70% quality
    let compressedImage = image;

    while (
      compressedImage.fileSize &&
      compressedImage.fileSize > 2 * 1024 * 1024
    ) {
      const manipulatedImage = await ImageManipulator.manipulateAsync(
        image.uri,
        [{ resize: { width: image.width * 0.9, height: image.height * 0.9 } }],
        {
          compress: compressionQuality,
          format: ImageManipulator.SaveFormat.JPEG,
        },
      );

      compressedImage = {
        ...manipulatedImage,
        fileSize: await getFileSize(manipulatedImage.uri),
      };

      compressionQuality *= 0.9; // Reduce quality by 10% each iteration
      if (compressionQuality < 0.1) break; // Prevent infinite loop
    }

    return compressedImage;
  };

  const getFileSize = async (uri: string): Promise<number> => {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    return fileInfo.exists ? fileInfo.size || 0 : 0;
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      aspect: [4, 3],
      quality: 1,
      allowsMultipleSelection: true,
      selectionLimit: 4,
    });
    setIsLoading(true);

    if (!result.canceled) {
      const compressedImages = await Promise.all(
        result.assets.map(compressImage),
      );
      onChange(compressedImages);
    }
    setIsLoading(false);
  };

  const removeImage = (index: number) => {
    if (value) {
      const newValue = [...value];
      newValue.splice(index, 1);
      onChange(newValue.length > 0 ? newValue : undefined);
    }
  };

  return (
    <View className="flex flex-col items-center justify-center">
      {/* ===== Image picker buttons ===== */}
      {(!value || value.length === 0) && (
        <View className="flex w-full flex-row gap-2">
          <View className="flex-1">
            <Button
              onPress={() => pickImage()}
              loading={isLoading}
              disabled={isLoading}
            >
              <AntDesign name="picture" size={24} color="black" />
              <Text className="ml-2 text-lg">Choose from Camera Roll</Text>
            </Button>
          </View>
        </View>
      )}

      {/* ===== Image preview ===== */}
      {value && value.length > 0 && (
        <View className="flex-row flex-wrap">
          {value.map((image, index) => (
            <View key={index} className="m-2">
              <Image
                source={{ uri: image.uri }}
                className="h-36 w-36 rounded-md border border-gray-300"
              />
              <TouchableOpacity
                className="mt-1"
                onPress={() => removeImage(index)}
              >
                <Text className="text-sm text-blue-500">Remove</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
