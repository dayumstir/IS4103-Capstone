import { View, Text, ScrollView, TextInput } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Picker } from "@ant-design/react-native";
import { router } from "expo-router";
import ImagePickerField from "../../../../../components/imagePickerField";
import { useCreateIssueMutation } from "../../../../../redux/services/issueService";
import Toast from "react-native-toast-message";
import * as ImagePicker from "expo-image-picker";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../redux/store";
import { IssueCategory } from "@repo/interfaces";
import { useState } from "react";
import { TouchableOpacity } from "react-native";

// Define your Zod schema
const issueSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(50, "Title must be 50 characters or less"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(200, "Description must be 200 characters or less"),
  category: z.nativeEnum(IssueCategory, {
    required_error: "Category is required",
  }),
  merchant_id: z.string().optional(),
  transaction_id: z.string().optional(),
  image: z.array(z.custom<ImagePicker.ImagePickerAsset>()).optional(),
});

export type IssueFormValues = z.infer<typeof issueSchema>;

export default function NewIssue() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IssueFormValues>({
    resolver: zodResolver(issueSchema),
  });

  const [createIssue, { isLoading }] = useCreateIssueMutation();
  const { profile } = useSelector((state: RootState) => state.customer);
  const [categoryVisible, setCategoryVisible] = useState(false);

  const onSubmit = async (data: IssueFormValues) => {
    try {
      const formData = new FormData();
      if (profile?.customer_id) {
        formData.append("customer_id", profile.customer_id.toString());
      }

      formData.append("title", data.title);
      formData.append("category", data.category);
      formData.append("description", data.description);

      // TODO: Auto populate merchant_id and transaction_id if issue is raised from a transaction
      // if (data.merchant_id) formData.append("merchant_id", data.merchant_id);
      // if (data.transaction_id)
      //   formData.append("transaction_id", data.transaction_id);

      if (data.image) {
        data.image.forEach((img, index) => {
          formData.append("images", {
            uri: img.uri,
            type: img.type || "image/png",
            name: img.fileName || `image_${index}.png`,
          } as any);
        });
      }

      await createIssue(formData).unwrap();

      Toast.show({
        type: "success",
        text1: "Issue created successfully",
      });
      router.back();
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "An error occurred. Please try again.",
      });
      console.error(error);
    }
  };

  return (
    <ScrollView>
      <View className="m-4 rounded-lg bg-white p-8">
        <Text className="mb-4 text-2xl font-bold">Raise an Issue</Text>

        <Text className="mb-2 font-semibold">Title</Text>
        <Controller
          control={control}
          name="title"
          render={({ field: { onChange, onBlur, value } }) => (
            <View className="mb-4">
              <TextInput
                className="rounded-md border border-gray-300 p-4 focus:border-blue-500"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                placeholder="Summarise your issue"
              />
              {errors.title && (
                <Text className="mt-1 text-red-500">
                  {errors.title.message}
                </Text>
              )}
            </View>
          )}
        />

        <Text className="mb-2 font-semibold">Category</Text>
        <Controller
          control={control}
          name="category"
          render={({ field: { onChange, value } }) => (
            <View className="mb-4">
              <TouchableOpacity
                className="rounded-md border border-gray-300 p-4 focus:border-blue-500"
                onPress={() => setCategoryVisible(true)}
              >
                <Text>
                  {value
                    ? value.charAt(0).toUpperCase() +
                      value.slice(1).toLowerCase()
                    : "Select Category"}
                </Text>
              </TouchableOpacity>
              <Picker
                data={Object.values(IssueCategory).map((category) => ({
                  value: category,
                  label:
                    category.charAt(0).toUpperCase() +
                    category.slice(1).toLowerCase(),
                }))}
                cols={1}
                onChange={(val) => {
                  onChange(val[0]);
                  setCategoryVisible(false);
                }}
                visible={categoryVisible}
                value={[value]}
                okText="Confirm"
                dismissText="Cancel"
                onDismiss={() => setCategoryVisible(false)}
              />
              {errors.category && (
                <Text className="mt-1 text-red-500">
                  {errors.category.message}
                </Text>
              )}
            </View>
          )}
        />

        <Text className="mb-2 font-semibold">Description</Text>
        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <View className="mb-4">
              <TextInput
                className="rounded-md border border-gray-300 p-4 focus:border-blue-500"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                placeholder="Detailed description of your issue"
                multiline
                numberOfLines={4}
              />
              {errors.description && (
                <Text className="mt-1 text-red-500">
                  {errors.description.message}
                </Text>
              )}
            </View>
          )}
        />

        <Text className="mb-2 font-semibold">
          Upload Images (optional: max 4)
        </Text>
        <Controller
          control={control}
          name="image"
          render={({ field: { onChange, value } }) => (
            <ImagePickerField value={value} onChange={onChange} />
          )}
        />

        <View className="mt-4 flex flex-col gap-4">
          <Button
            type="primary"
            loading={isLoading}
            disabled={isLoading}
            onPress={handleSubmit(onSubmit)}
          >
            <Text className="font-semibold text-white">Submit Issue</Text>
          </Button>
          <Button type="ghost" onPress={() => router.back()}>
            <Text className="font-semibold text-blue-500">Cancel</Text>
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
